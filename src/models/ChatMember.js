// ChatMember modeli
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ChatMember = sequelize.define(
  'ChatMember',
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    tableName: 'chat_members',
    timestamps: false,
    indexes: [{ unique: true, fields: ['chat_id', 'user_id'] }],
  }
);

module.exports = ChatMember;