const mongoose = require('mongoose');

const customCakeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    referenceImageUrl: {
      type: String, // Link to an image
    },
    weight: {
      type: Number, // In kg
      required: true,
    },
    requestedDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Quoted', 'Accepted', 'Rejected', 'Completed'],
      default: 'Pending',
    },
    quotePrice: {
      type: Number,
    },
    adminNotes: {
      type: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CustomCakeRequest', customCakeSchema);
