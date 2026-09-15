// Chat modeli
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Chat = sequelize.define(
  'Chat',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM('private'),
      allowNull: false,
      defaultValue: 'private',
    },
  },
  {
    tableName: 'chats',
  }
);

module.exports = Chat;