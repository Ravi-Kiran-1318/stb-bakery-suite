const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// GET /api/push/vapid-public-key
router.get('/vapid-public-key', (req, res) => {
  res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// POST /api/push/subscribe
router.post('/subscribe', protect, async (req, res) => {
  try {
    const subscription = req.body;
    
    // Validate subscription object
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: 'Invalid subscription object' });
    }

    // Save to user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.pushSubscription = subscription;
    await user.save();

    res.status(201).json({ message: 'Subscription saved successfully' });
  } catch (error) {
    console.error('Push subscribe error:', error);
    res.status(500).json({ message: 'Failed to save subscription' });
  }
});

module.exports = router;
