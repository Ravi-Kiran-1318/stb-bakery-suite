const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

// POST /api/push/fcm-token
router.post('/fcm-token', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add token if not already in array
    if (!user.fcmTokens) user.fcmTokens = [];
    if (!user.fcmTokens.includes(token)) {
      user.fcmTokens.push(token);
      await user.save();
    }

    res.status(200).json({ message: 'FCM token saved successfully' });
  } catch (error) {
    console.error('FCM token save error:', error);
    res.status(500).json({ message: 'Failed to save FCM token' });
  }
});

// DELETE /api/push/fcm-token
router.delete('/fcm-token', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { fcmTokens: token }
    });

    res.status(200).json({ message: 'FCM token removed successfully' });
  } catch (error) {
    console.error('FCM token remove error:', error);
    res.status(500).json({ message: 'Failed to remove FCM token' });
  }
});

module.exports = router;
