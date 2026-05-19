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

    // Optionally check for badges here...

    return profile;
  } catch (err) {
    console.error('Error awarding XP:', err);
    return null;
  }
}

module.exports = {
  calculateLevel,
  getTitle,
  awardXp
};
