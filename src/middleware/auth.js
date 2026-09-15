// JWT autentifikatsiya middleware'i
const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token topilmadi' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Yaroqsiz yoki eskirgan token' });
  }
};