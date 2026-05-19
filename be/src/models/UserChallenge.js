const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const UserChallenge = sequelize.define('UserChallenge', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  challengeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Challenges',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  currentProgress: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = UserChallenge;
