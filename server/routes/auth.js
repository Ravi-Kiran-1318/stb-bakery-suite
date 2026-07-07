const express = require('express');
const router = express.Router();
const { signup, login, logout, getMe, firebaseLogin, completeGoogleSignup } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/firebase-login', firebaseLogin);
router.post('/complete-google-signup', completeGoogleSignup);
router.get('/me', authMiddleware, getMe);

module.exports = router;
