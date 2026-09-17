// Messages routelari
const router = require('express').Router({ mergeParams: true });
const auth = require('../middleware/auth');
const { getMessages, createMessage } = require('../controllers/messageController');

router.get('/', auth, getMessages);
router.post('/', auth, createMessage);

module.exports = router;