const express = require('express');
const multer = require('multer');
const path = require('path');
const { Review, User, Recipe, Follow } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/**
 * @swagger
 * /api/community/reviews:
 *   post:
 *     summary: Post a review for a recipe with images
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               recipeId:
 *                 type: integer
 *               content:
 *                 type: string
 *               rating:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Review posted
 */
router.post('/reviews', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { recipeId, content, rating } = req.body;
    const imagePaths = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const review = await Review.create({
      content,
      rating,
      images: JSON.stringify(imagePaths),
      UserId: req.user.id,
      RecipeId: recipeId
    });

    res.status(201).json({
      Success: true,
      Message: 'Review posted successfully',
      Data: review
    });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error', Errors: [err.message] });
  }
});

/**
 * @swagger
 * /api/community/feed:
 *   get:
 *     summary: Get latest community reviews (UGC feed)
 *     tags: [Community]
 *     responses:
 *       200:
 *         description: List of latest reviews
 */
router.get('/feed', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      limit: 20,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, attributes: ['username', 'fullName'] },
        { model: Recipe, attributes: ['title', 'id'] }
      ]
    });

    res.json({
      Success: true,
      Data: reviews.map(rev => ({
        ...rev.toJSON(),
        images: rev.images ? JSON.parse(rev.images) : []
      }))
    });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error', Errors: [err.message] });
  }
});

/**
 * @swagger
 * /api/community/recipes/{recipeId}/reviews:
 *   get:
 *     summary: Get reviews for a specific recipe
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/recipes/:recipeId/reviews', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { RecipeId: req.params.recipeId },
      include: [{ model: User, attributes: ['username', 'fullName'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      Success: true,
      Data: reviews.map(rev => ({
        ...rev.toJSON(),
        images: rev.images ? JSON.parse(rev.images) : []
      }))
    });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/community/follow/{userId}:
 *   post:
 *     summary: Follow/Unfollow a user
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 */
router.post('/follow/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    if (targetUserId == currentUserId) {
      return res.status(400).json({ Success: false, Message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findByPk(targetUserId);
    const currentUser = await User.findByPk(currentUserId);

    if (!userToFollow) return res.status(404).json({ Success: false, Message: 'User not found' });

    const isFollowing = await currentUser.hasFollowing(userToFollow);
    if (isFollowing) {
      await currentUser.removeFollowing(userToFollow);
      res.json({ Success: true, Message: 'Unfollowed user', Following: false });
    } else {
      await currentUser.addFollowing(userToFollow);
      res.json({ Success: true, Message: 'Followed user', Following: true });
    }
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

module.exports = router;
