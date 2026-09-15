// Socket.io real-time xabar logikasi
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, Chat, ChatMember, Message } = require('../models');

let io = null;

// REST controllerlardan ham real-time yuborish uchun
function emitToChat(chatId, event, data) {
  if (!io) return;
  io.to(`chat:${chatId}`).emit(event, data);
}

async function touchChat(chatId) {
  const chat = await Chat.findByPk(chatId);
  if (chat) {
    chat.changed('updatedAt', true);
    await chat.save();
  }
}

function initSocketServer(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  // Socket.io auth middleware (JWT)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Token topilmadi'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return next(new Error('Foydalanuvchi topilmadi'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Yaroqsiz yoki eskirgan token'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;

    // Online holatni yangilash
    await user.update({ is_online: true });
    socket.join(`user:${user.id}`);
    io.emit('user:presence', {
      userId: user.id,
      is_online: true,
      last_seen: new Date(),
    });

    socket.on('join_chat', (chatId) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on('send_message', async (payload) => {
      try {
        const chatId = Number(payload && payload.chatId);
        const content =
          typeof payload.content === 'string' ? payload.content.trim() : '';

        if (!chatId || !content) return;

        const membership = await ChatMember.findOne({
          where: { chat_id: chatId, user_id: user.id },
        });
        if (!membership) {
          return socket.emit('socket_error', { message: 'Siz bu chatga a\'zo emassiz' });
        }

        const message = await Message.create({
          chat_id: chatId,
          sender_id: user.id,
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

        io.to(`chat:${chatId}`).emit('new_message', { chatId, message: fullMessage });

        if (payload.ackId) {
          socket.emit('message_sent', { ackId: payload.ackId, chatId, message: fullMessage });
        }
      } catch (err) {
        console.error('send_message xatosi:', err);
        socket.emit('socket_error', { message: 'Xabar saqlanmadi' });
      }
    });

    socket.on('typing', (payload) => {
      const chatId = Number(payload && payload.chatId);
      if (!chatId) return;
      socket.to(`chat:${chatId}`).emit('typing', {
        chatId,
        userId: user.id,
        username: user.username,
        isTyping: true,
      });
    });

    socket.on('stop_typing', (payload) => {
      const chatId = Number(payload && payload.chatId);
      if (!chatId) return;
      socket.to(`chat:${chatId}`).emit('typing', {
        chatId,
        userId: user.id,
        username: user.username,
        isTyping: false,
      });
    });

    socket.on('disconnect', async () => {
      try {
        await user.update({ is_online: false, last_seen: new Date() });
      } catch (err) {
        console.error('disconnect xatosi:', err);
      }
      io.emit('user:presence', {
        userId: user.id,
        is_online: false,
        last_seen: new Date(),
      });
    });
  });

  return io;
}

module.exports = { initSocketServer, emitToChat };