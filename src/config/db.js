// Database konfiguratsiyasi
require('dotenv').config();

const { Sequelize } = require('sequelize');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL .env faylida topilmadi');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development',
});

module.exports = sequelize;