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

module.exports = router;
