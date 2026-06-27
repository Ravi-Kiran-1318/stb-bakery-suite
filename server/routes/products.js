const express = require('express');
const router = express.Router();
const {
  getPublicProducts,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  addReview,
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/upload');

// Public route
router.get('/', getPublicProducts);

// Protected route for customers to add reviews
router.post('/:id/reviews', authMiddleware, addReview);

// Admin routes
router.use(authMiddleware, adminMiddleware);
router.get('/all', getAllProducts);
router.post('/', upload.single('image'), createProduct);
router.patch('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/toggle', toggleAvailability);

module.exports = router;
