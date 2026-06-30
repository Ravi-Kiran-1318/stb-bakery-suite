const CustomCakeRequest = require('../models/CustomCakeRequest');

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
    const Notification = require('../models/Notification');
    const { getIO } = require('../utils/socket');
    const User = require('../models/User');

    const adminNotification = await Notification.create({
      message: `New custom cake request from ${req.user.name}`,
      type: 'custom_cake',
      actionTab: 'custom-cakes',
      referenceId: newRequest._id,
      recipientRole: 'admin'
    });

    const io = getIO();
    if (io) {
      io.to('admin').emit('new_notification', adminNotification);
    }

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

    const Notification = require('../models/Notification');
    const { getIO } = require('../utils/socket');
    const io = getIO();

    if (status === 'Quoted' && oldStatus !== 'Quoted') {
      const customerNotification = await Notification.create({
        userId: request.user._id,
        message: 'Your custom cake request has a quote! 🍰',
        type: 'custom_cake',
        actionTab: 'customcakes',
        referenceId: request._id,
        recipientRole: 'customer'
      });
      if (io) {
        io.to(`user_${request.user._id.toString()}`).emit('new_notification', customerNotification);
      }
    } else if (status === 'Accepted' && oldStatus !== 'Accepted') {
      const adminNotification = await Notification.create({
        message: `${request.user.name} accepted the quote and added the custom cake to cart!`,
        type: 'custom_cake',
        actionTab: 'custom-cakes',
        referenceId: request._id,
        recipientRole: 'admin'
      });
      if (io) {
        io.to('admin').emit('new_notification', adminNotification);
      }
    } else if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      const adminNotification = await Notification.create({
        message: `${request.user.name} cancelled their custom cake request.`,
        type: 'custom_cake',
        actionTab: 'custom-cakes',
        referenceId: request._id,
        recipientRole: 'admin'
      });
      if (io) {
        io.to('admin').emit('new_notification', adminNotification);
      }
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRequest, getMyRequests, getAllRequests, updateRequestStatus };
