// User controlleri
const { Op } = require('sequelize');
const { User } = require('../models');

// GET /api/users?q=...
exports.searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const where = {};

    if (q) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${q}%` } },
        { phone: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const users = await User.findAll({
      where,
      limit: 20,
      order: [['username', 'ASC']],
    });

    res.json(users);
  } catch (err) {
    next(err);
  }
};