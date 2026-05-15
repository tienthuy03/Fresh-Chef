const express = require('express');
const multer = require('multer');
const path = require('path');
const { Review, User, Recipe, Follow, ReviewLike, Comment } = require('../models');
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

const optionalAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return next();
  return auth(req, res, next);
};

/**
 * @swagger
 * /api/community/feed:
 *   get:
 *     summary: Get community reviews (following or discover)
 *     tags: [Community]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [discover, following]
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/feed', optionalAuth, async (req, res) => {
  try {
    const { type = 'discover' } = req.query;
    let whereClause = {};

    if (type === 'following' && req.user) {
      const following = await Follow.findAll({
        where: { followerId: req.user.id },
        attributes: ['followingId']
      });
      const followingIds = following.map(f => f.followingId);
      whereClause = { UserId: followingIds };
    }

    const reviews = await Review.findAll({
      where: whereClause,
      limit: 20,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, attributes: ['id', 'username', 'fullName', 'avatar'] },
        { model: Recipe, attributes: ['title', 'id'] }
      ]
    });

    // Check if current user liked these reviews
    let likedReviewIds = [];
    if (req.user) {
      const likes = await ReviewLike.findAll({
        where: { UserId: req.user.id, ReviewId: reviews.map(r => r.id) }
      });
      likedReviewIds = likes.map(l => l.ReviewId);
    }

    res.json({
      Success: true,
      Data: reviews.map(rev => {
        let parsedImages = [];
        try {
          parsedImages = rev.images ? JSON.parse(rev.images) : [];
          if (!Array.isArray(parsedImages)) parsedImages = [];
        } catch (e) {
          parsedImages = [];
        }
        
        return {
          ...rev.toJSON(),
          images: parsedImages,
          comments: rev.commentsCount || 0,
          isLiked: likedReviewIds.includes(rev.id)
        };
      })
    });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error', Errors: [err.message] });
  }
});

/**
 * @swagger
 * /api/community/users:
 *   get:
 *     summary: Get list of users to discover
 *     tags: [Community]
 */
router.get('/users', optionalAuth, async (req, res) => {
  try {
    const whereClause = {};
    if (req.user) {
      const { Op } = require('sequelize');
      whereClause.id = { [Op.ne]: req.user.id }; // Exclude current user
    }

    const users = await User.findAll({
      where: whereClause,
      limit: 10,
      attributes: ['id', 'username', 'fullName', 'avatar', 'bio']
    });

    res.json({
      Success: true,
      Data: users
    });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
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
      include: [{ model: User, attributes: ['id', 'username', 'fullName', 'avatar'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      Success: true,
      Data: reviews.map(rev => {
        let parsedImages = [];
        try {
          parsedImages = rev.images ? JSON.parse(rev.images) : [];
        } catch (e) {
          parsedImages = [];
        }
        return {
          ...rev.toJSON(),
          images: parsedImages,
          comments: rev.commentsCount || 0
        };
      })
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

/**
 * @swagger
 * /api/community/reviews/{reviewId}/like:
 *   post:
 *     summary: Like/Unlike a review (Toggle)
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 */
router.post('/reviews/:reviewId/like', auth, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.reviewId);
    if (!review) return res.status(404).json({ Success: false, Message: 'Review not found' });

    const existingLike = await ReviewLike.findOne({
      where: { UserId: req.user.id, ReviewId: req.params.reviewId }
    });

    if (existingLike) {
      await existingLike.destroy();
      review.likes = Math.max(0, review.likes - 1);
      await review.save();
      res.json({ Success: true, Message: 'Unliked review', Likes: review.likes, IsLiked: false });
    } else {
      await ReviewLike.create({ UserId: req.user.id, ReviewId: req.params.reviewId });
      review.likes += 1;
      await review.save();
      res.json({ Success: true, Message: 'Liked review', Likes: review.likes, IsLiked: true });
    }
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/community/reviews/{reviewId}/share:
 *   post:
 *     summary: Track sharing of a review
 *     tags: [Community]
 */
router.post('/reviews/:reviewId/share', async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.reviewId);
    if (!review) return res.status(404).json({ Success: false, Message: 'Review not found' });

    // Mock share count increment
    // You might want to add a 'shares' column to Review model if you want to persist this
    res.json({ Success: true, Message: 'Shared successfully' });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/community/reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/reviews/:reviewId', auth, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.reviewId);
    if (!review) return res.status(404).json({ Success: false, Message: 'Review not found' });

    if (review.UserId !== req.user.id) {
      return res.status(403).json({ Success: false, Message: 'Unauthorized' });
    }

    await review.destroy();
    res.json({ Success: true, Message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/community/reviews/{reviewId}:
 *   put:
 *     summary: Update a review
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 */
router.put('/reviews/:reviewId', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { content, rating, existingImages } = req.body;
    const review = await Review.findByPk(req.params.reviewId);
    
    if (!review) return res.status(404).json({ Success: false, Message: 'Review not found' });
    if (review.UserId !== req.user.id) {
      return res.status(403).json({ Success: false, Message: 'Unauthorized' });
    }

    const updateData = { content, rating };
    
    // Process images
    let finalImages = [];
    
    // Start with existing images if provided
    if (existingImages) {
      try {
        finalImages = JSON.parse(existingImages);
      } catch (e) {
        finalImages = [];
      }
    }

    // Add new uploaded images
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(f => `/uploads/${f.filename}`);
      finalImages = [...finalImages, ...newImagePaths];
    }

    // Update images field as JSON string
    updateData.images = JSON.stringify(finalImages);

    await review.update(updateData);
    
    res.json({ 
      Success: true, 
      Message: 'Review updated successfully', 
      Data: {
        ...review.toJSON(),
        images: finalImages
      } 
    });
  } catch (err) {
    console.error('Update review error:', err);
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/community/reviews/{reviewId}/comments:
 *   post:
 *     summary: Post a comment on a review
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 */
router.post('/reviews/:reviewId/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ Success: false, Message: 'Content is required' });

    const review = await Review.findByPk(req.params.reviewId);
    if (!review) return res.status(404).json({ Success: false, Message: 'Review not found' });

    const comment = await Comment.create({
      content,
      UserId: req.user.id,
      ReviewId: req.params.reviewId
    });

    // Update comment count
    review.commentsCount += 1;
    await review.save();

    res.status(201).json({ Success: true, Message: 'Comment posted', Data: comment });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/community/reviews/{reviewId}/comments:
 *   get:
 *     summary: Get all comments for a review
 *     tags: [Community]
 */
router.get('/reviews/:reviewId/comments', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { ReviewId: req.params.reviewId },
      include: [{ model: User, attributes: ['username', 'fullName', 'avatar'] }],
      order: [['createdAt', 'ASC']]
    });
    res.json({ Success: true, Data: comments });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

module.exports = router;
