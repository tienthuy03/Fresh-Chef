const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const ShoppingItem = sequelize.define('ShoppingItem', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  checked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = ShoppingItem;
