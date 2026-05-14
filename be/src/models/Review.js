const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Review = sequelize.define('Review', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  images: {
    type: DataTypes.TEXT, // Store JSON array of image paths
    allowNull: true,
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = Review;
