let io;

// Build allowed origins list from env (mirrors Express CORS)
const getAllowedOrigins = () =>
  (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

module.exports = {
  init: (httpServer) => {
    io = require('socket.io')(httpServer, {
      cors: {
        // Must use explicit origin function (not '*') when credentials: true
        origin: (origin, callback) => {
          const allowed = getAllowedOrigins();
          if (!origin || allowed.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error(`Socket CORS: origin '${origin}' not allowed`));
          }
        },
        credentials: true,
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join_room', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined room user_${userId}`);
      });

      socket.on('join_admin', () => {
        socket.join('admin');
        console.log(`Socket ${socket.id} joined admin room`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
  emitToAdmin: (event, data) => {
    if (io) {
      io.to('admin').emit(event, data);
    }
  },
  emitToUser: (userId, event, data) => {
    if (io) {
      io.to(`user_${userId}`).emit(event, data);
    }
  },
};
