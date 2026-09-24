const mongoose = require('mongoose');

const translationCacheSchema = new mongoose.Schema({
  sourceHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  sourceLang: {
    type: String,
    required: true,
    default: 'te' // Assuming Telugu is the primary source language from users
  },
  targetLang: {
    type: String,
    required: true,
    default: 'en'
  },
  originalText: {
    type: String,
    required: true
  },
  translatedText: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('TranslationCache', translationCacheSchema);
