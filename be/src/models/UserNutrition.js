const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const UserNutrition = sequelize.define('UserNutrition', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  weight: {
    type: DataTypes.FLOAT, // kg
    allowNull: false,
  },
  height: {
    type: DataTypes.FLOAT, // cm
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING, // 'male' | 'female'
    allowNull: false,
  },
  activityLevel: {
    type: DataTypes.STRING, // 'sedentary' | 'light' | 'moderate' | 'active'
    allowNull: false,
  },
  goal: {
    type: DataTypes.STRING, // 'lose_weight' | 'maintain' | 'gain_weight'
    allowNull: false,
  },
  targetCalories: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  targetProtein: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  targetCarbs: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  targetFat: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = UserNutrition;
