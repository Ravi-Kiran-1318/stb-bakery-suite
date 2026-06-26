const User = require('../models/User');

const getCustomers = async (req, res) => {
  try {
    const customers = await User.aggregate([
      { $match: { role: 'customer' } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'userOrders',
        },
      },
      {
        $project: {
          name: 1,
          mobile: 1,
          email: 1,
          loyaltyPoints: 1,
          createdAt: 1,
          occasionReminders: 1,
          totalOrders: { $size: '$userOrders' },
          totalSpent: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$userOrders',
                    as: 'order',
                    cond: { $ne: ['$$order.status', 'Cancelled'] },
                  },
                },
                as: 'validOrder',
                in: '$$validOrder.totalAmount',
              },
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReminders = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.occasionReminders || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addReminder = async (req, res) => {
  try {
    const { label, date } = req.body;
    if (!label || !date) {
      return res.status(400).json({ message: 'Label and date (MM-DD) are required.' });
    }
    const user = await User.findById(req.user._id);
    user.occasionReminders.push({ label, date, reminderSent: false });
    await user.save();
    res.status(201).json(user.occasionReminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReminder = async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const user = await User.findById(req.user._id);
    if (index >= 0 && index < user.occasionReminders.length) {
      user.occasionReminders.splice(index, 1);
      await user.save();
    }
    res.json(user.occasionReminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCustomers, getReminders, addReminder, deleteReminder };
