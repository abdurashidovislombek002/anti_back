// Message modeli
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    chat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'chats', key: 'id' },
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('text'),
      allowNull: false,
      defaultValue: 'text',
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'messages',
    createdAt: 'created_at',
    updatedAt: false,
  }
);

module.exports = Message;