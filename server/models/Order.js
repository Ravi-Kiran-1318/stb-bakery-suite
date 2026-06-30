const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerInfo: {
      name: { type: String, required: true },
      mobile: { type: String, required: true },
      email: { type: String },
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        customCakeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'CustomCakeRequest',
        },
        isCustomCake: {
          type: Boolean,
          default: false,
        },
        nameEN: String,
        nameTe: String,
        imageUrl: String,
        price: Number,
        qty: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryType: {
      type: String,
      required: true,
    },
    location: {
      lat: Number,
      lng: Number,
      address: String,
    },
    requestedDate: {
      type: String, 
    },
    requestedTime: {
      type: String, 
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      default: 'Pending',
    },
    status: {
      type: String,
      enum: ['Received', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Received',
    },
    notes: {
      type: String,
    },
    cancelReason: {
      type: String,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
