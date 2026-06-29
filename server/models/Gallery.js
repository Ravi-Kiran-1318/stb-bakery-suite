const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        '1 Year Baby Cakes',
        '6 Months Baby Cakes',
        'Step Cakes',
        'Barbie Doll Cakes',
        "Father's Day Cakes",
        "Mother's Day Cakes",
        'Christmas Cakes',
        'New Year Cakes',
        'Photo Cakes',
        'Cartoon Cakes',
        'Pastry Cakes',
        'Chocolate Cakes',
        'Eggless Cakes',
        'Political Party Cakes',
        'Wedding Cakes', 
        'Birthday Cakes', 
        'Custom Pastries', 
        'Other'
      ],
      default: 'Other',
    },
    imageUrl: {
      type: String,
      required: true,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gallery', gallerySchema);
