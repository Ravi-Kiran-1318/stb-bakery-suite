const express = require('express');
const router = express.Router();
const { createRequest, getMyRequests, getAllRequests, updateRequestStatus } = require('../controllers/customCakeController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Customer routes
router.post('/', authMiddleware, createRequest);
router.get('/my-requests', authMiddleware, getMyRequests);
router.put('/:id/accept', authMiddleware, async (req, res, next) => {
  // Shortcut for customer to accept quote
  req.body = { status: 'Accepted' };
  next();
}, updateRequestStatus);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getAllRequests);
router.put('/:id', authMiddleware, adminMiddleware, updateRequestStatus);

module.exports = router;
