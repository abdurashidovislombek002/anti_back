// Auth routelari
const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, me } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post(
  '/register',
  [
    body('username')
      .trim()
      .notEmpty()
      .isLength({ min: 3, max: 30 })
      .withMessage('username 3-30 belgi bo\'lishi kerak'),
    body('phone').trim().notEmpty().isLength({ min: 7 }).withMessage('Telefon raqam noto\'g\'ri'),
    body('password').isLength({ min: 6 }).withMessage('Parol kamida 6 belgi bo\'lishi kerak'),
  ],
  register
);

router.post('/login', login);

router.get('/me', auth, me);

module.exports = router;