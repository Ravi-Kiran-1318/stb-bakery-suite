const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    nameEN: {
      type: String,
      required: true,
    },
    nameTe: {
      type: String,
    },
    category: {
      type: String,
      enum: ['Bread', 'Bun', 'Cake', 'Pastry', 'Snacks', 'Beverages', 'Other'],
    },
    price: {
      type: Number,
      required: true,
    },
    descriptionEN: {
      type: String,
    },
    descriptionTe: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
