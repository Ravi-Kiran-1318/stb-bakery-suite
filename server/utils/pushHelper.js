const admin = require('../config/firebaseAdmin');
const User = require('../models/User');

/**
 * Send a push notification to a specific user
 * @param {String} userId - The ID of the user to notify
 * @param {Object} payload - The notification payload { title, body, url, ... }
 */
const sendPushNotification = async (userId, payload) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      return false;
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        url: payload.url,
        type: payload.type,
      },
      tokens: user.fcmTokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(user.fcmTokens[idx]);
        }
      });
      if (failedTokens.length > 0) {
        await User.findByIdAndUpdate(userId, {
          $pull: { fcmTokens: { $in: failedTokens } }
        });
      }
    }
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

/**
 * Send a push notification to all admins
 * @param {Object} payload - The notification payload
 */
const notifyAdmins = async (payload) => {
  try {
    const admins = await User.find({ role: 'admin', fcmTokens: { $exists: true, $not: { $size: 0 } } });
    
    let allTokens = [];
    admins.forEach(admin => {
      allTokens = allTokens.concat(admin.fcmTokens);
    });

    if (allTokens.length === 0) return;

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        url: payload.url,
        type: payload.type,
      },
      tokens: allTokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    // We could clean up invalid tokens here similarly, but it requires mapping tokens back to users.
    // For admins, it's less critical as there are few admins, but let's keep it simple.
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
};

module.exports = {
  sendPushNotification,
  notifyAdmins,
};
