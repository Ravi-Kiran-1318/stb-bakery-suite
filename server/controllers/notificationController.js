const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    let query = { userId: req.user.id };
    if (req.user.role === 'admin') {
      query = { $or: [{ userId: req.user.id }, { userId: null }] };
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
    let query = { userId: req.user.id, read: false };
    if (req.user.role === 'admin') {
      query = { $or: [{ userId: req.user.id }, { userId: null }], read: false };
    }

    await Notification.updateMany(
      query,
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearAll = async (req, res) => {
  try {
    let query = { userId: req.user.id };
    if (req.user.role === 'admin') {
      query = { $or: [{ userId: req.user.id }, { userId: null }] };
    }

    await Notification.deleteMany(query);
    res.json({ message: 'All notifications cleared' });
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
