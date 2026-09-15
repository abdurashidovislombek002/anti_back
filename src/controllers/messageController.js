// Message controlleri
const { User, Chat, ChatMember, Message } = require('../models');
const { emitToChat } = require('../sockets/socketHandler');

const ensureMember = async (chatId, userId) => {
  const membership = await ChatMember.findOne({
    where: { chat_id: chatId, user_id: userId },
  });
  if (!membership) {
    const err = new Error('Siz bu chatning a\'zosi emassiz');
    err.status = 403;
    throw err;
  }
};

const touchChat = async (chatId) => {
  const chat = await Chat.findByPk(chatId);
  if (chat) {
    chat.changed('updatedAt', true);
    await chat.save();
  }
};

// GET /api/chats/:chatId/messages
exports.getMessages = async (req, res, next) => {
  try {
    const chatId = Number(req.params.chatId);
    await ensureMember(chatId, req.user.id);

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const messages = await Message.findAll({
      where: { chat_id: chatId },
      order: [['id', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'phone', 'avatar_url'],
        },
      ],
    });

    res.json(messages.reverse());
  } catch (err) {
    next(err);
  }
};

// POST /api/chats/:chatId/messages
exports.createMessage = async (req, res, next) => {
  try {
    const chatId = Number(req.params.chatId);
    await ensureMember(chatId, req.user.id);

    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
    if (!content) {
      return res.status(400).json({ error: 'Xabar matni bo\'sh bo\'lishi mumkin emas' });
    }

    const message = await Message.create({
      chat_id: chatId,
      sender_id: req.user.id,
      content,
      type: 'text',
    });

    await touchChat(chatId);

    const fullMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'phone', 'avatar_url'],
        },
      ],
    });

    emitToChat(chatId, 'new_message', { chatId, message: fullMessage });

    res.status(201).json({ message: fullMessage });
  } catch (err) {
    next(err);
  }
};