// Auth controlleri
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { User } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, phone, password } = req.body;

    const existing = await User.findOne({
      where: { [Op.or]: [{ username }, { phone }] },
      paranoid: false,
    });

    if (existing) {
      return res.status(409).json({ error: 'Bu username yoki telefon raqami band' });
    }

    await User.create({ username, phone, password });

    const createdUser = await User.findOne({ where: { username } });

    const token = generateToken(createdUser);
    res.status(201).json({ token, user: createdUser });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { username, phone, password } = req.body;

    if ((!username && !phone) || !password) {
      return res.status(400).json({ error: 'username yoki phone hamda password kiritilishi shart' });
    }

    const conditions = [];
    if (username) conditions.push({ username });
    if (phone) conditions.push({ phone });

    const user = await User.unscoped().findOne({ where: { [Op.or]: conditions } });

    if (!user || !user.comparePassword(password)) {
      return res.status(401).json({ error: 'Noto\'g\'ri ma\'lumotlar kiritildi' });
    }

    const token = generateToken(user);
    const safeUser = user.toJSON();
    delete safeUser.password;

    res.json({ token, user: safeUser });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.me = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
};