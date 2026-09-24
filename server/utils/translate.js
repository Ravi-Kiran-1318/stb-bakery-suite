const crypto = require('crypto');
const TranslationCache = require('../models/TranslationCache');

// Helper to generate a unique hash for a piece of text
function hashText(text) {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
}

/**
 * Translates text with a DB-backed cache to minimize API costs.
 * 
 * @param {string} text - The original text to translate (e.g., user input in Telugu)
 * @param {string} sourceLang - The source language code (e.g., 'te')
 * @param {string} targetLang - The target language code (e.g., 'en')
 * @returns {Promise<string>} The translated text, or the original text if translation fails.
 */
async function translateWithCache(text, sourceLang = 'te', targetLang = 'en') {
  if (!text || typeof text !== 'string') return text;

  // 1. Hash the source text
  const sourceHash = hashText(text);

  try {
    // 2. Check the database cache
    const cached = await TranslationCache.findOne({ sourceHash, sourceLang, targetLang });
    if (cached) {
      return cached.translatedText;
    }

    // 3. Cache Miss - Call real translation API
    // TODO: Replace this mock with your actual translation API call
    // Example (Google Cloud Translation API):
    // const [translation] = await translate.translate(text, targetLang);
    
    let translatedText;
    
    // MOCK TRANSLATION FOR NOW (replace with real API)
    console.log(`[Translation API Call] Translating: "${text}" from ${sourceLang} to ${targetLang}`);
    // If you don't have an API key set up yet, we just return the original text for now.
    // Or you can integrate a free API like MyMemory, though they have rate limits.
    translatedText = `[EN] ${text}`; 

    // 4. Save to cache
    if (translatedText) {
      await TranslationCache.create({
        sourceHash,
        sourceLang,
        targetLang,
        originalText: text,
        translatedText
      });
      return translatedText;
    }

    return text; // Fallback if API returns empty

  } catch (error) {
    console.error('Translation error:', error);
    // CRITICAL: Graceful fallback. Never crash the app if translation fails.
    return text; 
  }
}

module.exports = {
  translateWithCache,
  hashText
};
