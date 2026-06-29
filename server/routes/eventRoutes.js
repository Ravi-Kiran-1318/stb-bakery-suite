const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');
const upload = require('../middleware/upload');

// @route   GET /api/events
// @desc    Get all active events (Public)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ isActive: true }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/events/all
// @desc    Get all events (Admin)
router.get('/all', authMiddleware, adminOnly, async (req, res) => {
  try {
    const events = await Event.find({}).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/events
// @desc    Create a new event (Admin)
router.post('/', authMiddleware, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { title, description, date, isActive } = req.body;
    let imageUrl = '';
    
    if (req.file) {
      imageUrl = req.file.path;
    }

    const event = new Event({
      title,
      description,
      date,
      imageUrl,
      isActive: isActive === 'true' || isActive === true,
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/events/:id
// @desc    Update an event (Admin)
router.patch('/:id', authMiddleware, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { title, description, date, isActive } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (isActive !== undefined) event.isActive = isActive === 'true' || isActive === true;
    
    if (req.file) {
      event.imageUrl = req.file.path;
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event (Admin)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
