const { Sequelize } = require('sequelize');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL;

const usePostgresSsl =
  process.env.DB_SSL === 'true' ||
  /neon\.tech|render\.com|supabase\.co|sslmode=require/i.test(databaseUrl || '');

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: usePostgresSsl
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../../database.sqlite'),
      logging: false,
    });

module.exports = { sequelize };

// Import models
const User = require('./User');
const Recipe = require('./Recipe');
const Review = require('./Review');
const Favorite = require('./Favorite');
const ShoppingItem = require('./ShoppingItem');
const Follow = require('./Follow');
const ReviewLike = require('./ReviewLike');
const Comment = require('./Comment');
const MealPlan = require('./MealPlan');
const SavedShoppingList = require('./SavedShoppingList');
const UserNutrition = require('./UserNutrition');

// --- ASSOCIATIONS ---

// User <-> Review
User.hasMany(Review);
Review.belongsTo(User);

// Recipe <-> Review
Recipe.hasMany(Review);
Review.belongsTo(Recipe);

// User <-> Comment
User.hasMany(Comment);
Comment.belongsTo(User);

// Review <-> Comment
Review.hasMany(Comment);
Comment.belongsTo(Review);

// User <-> Recipe (Favorites) - Many-to-Many
User.belongsToMany(Recipe, { through: Favorite, as: 'FavoriteRecipes' });
Recipe.belongsToMany(User, { through: Favorite, as: 'FavoritedBy' });

// User <-> Review (Likes) - Many-to-Many
User.belongsToMany(Review, { through: ReviewLike, as: 'LikedReviews' });
Review.belongsToMany(User, { through: ReviewLike, as: 'LikedByUsers' });

// User <-> ShoppingItem
User.hasMany(ShoppingItem);
ShoppingItem.belongsTo(User);

// User <-> SavedShoppingList
User.hasMany(SavedShoppingList);
SavedShoppingList.belongsTo(User);

// User <-> User (Follows) - Many-to-Many
User.belongsToMany(User, {
  through: Follow,
  as: 'Followers',
  foreignKey: 'followingId',
  otherKey: 'followerId',
});
User.belongsToMany(User, {
  through: Follow,
  as: 'Following',
  foreignKey: 'followerId',
  otherKey: 'followingId',
});

// User <-> MealPlan
User.hasMany(MealPlan, { foreignKey: 'userId' });
MealPlan.belongsTo(User, { foreignKey: 'userId' });

// Recipe <-> MealPlan
Recipe.hasMany(MealPlan, { foreignKey: 'recipeId' });
MealPlan.belongsTo(Recipe, { foreignKey: 'recipeId' });

// User <-> UserNutrition
User.hasOne(UserNutrition, { foreignKey: 'userId' });
UserNutrition.belongsTo(User, { foreignKey: 'userId' });

// --- GAMIFICATION ASSOCIATIONS ---
const ChefProfile = require('./ChefProfile');
const Badge = require('./Badge');
const UserBadge = require('./UserBadge');
const Challenge = require('./Challenge');
const UserChallenge = require('./UserChallenge');

// User <-> ChefProfile
User.hasOne(ChefProfile, { foreignKey: 'userId' });
ChefProfile.belongsTo(User, { foreignKey: 'userId' });

// User <-> Badge
User.belongsToMany(Badge, { through: UserBadge, as: 'Badges', foreignKey: 'userId', otherKey: 'badgeId' });
Badge.belongsToMany(User, { through: UserBadge, as: 'Users', foreignKey: 'badgeId', otherKey: 'userId' });

// User <-> Challenge
User.belongsToMany(Challenge, { through: UserChallenge, as: 'Challenges', foreignKey: 'userId', otherKey: 'challengeId' });
Challenge.belongsToMany(User, { through: UserChallenge, as: 'Users', foreignKey: 'challengeId', otherKey: 'userId' });

// Re-export all models for easier access
module.exports = {
  sequelize,
  User,
  Recipe,
  Review,
  Favorite,
  ShoppingItem,
  Follow,
  ReviewLike,
  Comment,
  MealPlan,
  SavedShoppingList,
  UserNutrition,
  ChefProfile,
  Badge,
  UserBadge,
  Challenge,
  UserChallenge,
};
