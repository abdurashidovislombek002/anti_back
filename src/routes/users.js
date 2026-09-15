// Users routelari
const router = require('express').Router();
const auth = require('../middleware/auth');
const { searchUsers } = require('../controllers/userController');

router.get('/', auth, searchUsers);

module.exports = router;