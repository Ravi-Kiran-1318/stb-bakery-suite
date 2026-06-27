const Order = require('../models/Order');
const Notification = require('../models/Notification');
const User = require('../models/User');
const mongoose = require('mongoose');
const { sendAdminNewOrderEmail, sendCustomerConfirmationEmail } = require('../utils/mailer');

// Helper to calculate distance between two lat/lng points in km (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; 
  return d;
};

// @desc    Create a new order (Customer)
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { items, deliveryType, location, requestedDate, paymentMethod, notes, customerInfo, advancePaid, razorpayOrderId, razorpayPaymentId } = req.body;
    const userId = req.user._id;

    let deliveryFee = 0;
    
    if (deliveryType === 'Delivery') {
      if (!location || !location.lat || !location.lng) {
        return res.status(400).json({ message: 'Delivery location is required for delivery orders.' });
      }

      const shopLat = parseFloat(process.env.SHOP_LAT) || 13.6288;
      const shopLng = parseFloat(process.env.SHOP_LNG) || 79.4192;
      
      const distanceKm = calculateDistance(shopLat, shopLng, location.lat, location.lng);
      
      if (distanceKm > 10) {
        return res.status(400).json({ message: 'Your location is outside our 10km delivery zone. Switch to Pickup or choose a closer location.' });
      }
      
      deliveryFee = 50; // Flat ₹50 for delivery
    }

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const totalAmount = subtotal + deliveryFee;

    const newOrder = await Order.create({
      user: userId,
      customerInfo: customerInfo || { name: req.user.name, mobile: req.user.mobile },
      items,
      totalAmount,
      deliveryType,
      location: deliveryType === 'Delivery' ? location : null,
      requestedDate,
      paymentMethod,
      paymentStatus: advancePaid ? 'Partial' : (paymentMethod === 'Online' ? 'Pending' : 'Pending'),
      status: 'Received',
      notes,
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
    });

    // Add loyalty points
    const pointsEarned = Math.floor(totalAmount / 10);
    await User.findByIdAndUpdate(userId, { $inc: { loyaltyPoints: pointsEarned } });

    // Send Admin Notification
    const notification = await Notification.create({
      userId: null, // Global or admin specific, we'll just not assign to a user or assign to all admins
      type: 'new_order',
      message: `New order from ${customerInfo?.name || req.user.name} — ₹${totalAmount}`,
      actionTab: 'orders',
      referenceId: newOrder._id.toString()
    });

    // Fetch admins and assign the notification
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      // In a real app we might duplicate notifications per admin, or have a shared admin pool
      // For now, emit to admin_room
    }

    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('new_notification', notification);
      io.to('admin').emit('new_order', {
        orderId: newOrder._id,
        customerName: customerInfo?.name || req.user.name,
        totalAmount
      });
    }

    if (advancePaid) {
      const advanceAmount = Math.ceil(totalAmount * 0.2);
      const paymentNotification = await Notification.create({
        userId: null,
        type: 'payment_received',
        message: `💳 Advance payment of ₹${advanceAmount} received from ${customerInfo?.name || req.user.name}`,
        actionTab: 'orders',
        referenceId: newOrder._id.toString()
      });
      if (io) {
        io.to('admin').emit('payment_received', paymentNotification);
      }
    }

    // Send emails
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      sendAdminNewOrderEmail(newOrder, adminEmail);
    }
    if (customerInfo && customerInfo.email) {
      sendCustomerConfirmationEmail(newOrder);
    }

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email mobile');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Optional: check if customer owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
      type: 'order_status',
      message: messageMap[status] || `Your order status is now ${status}`,
      actionTab: 'orders',
      referenceId: order._id.toString()
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
        actionTab: 'orders',
        referenceId: order._id.toString()
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
          actionTab: 'orders',
          referenceId: order._id.toString()
        });
        if (io) {
          io.to('admin').emit('new_notification', notification);
        }
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const { range } = req.query; // daily, weekly, monthly, annually
    const now = new Date();
    let currentStart, currentEnd, prevStart, prevEnd;
    let formatStr = '';

    currentEnd = new Date();

    if (range === 'daily') {
      currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      prevStart = new Date(currentStart);
      prevStart.setDate(prevStart.getDate() - 1);
      prevEnd = new Date(currentStart);
      formatStr = '%H:00';
    } else if (range === 'weekly') {
      currentStart = new Date();
      currentStart.setDate(currentStart.getDate() - 7);
      prevStart = new Date(currentStart);
      prevStart.setDate(prevStart.getDate() - 7);
      prevEnd = new Date(currentStart);
      formatStr = '%Y-%m-%d';
    } else if (range === 'monthly') {
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEnd = new Date(now.getFullYear(), now.getMonth(), 1);
      formatStr = '%Y-%m-%d';
    } else if (range === 'annually') {
      currentStart = new Date(now.getFullYear(), 0, 1);
      prevStart = new Date(now.getFullYear() - 1, 0, 1);
      prevEnd = new Date(now.getFullYear(), 0, 1);
      formatStr = '%Y-%m';
    } else {
      currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      prevStart = new Date(currentStart);
      prevStart.setDate(prevStart.getDate() - 1);
      prevEnd = new Date(currentStart);
      formatStr = '%H:00';
    }

    // --- JS based computation for highest accuracy ---
    const currentOrders = await Order.find({ createdAt: { $gte: currentStart, $lt: currentEnd }, status: { $ne: 'Cancelled' } }).populate('items.productId');
    const prevOrders = await Order.find({ createdAt: { $gte: prevStart, $lt: prevEnd }, status: { $ne: 'Cancelled' } });

    const totalRevenue = currentOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = currentOrders.length;
    
    const prevTotalRevenue = prevOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const prevTotalOrders = prevOrders.length;

    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    let revenueGrowth = 0;
    if (prevTotalRevenue > 0) revenueGrowth = Math.round(((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100);
    else if (totalRevenue > 0) revenueGrowth = 100;

    let ordersGrowth = 0;
    if (prevTotalOrders > 0) ordersGrowth = Math.round(((totalOrders - prevTotalOrders) / prevTotalOrders) * 100);
    else if (totalOrders > 0) ordersGrowth = 100;

    // Top item
    const itemCounts = {};
    const categoryTotals = {};
    let onlineCount = 0, codCount = 0;
    let deliveryCount = 0, pickupCount = 0;
    
    currentOrders.forEach(order => {
      // Payment split
      if (order.paymentMethod === 'Online') onlineCount++;
      else codCount++; // Since the other is Cash on Delivery
      
      // Delivery split
      if (order.deliveryType === 'Delivery') deliveryCount++;
      else pickupCount++;
      
      order.items.forEach(item => {
        const name = item.nameEN || item.name || 'Unknown';
        itemCounts[name] = (itemCounts[name] || 0) + (item.qty || 1);
        
        // Category Split
        let cat = 'Other';
        if (item.productId && item.productId.category) {
          cat = item.productId.category;
        }
        categoryTotals[cat] = (categoryTotals[cat] || 0) + ((item.price || 0) * (item.qty || 1));
      });
    });

    let topItem = { name: 'None', unitsSold: 0 };
    for (const [name, qty] of Object.entries(itemCounts)) {
      if (qty > topItem.unitsSold) topItem = { name, unitsSold: qty };
    }
    
    const categoryBreakdown = Object.keys(categoryTotals).map(cat => ({ category: cat, revenue: categoryTotals[cat] }));

    // Time Series and Peak Hours (still good for aggregation)
    const aggregations = await Order.aggregate([
      { $match: { createdAt: { $gte: currentStart, $lt: currentEnd }, status: { $ne: 'Cancelled' } } },
      {
        $facet: {
          timeSeries: [
            {
              $group: {
                _id: { $dateToString: { format: formatStr, date: '$createdAt' } },
                revenue: { $sum: '$totalAmount' },
                orders: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          peak: [
            {
              $group: {
                _id: { day: { $dayOfWeek: '$createdAt' }, hour: { $hour: '$createdAt' } },
                orders: { $sum: 1 },
              },
            },
          ],
        }
      }
    ]);

    const result = aggregations[0];
    const revenueTimeSeries = result.timeSeries.map(t => ({ label: t._id, revenue: t.revenue }));
    const ordersTimeSeries = result.timeSeries.map(t => ({ label: t._id, orders: t.orders }));
    
    const daysMap = [null, 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const peakHours = result.peak.map(p => ({
      day: daysMap[p._id.day],
      hour: p._id.hour,
      orders: p.orders,
    }));

    // New vs Returning customers
    const currentOrdersUsers = await Order.distinct('user', { createdAt: { $gte: currentStart, $lt: currentEnd }, status: { $ne: 'Cancelled' } });
    const userFirstOrders = await Order.aggregate([
      { $match: { user: { $in: currentOrdersUsers }, status: { $ne: 'Cancelled' } } },
      { $group: { _id: '$user', firstOrderDate: { $min: '$createdAt' } } }
    ]);

    let newCustomers = 0;
    let returningCustomers = 0;
    userFirstOrders.forEach(u => {
      if (u.firstOrderDate >= currentStart) newCustomers++;
      else returningCustomers++;
    });

    res.json({
      summary: { totalRevenue, totalOrders, avgOrderValue, topItem, revenueGrowth, ordersGrowth },
      revenueTimeSeries,
      ordersTimeSeries,
      categoryBreakdown,
      paymentSplit: { online: onlineCount, cod: codCount },
      deliverySplit: { delivery: deliveryCount, pickup: pickupCount },
      peakHours,
      newCustomers,
      returningCustomers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrders,
  updateOrderStatus,
  cancelOrder,
  getAnalytics,
  createOrder,
  getMyOrders,
  getOrderById,
};
