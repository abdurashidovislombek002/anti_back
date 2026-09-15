// User modeli
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_online: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    last_seen: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
  }
);

User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.prototype.comparePassword = function (plainPassword) {
  return bcrypt.compareSync(plainPassword, this.password);
};

module.exports = User;