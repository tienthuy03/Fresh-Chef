const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});

module.exports = Favorite;
