const express = require('express');
const router = express.Router();
const { 
  getCustomers, getReminders, addReminder, deleteReminder,
  getAddresses, addAddress, updateAddress, deleteAddress
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/customers', authMiddleware, adminMiddleware, getCustomers);

router.get('/reminders', authMiddleware, getReminders);
router.post('/reminders', authMiddleware, addReminder);
router.delete('/reminders/:index', authMiddleware, deleteReminder);

router.get('/addresses', authMiddleware, getAddresses);
router.post('/addresses', authMiddleware, addAddress);
router.put('/addresses/:id', authMiddleware, updateAddress);
router.delete('/addresses/:id', authMiddleware, deleteAddress);

module.exports = router;
