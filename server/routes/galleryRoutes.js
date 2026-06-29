const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');
const upload = require('../middleware/upload');

// @route   GET /api/gallery
// @desc    Get all visible gallery items (Public)
router.get('/', async (req, res) => {
  try {
    const galleryItems = await Gallery.find({ isVisible: true }).sort({ createdAt: -1 });
    res.json(galleryItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/gallery/all
// @desc    Get all gallery items (Admin)
router.get('/all', authMiddleware, adminOnly, async (req, res) => {
  try {
    const galleryItems = await Gallery.find({}).sort({ createdAt: -1 });
    res.json(galleryItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/gallery
// @desc    Create a new gallery item (Admin)
router.post('/', authMiddleware, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { title, category, isVisible } = req.body;
    let imageUrl = '';
    
    if (req.file) {
      imageUrl = req.file.path;
    } else {
      return res.status(400).json({ message: 'Image is required for gallery' });
    }

    const galleryItem = new Gallery({
      title,
      category,
      imageUrl,
      isVisible: isVisible === 'true' || isVisible === true,
    });

    const createdItem = await galleryItem.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/gallery/:id
// @desc    Update a gallery item (Admin)
router.patch('/:id', authMiddleware, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { title, category, isVisible } = req.body;
    const galleryItem = await Gallery.findById(req.params.id);

    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    if (title) galleryItem.title = title;
    if (category) galleryItem.category = category;
    if (isVisible !== undefined) galleryItem.isVisible = isVisible === 'true' || isVisible === true;
    
    if (req.file) {
      galleryItem.imageUrl = req.file.path;
    }

    const updatedItem = await galleryItem.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete a gallery item (Admin)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    await galleryItem.deleteOne();
    res.json({ message: 'Gallery item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
