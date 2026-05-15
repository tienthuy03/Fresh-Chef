const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const ReviewLike = sequelize.define('ReviewLike', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ReviewId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = ReviewLike;
