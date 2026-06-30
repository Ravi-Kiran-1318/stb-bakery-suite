const Notification = require('../models/Notification');
const { sendPushNotification, notifyAdmins } = require('./pushHelper');

/**
 * Dispatch a notification to the database, socket.io, and web push
 * @param {Object} req - The Express request object (used to get io)
 * @param {Object} data - Notification data
 * @param {String} [data.userId] - The user ID to notify (if recipientRole is customer)
 * @param {String} data.message - The notification message/body
 * @param {String} data.type - Notification type ('new_order', 'order_status', etc.)
 * @param {String} data.actionTab - The tab or URL to navigate to when clicked
 * @param {String} [data.referenceId] - Associated entity ID
 * @param {String} [data.recipientRole] - 'admin' or 'customer' (default 'customer')
 */
const dispatchNotification = async (req, data) => {
  try {
    // 1. Save to Database
    const notification = await Notification.create({
      userId: data.userId,
      message: data.message,
      type: data.type,
      actionTab: data.actionTab,
      referenceId: data.referenceId,
      recipientRole: data.recipientRole || 'customer'
    });

    // 2. Emit via Socket.io for Real-time Dashboard
    const io = req ? req.app.get('io') : null;
    if (io) {
      if (notification.recipientRole === 'admin') {
        io.to('admin').emit('new_notification', notification);
        io.to('admin_room').emit('new_notification', notification); // Fallback room if used
      } else if (notification.userId) {
        io.to(`user_${notification.userId.toString()}`).emit('new_notification', notification);
      }
    }

    // 3. Send Push Notification to Mobile/Desktop Devices
    // Construct the payload for web-push
    const pushPayload = {
      title: getPushTitle(data.type),
      body: data.message,
      url: getPushUrl(data.recipientRole, data.actionTab),
      type: data.type
    };

    if (notification.recipientRole === 'admin') {
      await notifyAdmins(pushPayload);
    } else if (notification.userId) {
      await sendPushNotification(notification.userId, pushPayload);
    }

    return notification;
  } catch (error) {
    console.error('Error dispatching notification:', error);
    return null;
  }
};

/**
 * Helper to get a human-readable title based on notification type
 */
const getPushTitle = (type) => {
  const titles = {
    new_order: 'New Order Received',
    order_status: 'Order Status Update',
    order_cancelled: 'Order Cancelled',
    low_stock: 'Low Stock Alert',
    payment_received: 'Payment Received',
    custom_cake: 'Custom Cake Update'
  };
  return titles[type] || 'New Notification';
};

/**
 * Helper to construct the target URL when notification is clicked
 */
const getPushUrl = (role, actionTab) => {
  const basePath = role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';
  return actionTab ? `${basePath}?tab=${actionTab}` : basePath;
};

module.exports = {
  dispatchNotification
};
