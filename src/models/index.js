const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false,
});

module.exports = { sequelize };

// Import models to set up associations
const User = require('./User');
const Recipe = require('./Recipe');
const Review = require('./Review');

// Associations
User.hasMany(Review);
Review.belongsTo(User);

Recipe.hasMany(Review);
Review.belongsTo(Recipe);
