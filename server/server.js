require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const socketInit = require('./utils/socket').init;
const seedAdmin = require('./utils/seedAdmin');
const http = require('http');

const cron = require('node-cron');
const User = require('./models/User');
const Notification = require('./models/Notification');
const { sendOccasionReminderEmail } = require('./utils/mailer');

// Connect to Database
connectDB().then(() => {
  seedAdmin();
  
  // Setup Occasion Reminders Cron Job (Daily at 9:00 AM)
  cron.schedule('0 9 * * *', async () => {
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 2);
      const targetMMDD = `${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
      
      const usersWithReminders = await User.find({
        'occasionReminders': {
          $elemMatch: {
            date: targetMMDD,
            reminderSent: false
          }
        }
      });

      for (const user of usersWithReminders) {
        for (const reminder of user.occasionReminders) {
          if (reminder.date === targetMMDD && !reminder.reminderSent) {
            // Create Notification
            await Notification.create({
              userId: user._id,
              type: 'order_status', // using existing type or could be a new one
              message: `${reminder.label} is in 2 days! Don't forget to order your cake 🎂`,
              actionTab: 'reminders'
            });
            
            // Send Email
            if (user.email) {
              await sendOccasionReminderEmail(user, reminder);
            }

            reminder.reminderSent = true;
          }
        }
        await user.save();
      }
      console.log('Daily reminder job completed.');
    } catch (err) {
      console.error('Error running daily reminder job:', err);
    }
  });
});

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketInit(server);

// Allowed origins — read from env, supports comma-separated list for multi-env
const ALLOWED_ORIGINS = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));
// Ensure pre-flight OPTIONS requests are handled for all routes
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/payments', require('./routes/payments'));
// app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
