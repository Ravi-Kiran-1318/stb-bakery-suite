const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const user = await User.create({
      name: 'Test Google User',
      email: 'testgoogle@example.com',
      mobile: '9999999999',
      firebaseUid: 'fakeuid123',
      role: 'customer'
    });
    console.log('User created:', user);
  } catch (e) {
    console.error('Error creating user:', e);
  }
  process.exit(0);
});
