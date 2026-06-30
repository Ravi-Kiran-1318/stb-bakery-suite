const webpush = require('web-push');
const User = require('../models/User');

// Configure VAPID details
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Send a push notification to a specific user
 * @param {String} userId - The ID of the user to notify
 * @param {Object} payload - The notification payload { title, body, url, ... }
 */
const sendPushNotification = async (userId, payload) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.pushSubscription) {
      // User doesn't exist or hasn't subscribed to push notifications
      return false;
    }

    const subscription = user.pushSubscription;
    const stringifiedPayload = JSON.stringify(payload);

    await webpush.sendNotification(subscription, stringifiedPayload);
    return true;
  } catch (error) {
    if (error.statusCode === 410) {
      // 410 Gone means the subscription is no longer valid (e.g. user revoked permission)
      // We should remove it from the database
      try {
        await User.findByIdAndUpdate(userId, { $unset: { pushSubscription: 1 } });
      } catch (err) {
        console.error('Failed to remove invalid push subscription:', err);
      }
    } else {
      console.error('Error sending push notification:', error);
    }
    return false;
  }
};

/**
 * Send a push notification to all admins
 * @param {Object} payload - The notification payload
 */
const notifyAdmins = async (payload) => {
  try {
    const admins = await User.find({ role: 'admin', pushSubscription: { $exists: true, $ne: null } });
    
    const stringifiedPayload = JSON.stringify(payload);
    
    for (const admin of admins) {
      try {
        await webpush.sendNotification(admin.pushSubscription, stringifiedPayload);
      } catch (err) {
        if (err.statusCode === 410) {
          await User.findByIdAndUpdate(admin._id, { $unset: { pushSubscription: 1 } });
        }
      }
    }
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
};

module.exports = {
  sendPushNotification,
  notifyAdmins,
};
