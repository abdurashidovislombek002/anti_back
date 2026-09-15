// Chats routelari
const router = require('express').Router();
const auth = require('../middleware/auth');
const { getChats, createChat } = require('../controllers/chatController');
const messagesRouter = require('./messages');

router.use('/:chatId/messages', messagesRouter);

router.get('/', auth, getChats);
router.post('/', auth, createChat);

module.exports = router;