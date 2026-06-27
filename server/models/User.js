const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{10}$/,
    },
    email: {
      type: String,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'customer'],
      default: 'customer',
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    occasionReminders: [
      {
        label: String,
        date: String, // MM-DD format
        reminderSent: {
          type: Boolean,
          default: false,
        },
      },
    ],
    addresses: [
      {
        type: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: String,
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
