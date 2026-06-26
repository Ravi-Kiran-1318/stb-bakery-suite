const express = require('express');
const router = express.Router();
const {
  getOrders,
  updateOrderStatus,
  cancelOrder,
  getAnalytics,
  createOrder,
  getMyOrders,
  getOrderById,
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware);

// Admin routes
router.get('/analytics', adminMiddleware, getAnalytics);
router.get('/', adminMiddleware, getOrders);
router.patch('/:id/status', adminMiddleware, updateOrderStatus);

// Customer routes
router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById);

// Admin or Customer
router.patch('/:id/cancel', cancelOrder);

module.exports = router;
