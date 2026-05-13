const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Favorite, Follow } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               fullName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 */
router.post('/register', async (req, res) => {
  let { username, password, email, fullName, preferences } = req.body;
  
    // Nếu email là chuỗi rỗng hoặc undefined, đổi thành null để tránh lỗi validation unique/isEmail
    const finalEmail = (email === '' || !email) ? null : email;

  try {
    let user = await User.findOne({ where: { username } });
    if (user) {
      return res.status(400).json({
        Success: false,
        Message: 'Username already exists',
        Errors: ['Username already exists'],
      });
    }

    if (finalEmail) {
      const emailUser = await User.findOne({ where: { email: finalEmail } });
      if (emailUser) {
        return res.status(400).json({
          Success: false,
          Message: 'Email already exists',
          Errors: ['Email already exists'],
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ 
      username, 
      password: hashedPassword, 
      email: finalEmail, 
      fullName,
      preferences: preferences ? JSON.stringify(preferences) : null,
      hasCompletedSurvey: !!preferences
    });

    res.status(201).json({
      Success: true,
      Message: 'User registered successfully',
      Data: {
        User: {
          Id: user.id,
          Username: user.username,
          FullName: user.fullName || '',
        }
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    const errors = err.errors ? err.errors.map(e => e.message) : [err.message];
    res.status(400).json({ // Chuyển thành 400 để Frontend hiển thị được nội dung lỗi
      Success: false,
      Message: errors[0] || 'Registration failed',
      Errors: errors,
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Success:
 *                   type: boolean
 *                 Message:
 *                   type: string
 *                 Errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                 Data:
 *                   type: object
 *                   properties:
 *                     Token:
 *                       type: string
 *                     RefreshToken:
 *                       type: string
 *                     Expiration:
 *                       type: string
 *                     User:
 *                       type: object
 *                       properties:
 *                         Id:
 *                           type: integer
 *                         Username:
 *                           type: string
 *                         FullName:
 *                           type: string
 *                 Meta:
 *                   type: string
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`Login attempt for username: ${username}`);
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      console.log(`Login failed: User ${username} not found`);
      return res.status(400).json({
        Success: false,
        Message: 'Invalid credentials',
        Errors: ['Invalid credentials'],
        Data: null,
        Meta: null
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for user ${username}`);
      return res.status(400).json({
        Success: false,
        Message: 'Invalid credentials',
        Errors: ['Invalid credentials'],
        Data: null,
        Meta: null
      });
    }

    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret', { expiresIn: '7d' });

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();
    
    res.json({
      Success: true,
      Message: 'Login successful',
      Errors: [],
      Data: {
        Token: token,
        RefreshToken: refreshToken,
        Expiration: expiration.toISOString(),
        User: {
          Id: user.id,
          Username: user.username,
          FullName: user.fullName || '',
          Preferences: user.preferences ? JSON.parse(user.preferences) : null,
          HasCompletedSurvey: user.hasCompletedSurvey
        }
      },
      Meta: null
    });
  } catch (err) {
    res.status(500).json({
      Success: false,
      Message: 'Server error',
      Errors: [err.message],
      Data: null,
      Meta: null
    });
  }
});

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               username:
 *                 type: string
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.post('/change-password', async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ Success: false, Message: 'User not found', Errors: ['User not found'] });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ Success: false, Message: 'Invalid old password', Errors: ['Invalid old password'] });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ Success: true, Message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error', Errors: [err.message] });
  }
});

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed
 */
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ Success: false, Message: 'Refresh token required' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret');
    const user = await User.findOne({ where: { id: decoded.id, refreshToken } });

    if (!user) return res.status(403).json({ Success: false, Message: 'Invalid refresh token' });

    const newToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);

    res.json({
      Success: true,
      Data: {
        Token: newToken,
        Expiration: expiration.toISOString()
      }
    });
  } catch (err) {
    res.status(403).json({ Success: false, Message: 'Token expired or invalid' });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ Success: true, Message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/auth/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               diets:
 *                 type: array
 *                 items:
 *                   type: string
 *               timeLimit:
 *                 type: string
 *               householdSize:
 *                 type: integer
 *               budgetRange:
 *                 type: string
 *     responses:
 *       200:
 *         description: Preferences updated
 */
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ Success: false, Message: 'User not found' });

    user.preferences = JSON.stringify(req.body);
    await user.save();

    res.json({
      Success: true,
      Message: 'Preferences updated successfully',
      Data: req.body
    });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error', Errors: [err.message] });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) return res.status(404).json({ Success: false, Message: 'User not found' });

    // Fetch stats
    const followerCount = await user.countFollowers();
    const followingCount = await user.countFollowing();

    res.json({
      Success: true,
      Data: {
        ...user.toJSON(),
        preferences: user.preferences ? JSON.parse(user.preferences) : null,
        Stats: {
          Followers: followerCount,
          Following: followingCount,
          Recipes: user.sharedRecipesCount
        }
      }
    });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error', Errors: [err.message] });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, bio, avatar } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({ Success: false, Message: 'User not found' });

    if (fullName) user.fullName = fullName;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      Success: true,
      Message: 'Profile updated successfully',
      Data: {
        Id: user.id,
        FullName: user.fullName,
        Bio: user.bio,
        Avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

module.exports = router;
