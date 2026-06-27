const Razorpay = require('razorpay');
const crypto = require('crypto');

const createRazorpayOrder = async (req, res) => {
  try {
    const { totalAmount } = req.body;
    
    if (!totalAmount) {
      return res.status(400).json({ message: 'Total amount is required' });
    }

    // Advance amount is 20% of totalAmount, rounded up
    const advanceAmountRupees = Math.ceil(totalAmount * 0.2);
    const amountInPaise = advanceAmountRupees * 100;

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

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};
