const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment, razorpayWebhook } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// Webhook endpoint MUST be placed before the auth middleware
router.post('/webhook', razorpayWebhook);

router.use(authMiddleware);

router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyRazorpayPayment);

module.exports = router;
