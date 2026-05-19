const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Challenge = sequelize.define('Challenge', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  xpReward: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 150
  },
  targetType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targetValue: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Challenge;
