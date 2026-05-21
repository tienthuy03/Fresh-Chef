const express = require('express');
const auth = require('../middleware/auth');
const { ChefProfile, UserBadge, Badge, Challenge, UserChallenge } = require('../models');

const router = express.Router();

/**
 * @swagger
 * /api/gamification/profile:
 *   get:
 *     summary: Get the user's gamification profile (XP, Level, Badges)
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', auth, async (req, res) => {
  try {
    let profile = await ChefProfile.findOne({ where: { userId: req.user.id } });
    
    // Auto-create if not exists
    if (!profile) {
      profile = await ChefProfile.create({ userId: req.user.id });
    }

    const { User } = require('../models');
    
    // Get earned badges by querying User and including Badges
    const userWithBadges = await User.findByPk(req.user.id, {
      include: [{ model: Badge, as: 'Badges' }]
    });
    const earnedBadges = userWithBadges ? userWithBadges.Badges : [];

    // Calculate XP for next level
    // level = sqrt(xp / 50) + 1
    // xp = 50 * (level - 1)^2
    const currentLevelXp = 50 * Math.pow((profile.level - 1), 2);
    const nextLevelXp = 50 * Math.pow(profile.level, 2);
    const xpProgress = profile.xp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;

    res.json({
      Success: true,
      Data: {
        profile,
        earnedBadges,
        progress: {
          currentXp: profile.xp,
          nextLevelXp,
          xpNeededForNextLevel: xpNeeded,
          percentComplete: Math.min(100, Math.round((xpProgress / xpNeeded) * 100))
        }
      }
    });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error', Errors: [err.message] });
  }
});

/**
 * @swagger
 * /api/gamification/badges:
 *   get:
 *     summary: Get all badges with earned status for the user
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 */
router.get('/badges', auth, async (req, res) => {
  try {
    // 1. Get all badges
    const allBadges = await Badge.findAll({ order: [['requiredXp', 'ASC'], ['id', 'ASC']] });

    // 2. Get user's earned badges
    const earnedUserBadges = await UserBadge.findAll({ where: { userId: req.user.id } });
    const earnedBadgeMap = {};
    earnedUserBadges.forEach(ub => {
      earnedBadgeMap[ub.badgeId] = ub.earnedAt;
    });

    // 3. Map badges with isEarned
    const badgesWithStatus = allBadges.map(badge => {
      const earnedAt = earnedBadgeMap[badge.id];
      return {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        iconUrl: badge.iconUrl,
        requiredXp: badge.requiredXp,
        conditionType: badge.conditionType,
        conditionValue: badge.conditionValue,
        isEarned: !!earnedAt,
        earnedAt: earnedAt || null
      };
    });

    res.json({
      Success: true,
      Data: badgesWithStatus
    });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error', Errors: [err.message] });
  }
});

/**
 * @swagger
 * /api/gamification/test-xp:
 *   post:
 *     summary: Award test XP to the user (For testing level ups & badges)
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: integer
 *                 default: 100
 */
router.post('/test-xp', auth, async (req, res) => {
  try {
    const { amount = 100 } = req.body;
    const { awardXp } = require('../utils/gamificationHelper');

    // Award XP
    const updatedProfile = await awardXp(req.user.id, amount);

    if (!updatedProfile) {
      return res.status(400).json({ Success: false, Message: 'Failed to award XP' });
    }

    res.json({
      Success: true,
      Message: `Successfully awarded ${amount} test XP!`,
      Data: updatedProfile
    });
  } catch (err) {
    res.status(500).json({ Success: false, Message: 'Server error', Errors: [err.message] });
  }
});

module.exports = router;
