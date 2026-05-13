const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Recipe = sequelize.define('Recipe', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ingredients: {
    type: DataTypes.TEXT, // Store as JSON string
    allowNull: false,
  },
  steps: {
    type: DataTypes.TEXT, // Store as JSON string
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING,
  },
  time: {
    type: DataTypes.STRING,
  },
  servings: {
    type: DataTypes.STRING,
  },
  author: {
    type: DataTypes.STRING,
  },
  video_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cookpad_id: {
    type: DataTypes.STRING,
    unique: true,
  },
  category: {
    type: DataTypes.STRING,
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 4.5,
  }
});

module.exports = Recipe;
