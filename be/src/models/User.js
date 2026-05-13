const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sharedRecipesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  preferences: {
    type: DataTypes.TEXT, // Store as JSON string
    allowNull: true,
  },
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hasCompletedSurvey: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = User;
