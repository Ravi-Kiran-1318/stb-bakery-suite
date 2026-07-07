const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const user = new User({
      name: 'Test',
      email: 'test@example.com',
      mobile: '1234567890',
      firebaseUid: '123'
    });
    await user.validate();
    console.log('Validation passed!');
  } catch (err) {
    console.error('Validation failed:', err);
  }
  process.exit(0);
}
run();
