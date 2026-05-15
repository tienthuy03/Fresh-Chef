const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
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

// User <-> User (Follows) - Many-to-Many
User.belongsToMany(User, { 
  through: Follow, 
  as: 'Followers', 
  foreignKey: 'followingId', 
  otherKey: 'followerId' 
});
User.belongsToMany(User, { 
  through: Follow, 
  as: 'Following', 
  foreignKey: 'followerId', 
  otherKey: 'followingId' 
});

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
  Comment
};
