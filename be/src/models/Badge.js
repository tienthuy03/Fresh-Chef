const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Badge = sequelize.define('Badge', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  iconUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  requiredXp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  conditionType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  conditionValue: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = Badge;
