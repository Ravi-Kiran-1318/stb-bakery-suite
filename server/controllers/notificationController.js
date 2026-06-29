const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const { role } = req.query; // e.g. ?role=admin or ?role=customer
    let query = { userId: req.user.id };
    
    if (req.user.role === 'admin') {
      if (role === 'admin') {
        // Admin explicitly asking for admin notifications
        query = { recipientRole: 'admin' };
      } else if (role === 'customer') {
        // Admin explicitly asking for customer notifications (e.g. they placed an order)
        query = { userId: req.user.id, recipientRole: 'customer' };
      } else {
        // Fetch all (for the bell icon)
        query = { 
          $or: [
            { userId: req.user.id }, 
            { recipientRole: 'admin' }
          ] 
        };
      }
    } else {
      query = { userId: req.user.id, recipientRole: 'customer' };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    let query = { _id: req.params.id, userId: req.user.id };
    if (req.user.role === 'admin') {
      query = { _id: req.params.id }; // Admin can mark any notification as read
    }

    const notification = await Notification.findOneAndUpdate(
      query,
      { read: true },
      { returnDocument: 'after' }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const { role } = req.query;
    let query = { userId: req.user.id, read: false };
    
    if (req.user.role === 'admin') {
      if (role === 'admin') query = { recipientRole: 'admin', read: false };
      else if (role === 'customer') query = { userId: req.user.id, recipientRole: 'customer', read: false };
      else query = { $or: [{ userId: req.user.id }, { recipientRole: 'admin' }], read: false };
    } else {
      query = { userId: req.user.id, recipientRole: 'customer', read: false };
    }

    await Notification.updateMany(query, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearAll = async (req, res) => {
  try {
    const { role } = req.query;
    let query = { userId: req.user.id };
    
    if (req.user.role === 'admin') {
      if (role === 'admin') query = { recipientRole: 'admin' };
      else if (role === 'customer') query = { userId: req.user.id, recipientRole: 'customer' };
      else query = { $or: [{ userId: req.user.id }, { recipientRole: 'admin' }] };
    } else {
      query = { userId: req.user.id, recipientRole: 'customer' };
    }

    await Notification.deleteMany(query);
    res.json({ message: 'Notifications cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearAll,
};
