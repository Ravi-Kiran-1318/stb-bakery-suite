const User = require('../models/User');
const bcrypt = require('bcrypt');

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

const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const newAddress = req.body;
    
    if (newAddress.isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    } else if (user.addresses.length === 0) {
      newAddress.isDefault = true;
    }
    
    user.addresses.push(newAddress);
    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addressId = req.params.id;
    const updates = req.body;
    
    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    
    if (updates.isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }
    
    Object.assign(address, updates);
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addressId = req.params.id;
    
    user.addresses = user.addresses.filter(a => a._id.toString() !== addressId);
    
    // If we deleted the default, make the first one default
    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }
    
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, mobile, email } = req.body;
    const user = await User.findById(req.user._id);
    
    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    if (email !== undefined) user.email = email;
    
    await user.save();
    
    res.json({
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }
    
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getCustomers, getReminders, addReminder, deleteReminder,
  getAddresses, addAddress, updateAddress, deleteAddress,
  updateProfile, updatePassword
};
