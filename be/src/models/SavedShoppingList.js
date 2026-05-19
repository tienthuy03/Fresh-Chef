const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const SavedShoppingList = sequelize.define('SavedShoppingList', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  items: {
    type: DataTypes.TEXT, // Stores stringified JSON array of ingredients: [{ name, quantity }]
    allowNull: false,
  },
});

module.exports = SavedShoppingList;
