const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// @route   POST /api/coupons/validate
// @desc    Validate a coupon code and get discount
// @access  Public (or Private if you prefer logged in users)
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: 'This coupon is no longer active' });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    res.json({
      code: coupon.code,
      discountPercentage: coupon.discountPercentage
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/coupons/active
// @desc    Get all active coupons for customers
// @access  Public (or Private)
router.get('/active', async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: new Date() }
    }).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/coupons
// @desc    Get all coupons
// @access  Private/Admin
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/coupons
// @desc    Create a new coupon
// @access  Private/Admin
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { code, discountPercentage, expiryDate, isActive } = req.body;

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountPercentage,
      expiryDate,
      isActive
    });

    res.status(201).json(coupon);
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/coupons/:id
// @desc    Delete a coupon
// @access  Private/Admin
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    // Use deleteOne instead of remove
    await Coupon.deleteOne({ _id: req.params.id });
    res.json({ message: 'Coupon removed' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/coupons/:id/toggle
// @desc    Toggle coupon active status
// @access  Private/Admin
router.put('/:id/toggle', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    
    res.json(coupon);
  } catch (error) {
    console.error('Toggle coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
