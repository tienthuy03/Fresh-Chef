const { ChefProfile, User, Badge, UserBadge } = require('../models');

/**
 * Calculate level based on XP.
 * Formula: Level = Math.floor(Math.sqrt(XP / 50)) + 1
 */
function calculateLevel(xp) {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

/**
 * Determine title based on level.
 */
function getTitle(level) {
  if (level >= 31) return 'Bếp trưởng huyền thoại 👑';
  if (level >= 16) return 'Đầu bếp chính 👨‍🍳';
  if (level >= 6) return 'Trợ lý đầu bếp 🔪';
  return 'Tập sự 🍳';
}

/**
 * Check and award any unearned badges that the user now qualifies for.
 */
async function checkAndAwardBadges(userId, profile) {
  try {
    const { Op } = require('sequelize');
    
    // Find all badges the user has already earned
    const earnedUserBadges = await UserBadge.findAll({ where: { userId } });
    const earnedBadgeIds = earnedUserBadges.map(ub => ub.badgeId);

    // Find all badges the user hasn't earned yet
    const unearnedBadges = await Badge.findAll({
      where: {
        id: {
          [Op.notIn]: earnedBadgeIds.length > 0 ? earnedBadgeIds : [-1]
        }
      }
    });

    const newlyAwardedBadges = [];

    for (const badge of unearnedBadges) {
      let meetsCondition = false;

      if (badge.conditionType === 'level') {
        meetsCondition = profile.level >= badge.conditionValue;
      } else if (badge.conditionType === 'reviewsWritten') {
        meetsCondition = profile.reviewsWritten >= badge.conditionValue;
      } else if (badge.conditionType === 'recipesCompleted') {
        meetsCondition = profile.recipesCompleted >= badge.conditionValue;
      } else if (badge.requiredXp > 0) {
        meetsCondition = profile.xp >= badge.requiredXp;
      }

      if (meetsCondition) {
        await UserBadge.create({ userId, badgeId: badge.id });
        newlyAwardedBadges.push(badge);
        console.log(`Badge "${badge.name}" awarded to user ID ${userId}`);
      }
    }

    return newlyAwardedBadges;
  } catch (error) {
    console.error('Error checking/awarding badges:', error);
    return [];
  }
}

/**
 * Add XP to a user, handle level ups and titles.
 * @param {number} userId 
 * @param {number} xpAmount 
 * @param {string} action - e.g., 'write_review', 'complete_recipe'
 */
async function awardXp(userId, xpAmount, action = null) {
  try {
    let profile = await ChefProfile.findOne({ where: { userId } });
    if (!profile) {
      profile = await ChefProfile.create({ userId });
      // Trigger check for starter level 1 badge
      await checkAndAwardBadges(userId, profile);
    }

    // Update stats based on action
    if (action === 'write_review') {
      profile.reviewsWritten += 1;
    } else if (action === 'complete_recipe') {
      profile.recipesCompleted += 1;
    }

    // Add XP
    profile.xp += xpAmount;

    // Recalculate level and title
    const newLevel = calculateLevel(profile.xp);
    if (newLevel > profile.level) {
      profile.level = newLevel;
    }
    profile.title = getTitle(profile.level);

    await profile.save();

    // Check and award badges
    await checkAndAwardBadges(userId, profile);

    return profile;
  } catch (err) {
    console.error('Error awarding XP:', err);
    return null;
  }
}

module.exports = {
  calculateLevel,
  getTitle,
  checkAndAwardBadges,
  awardXp
};
