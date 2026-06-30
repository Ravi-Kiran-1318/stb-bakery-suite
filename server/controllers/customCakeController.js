const CustomCakeRequest = require('../models/CustomCakeRequest');
const { dispatchNotification } = require('../utils/notificationService');

const createRequest = async (req, res) => {
  try {
    const { description, weight, requestedDate, flavour, color, shape, requestedTime } = req.body;
    let referenceImageUrl = req.body.referenceImageUrl;

    // Handle file upload if present
    if (req.file) {
      referenceImageUrl = req.file.path;
    }
    
    const newRequest = await CustomCakeRequest.create({
      user: req.user._id,
      description,
      referenceImageUrl,
      weight,
      requestedDate,
      flavour,
      color,
      shape,
      requestedTime
    });

    // Notify admin
    await dispatchNotification(req, {
      message: `New custom cake request from ${req.user.name}`,
      type: 'custom_cake',
      actionTab: 'custom-cakes',
      referenceId: newRequest._id,
      recipientRole: 'admin'
    });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyRequests = async (req, res) => { console.log('getMyRequests called for user:', req.user._id);
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
    const request = await CustomCakeRequest.findById(req.params.id).populate('user', 'name');
    
    if (!request) return res.status(404).json({ message: 'Request not found' });
    
    const oldStatus = request.status;
    
    if (status) request.status = status;
    if (quotePrice !== undefined) request.quotePrice = quotePrice;
    if (adminNotes !== undefined) request.adminNotes = adminNotes;
    
    await request.save();

    if (status === 'Quoted' && oldStatus !== 'Quoted') {
      await dispatchNotification(req, {
        userId: request.user._id,
        message: 'Your custom cake request has a quote! 🍰',
        type: 'custom_cake',
        actionTab: 'customcakes',
        referenceId: request._id,
        recipientRole: 'customer'
      });
    } else if (status === 'Accepted' && oldStatus !== 'Accepted') {
      await dispatchNotification(req, {
        message: `${request.user.name} accepted the quote and added the custom cake to cart!`,
        type: 'custom_cake',
        actionTab: 'custom-cakes',
        referenceId: request._id,
        recipientRole: 'admin'
      });
    } else if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      await dispatchNotification(req, {
        message: `${request.user.name} cancelled their custom cake request.`,
        type: 'custom_cake',
        actionTab: 'custom-cakes',
        referenceId: request._id,
        recipientRole: 'admin'
      });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRequest, getMyRequests, getAllRequests, updateRequestStatus };
