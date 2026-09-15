// Chat controlleri
const { Op } = require('sequelize');
const { sequelize, User, Chat, ChatMember, Message } = require('../models');

const memberInclude = () => ({
  model: User,
  as: 'members',
  through: { attributes: [] },
  attributes: ['id', 'username', 'phone', 'avatar_url', 'is_online', 'last_seen'],
});

const lastMessageInclude = () => ({
  model: Message,
  as: 'messages',
  separate: true,
  limit: 1,
  order: [['id', 'DESC']],
  include: [
    {
      model: User,
      as: 'sender',
      attributes: ['id', 'username', 'phone', 'avatar_url'],
    },
  ],
});

const formatChat = (chat, currentUserId) => ({
  id: chat.id,
  type: chat.type,
  createdAt: chat.createdAt,
  updatedAt: chat.updatedAt,
  peer: chat.members.find((m) => m.id !== currentUserId) || null,
  lastMessage: chat.messages && chat.messages.length > 0 ? chat.messages[0] : null,
});

// GET /api/chats
exports.getChats = async (req, res, next) => {
  try {
    const memberships = await ChatMember.findAll({
      where: { user_id: req.user.id },
      attributes: ['chat_id'],
    });

    if (memberships.length === 0) {
      return res.json([]);
    }

    const chatIds = memberships.map((m) => m.chat_id);

    const chats = await Chat.findAll({
      where: { id: { [Op.in]: chatIds } },
      include: [memberInclude(), lastMessageInclude()],
      order: [['updatedAt', 'DESC']],
    });

    res.json(chats.map((chat) => formatChat(chat, req.user.id)));
  } catch (err) {
    next(err);
  }
};

// POST /api/chats
exports.createChat = async (req, res, next) => {
  try {
    const userId = Number(req.body.userId);

    if (!userId) {
      return res.status(400).json({ error: 'userId kiritilishi shart' });
    }
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'O\'zingiz bilan chat yaratib bo\'lmaydi' });
    }

    const otherUser = await User.findByPk(userId);
    if (!otherUser) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    // Mavjud private chatni qidirish
    const [myMemberships, otherMemberships] = await Promise.all([
      ChatMember.findAll({ where: { user_id: req.user.id }, attributes: ['chat_id'] }),
      ChatMember.findAll({ where: { user_id: userId }, attributes: ['chat_id'] }),
    ]);

    const mySet = new Set(myMemberships.map((m) => m.chat_id));
    const otherSet = new Set(otherMemberships.map((m) => m.chat_id));

    for (const chatId of mySet) {
      if (otherSet.has(chatId)) {
        const count = await ChatMember.count({ where: { chat_id: chatId } });
        const chat = await Chat.findByPk(chatId, { include: [memberInclude()] });
        if (chat && chat.type === 'private' && count === 2) {
          return res.status(200).json({ chat: formatChat(chat, req.user.id) });
        }
      }
    }

    // Yangi chat yaratish
    const chat = await sequelize.transaction(async (t) => {
      const newChat = await Chat.create({ type: 'private' }, { transaction: t });
      await ChatMember.bulkCreate(
        [
          { chat_id: newChat.id, user_id: req.user.id },
          { chat_id: newChat.id, user_id: userId },
        ],
        { transaction: t }
      );
      return newChat;
    });

    const fullChat = await Chat.findByPk(chat.id, { include: [memberInclude()] });
    res.status(201).json({ chat: formatChat(fullChat, req.user.id) });
  } catch (err) {
    next(err);
  }
};