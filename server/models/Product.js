const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, { timestamps: true });

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
    },
    price: {
      type: Number,
      required: true,
    },
    weight: {
      type: String,
    },
    quantity: {
      type: Number,
      default: 0,
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
    isSpecial: {
      type: Boolean,
      default: false,
    },
    isLoved: {
      type: Boolean,
      default: false,
    },
    isGallery: {
      type: Boolean,
      default: false,
    },
    flavour: {
      type: String,
    },
    reviews: [reviewSchema],
    averageRating: {
      type: Number,
      default: 0
    },
    numReviews: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
