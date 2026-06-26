const express = require('express');
const router = express.Router();
const {
  getOrders,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware);

// Admin routes
router.get('/', adminMiddleware, getOrders);
router.patch('/:id/status', adminMiddleware, updateOrderStatus);

// Admin or Customer
router.patch('/:id/cancel', cancelOrder);

module.exports = router;
