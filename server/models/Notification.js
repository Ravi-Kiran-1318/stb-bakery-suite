const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['new_order', 'order_status', 'order_cancelled', 'low_stock', 'payment_received', 'custom_cake'],
      required: true,
    },
    actionTab: {
      type: String,
    },
    referenceId: {
      type: String,
    },
    recipientRole: {
      type: String,
      enum: ['admin', 'customer'],
      default: 'customer'
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
