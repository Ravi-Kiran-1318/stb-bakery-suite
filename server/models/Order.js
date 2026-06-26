const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerMobile: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        nameEN: String,
        price: Number,
        qty: Number,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryType: {
      type: String,
      enum: ['delivery', 'pickup'],
      required: true,
    },
    deliveryAddress: {
      type: String,
    },
    deliveryLat: {
      type: Number,
    },
    deliveryLng: {
      type: Number,
    },
    distanceKm: {
      type: Number,
    },
    requestedDateTime: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'cod'],
      required: true,
    },
    advancePaid: {
      type: Boolean,
      default: false,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Received', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Received',
    },
    cancelledBy: {
      type: String, // e.g., 'customer', 'admin'
    },
    cancellationReason: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
