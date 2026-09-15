// Model eksportlari va assotsiatsiyalar
const sequelize = require('../config/db');
const User = require('./User');
const Chat = require('./Chat');
const ChatMember = require('./ChatMember');
const Message = require('./Message');

// User <-> Chat many-to-many (ChatMember orqali)
User.belongsToMany(Chat, {
  through: ChatMember,
  foreignKey: 'user_id',
  otherKey: 'chat_id',
  as: 'chats',
});
Chat.belongsToMany(User, {
  through: ChatMember,
  foreignKey: 'chat_id',
  otherKey: 'user_id',
  as: 'members',
});
ChatMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
ChatMember.belongsTo(Chat, { foreignKey: 'chat_id', as: 'chat' });

// Message assotsiatsiyalari
Message.belongsTo(Chat, { foreignKey: 'chat_id', as: 'chat' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Chat.hasMany(Message, { foreignKey: 'chat_id', as: 'messages' });
User.hasMany(Message, { foreignKey: 'sender_id', as: 'messages' });

module.exports = { sequelize, User, Chat, ChatMember, Message };