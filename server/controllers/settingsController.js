const Settings = require('../models/Settings');

// @desc    Get global settings
// @route   GET /api/settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update global settings
// @route   PUT /api/settings
const updateSettings = async (req, res) => {
  try {
    const { isDeliveryAvailable } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    
    if (isDeliveryAvailable !== undefined) {
      settings.isDeliveryAvailable = isDeliveryAvailable;
    }
    
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
