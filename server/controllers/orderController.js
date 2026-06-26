const Order = require('../models/Order');
const Notification = require('../models/Notification');

// @desc    Get all orders (Admin)
// @route   GET /api/orders
const getOrders = async (req, res) => {
  try {
    const { range, status, search } = req.query;
    
    let query = {};
    
    // Status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Time range filter
    if (range) {
      const now = new Date();
      if (range === 'Today') {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        query.createdAt = { $gte: startOfDay };
      } else if (range === 'This Week') {
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        query.createdAt = { $gte: startOfWeek };
      }
    }

    let orders = await Order.find(query).populate('user', 'name email').sort({ createdAt: -1 });

    // Text search (simple filter on results for now)
    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter(o => 
        (o.customerInfo && o.customerInfo.name && o.customerInfo.name.toLowerCase().includes(searchLower)) ||
        (o.customerInfo && o.customerInfo.mobile && o.customerInfo.mobile.includes(searchLower)) ||
        (o.user && o.user.name && o.user.name.toLowerCase().includes(searchLower))
      );
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // Create notification for customer
    const messageMap = {
      'Received': 'Your order has been received 📦',
      'Preparing': 'Your order is now being Prepared 🍰',
      'Ready': 'Your order is Ready! 🎉',
      'Out for Delivery': 'Your order is Out for Delivery 🚚',
      'Delivered': 'Your order has been Delivered ✅',
      'Cancelled': 'Your order has been Cancelled ❌',
    };

    const notification = await Notification.create({
      userId: order.user,
      type: 'order_update',
      message: messageMap[status] || `Your order status is now ${status}`,
      actionTab: 'orders'
    });

    // Emit to customer via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${order.user}`).emit('new_notification', notification);
      io.to(`user_${order.user}`).emit('order_status_update', order);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel order (Admin or Customer)
// @route   PATCH /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
  try {
    const { reason, cancelledBy } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = 'Cancelled';
    order.cancelReason = reason || 'No reason provided';
    await order.save();

    const io = req.app.get('io');

    if (cancelledBy === 'admin') {
      const notification = await Notification.create({
        userId: order.user,
        type: 'order_cancelled',
        message: `Your order #${order._id.toString().slice(-6).toUpperCase()} was cancelled by the bakery. Reason: ${order.cancelReason}`,
        actionTab: 'orders'
      });
      if (io) {
        io.to(`user_${order.user}`).emit('new_notification', notification);
        io.to(`user_${order.user}`).emit('order_status_update', order);
      }
    } else {
      // Customer cancelled, notify admin
      const adminUsers = await require('../models/User').find({ role: 'admin' });
      adminUsers.forEach(async (admin) => {
        const notification = await Notification.create({
          userId: admin._id,
          type: 'order_cancelled',
          message: `Order #${order._id.toString().slice(-6).toUpperCase()} was cancelled by the customer.`,
          actionTab: 'orders'
        });
        if (io) {
          io.to('admin_room').emit('new_notification', notification);
        }
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrders,
  updateOrderStatus,
  cancelOrder,
};
