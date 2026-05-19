const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const ChefProfile = sequelize.define('ChefProfile', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    defaultValue: 'Tập sự',
    allowNull: false
  },
  recipesCompleted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  reviewsWritten: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
});

module.exports = ChefProfile;
