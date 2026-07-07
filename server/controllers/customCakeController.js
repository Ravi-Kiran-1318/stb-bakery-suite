const CustomCakeRequest = require('../models/CustomCakeRequest');
const { dispatchNotification } = require('../utils/notificationService');

const createRequest = async (req, res) => {
  try {
    const { description, weight, requestedDate, flavour, color, shape, requestedTime, isGalleryRequest, galleryCakeId, basePrice } = req.body;
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
      requestedTime,
      isGalleryRequest,
      galleryCakeId,
      basePrice
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
    const requests = await CustomCakeRequest.find({ user: req.user._id }).populate('galleryCakeId').sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const requests = await CustomCakeRequest.find().populate('user', 'name mobile email').populate('galleryCakeId').sort({ createdAt: -1 });
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
    let isStatusChanged = false;

    if (status && request.status !== status) {
      request.status = status;
      isStatusChanged = true;
    }
    
    if (quotePrice !== undefined && quotePrice !== null) {
      request.quotePrice = Number(quotePrice);
    }
    
    if (adminNotes !== undefined) {
      request.adminNotes = adminNotes;
    }
    
    await request.save();

    // Only send notification if the status actually changed to a new state
    if (isStatusChanged) {
      if (status === 'Quoted') {
        await dispatchNotification(req, {
          userId: request.user._id,
          message: 'Your custom cake request has a quote! 🍰',
          type: 'custom_cake',
          actionTab: 'customcakes',
          referenceId: request._id,
          recipientRole: 'customer'
        });
      } else if (status === 'Accepted') {
        await dispatchNotification(req, {
          message: `${request.user.name} accepted the quote and added the custom cake to cart!`,
          type: 'custom_cake',
          actionTab: 'custom-cakes',
          referenceId: request._id,
          recipientRole: 'admin'
        });
      } else if (status === 'Cancelled') {
        if (req.user.role === 'admin') {
          await dispatchNotification(req, {
            userId: request.user._id,
            message: `Your custom cake request was cancelled by the bakery.`,
            type: 'custom_cake',
            actionTab: 'customcakes',
            referenceId: request._id,
            recipientRole: 'customer'
          });
        } else {
          await dispatchNotification(req, {
            message: `${request.user.name} cancelled their custom cake request.`,
            type: 'custom_cake',
            actionTab: 'custom-cakes',
            referenceId: request._id,
            recipientRole: 'admin'
          });
        }
      } else if (status === 'Rejected') {
        await dispatchNotification(req, {
          userId: request.user._id,
          message: `Your custom cake request was declined. Reason: ${adminNotes || 'Not specified'}`,
          type: 'custom_cake',
          actionTab: 'customcakes',
          referenceId: request._id,
          recipientRole: 'customer'
        });
      }
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRequest, getMyRequests, getAllRequests, updateRequestStatus };
