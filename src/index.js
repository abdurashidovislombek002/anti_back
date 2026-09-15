// Loyihaning kirish nuqtasi (Express + Socket.io serveri)
require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');

const { sequelize } = require('./models');
const { initSocketServer } = require('./sockets/socketHandler');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chats');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// Route'lar
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'antigram-back' });
});

// 404 va xatoliklar
app.use((req, res) => {
  res.status(404).json({ error: 'Route topilmadi' });
});
app.use(errorHandler);

const server = http.createServer(app);
initSocketServer(server);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL bilan ulanish muvaffaqiyatli');

    await sequelize.sync();
    console.log('Database sinxronlandi (jadval yaratildi)');

    server.listen(PORT, () => {
      console.log(`Antigram server ${PORT}-portda ishga tushdi`);
    });
  } catch (err) {
    console.error('Server ishga tushirilmadi:', err);
    process.exit(1);
  }
}

start();