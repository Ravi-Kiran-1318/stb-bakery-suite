const express = require('express');
const router = express.Router();
const { getCustomers, getReminders, addReminder, deleteReminder } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/customers', authMiddleware, adminMiddleware, getCustomers);

router.get('/reminders', authMiddleware, getReminders);
router.post('/reminders', authMiddleware, addReminder);
router.delete('/reminders/:index', authMiddleware, deleteReminder);

module.exports = router;
