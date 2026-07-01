const Razorpay = require('razorpay');
const crypto = require('crypto');

const createRazorpayOrder = async (req, res) => {
  try {
    const { totalAmount } = req.body;
    
    if (!totalAmount) {
      return res.status(400).json({ message: 'Total amount is required' });
    }

    const advanceAmountRupees = Math.ceil(totalAmount * 0.2);
    const amountInPaise = advanceAmountRupees * 100;

    if (amountInPaise < 100) {
      return res.status(400).json({ message: 'Amount must be at least 100 paise (1 INR)' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      razorpayOrderId: order.id,
      advanceAmount: advanceAmountRupees,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    if (error.statusCode === 401 || (error.error && error.error.code === 'BAD_REQUEST_ERROR' && error.error.description.includes('authorized'))) {
      return res.status(401).json({ message: 'Razorpay authentication failed' });
    }
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Payment details are missing' });
    }

    const body = razorpayOrderId + '|' + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpaySignature) {
      res.json({ verified: true });
    } else {
      res.status(400).json({ message: 'Invalid payment signature', verified: false });
    }
  } catch (error) {
    console.error('Razorpay verify error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

const Order = require('../models/Order');

const razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not defined');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
    return res.status(400).json({ message: 'Missing signature' });
  }

  try {
    // Generate our signature to compare with Razorpay's signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const { event, payload } = req.body;
    let paymentEntity = payload.payment ? payload.payment.entity : null;
    let orderEntity = payload.order ? payload.order.entity : null;

    let razorpayOrderId = null;
    
    if (paymentEntity) {
      razorpayOrderId = paymentEntity.order_id;
    } else if (orderEntity) {
      razorpayOrderId = orderEntity.id;
    }

    if (razorpayOrderId) {
      const order = await Order.findOne({ razorpayOrderId });
      if (order) {
        switch (event) {
          case 'payment.captured':
          case 'order.paid':
            // Since we take a 20% advance, capturing a payment marks it as Partial.
            // (If the business logic evolves to full payments, this might be 'Paid')
            if (order.paymentStatus === 'Pending') {
               order.paymentStatus = 'Partial';
               if (paymentEntity && paymentEntity.id) {
                 order.razorpayPaymentId = paymentEntity.id;
               }
               await order.save();
               console.log(`Webhook: Order ${order._id} marked as Partial/Paid for ${razorpayOrderId}`);
            }
            break;
          case 'payment.failed':
            if (order.paymentStatus !== 'Partial') {
              order.paymentStatus = 'Failed';
              await order.save();
              console.log(`Webhook: Order ${order._id} payment failed for ${razorpayOrderId}`);
            }
            break;
          default:
            console.log(`Unhandled Razorpay event: ${event}`);
        }
      } else {
        console.warn(`Webhook: Order not found for Razorpay Order ID: ${razorpayOrderId}`);
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  razorpayWebhook,
};
