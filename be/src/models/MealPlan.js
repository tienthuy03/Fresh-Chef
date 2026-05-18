const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const MealPlan = sequelize.define('MealPlan', {
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  mealType: {
    type: DataTypes.ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack'),
    allowNull: false,
  },
});

module.exports = MealPlan;
