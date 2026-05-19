const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const UserBadge = sequelize.define('UserBadge', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  badgeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Badges',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  earnedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = UserBadge;
