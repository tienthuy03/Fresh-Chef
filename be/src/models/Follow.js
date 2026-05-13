const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});

module.exports = Follow;
