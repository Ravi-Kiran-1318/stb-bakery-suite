const CustomCakeRequest = require('../models/CustomCakeRequest');

const createRequest = async (req, res) => {
  try {
    const { description, referenceImageUrl, weight, requestedDate } = req.body;
    
    const newRequest = await CustomCakeRequest.create({
      user: req.user._id,
      description,
      referenceImageUrl,
      weight,
      requestedDate
    });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await CustomCakeRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const requests = await CustomCakeRequest.find().populate('user', 'name mobile email').sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { status, quotePrice, adminNotes } = req.body;
    const request = await CustomCakeRequest.findById(req.params.id);
    
    if (!request) return res.status(404).json({ message: 'Request not found' });
    
    if (status) request.status = status;
    if (quotePrice !== undefined) request.quotePrice = quotePrice;
    if (adminNotes !== undefined) request.adminNotes = adminNotes;
    
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRequest, getMyRequests, getAllRequests, updateRequestStatus };
