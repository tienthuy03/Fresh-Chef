const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Comment = sequelize.define('Comment', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = Comment;
