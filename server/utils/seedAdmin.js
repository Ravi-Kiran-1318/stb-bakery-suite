const User = require('../models/User');
const bcrypt = require('bcrypt');

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'rkgit7767@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'ravi@123';

    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      await User.create({
        name: 'Admin',
        mobile: '0000000000',
        email: adminEmail,
        passwordHash: hashedPassword,
        role: 'admin',
      });
      console.log('Admin seeded successfully.');
    } else {
      console.log('Admin already exists.');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

module.exports = seedAdmin;
