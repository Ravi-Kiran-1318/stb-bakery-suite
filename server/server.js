require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const socketInit = require('./utils/socket').init;
const seedAdmin = require('./utils/seedAdmin');
const http = require('http');

// Connect to Database
connectDB().then(() => {
  seedAdmin();
});

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketInit(server);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth'));
// app.use('/api/products', require('./routes/products'));
// app.use('/api/orders', require('./routes/orders'));
// app.use('/api/notifications', require('./routes/notifications'));
// app.use('/api/payments', require('./routes/payments'));
// app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
