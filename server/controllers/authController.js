const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const signup = async (req, res) => {
  try {
    const { name, mobile, email, password, confirmPassword } = req.body;

    if (!name || !mobile || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Invalid mobile number format' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const userExists = await User.findOne({ mobile });
    if (userExists) {
      return res.status(400).json({ message: 'User with this mobile number already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      mobile,
      email,
      passwordHash,
    });

    const token = generateToken(user._id, user.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { loginId, password } = req.body; // loginId can be email or mobile

    if (!loginId || !password) {
      return res.status(400).json({ message: 'Please provide login ID and password' });
    }

    const isEmail = loginId.includes('@');
    const query = isEmail ? { email: loginId } : { mobile: loginId };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      id: user._id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(0),
  });
  res.json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    res.json({
      id: req.user._id,
      name: req.user.name,
      mobile: req.user.mobile,
      email: req.user.email,
      role: req.user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const admin = require('../config/firebaseAdmin');

const firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    // Verify the Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Check if it's a phone login or Google login
    const isGoogleLogin = decodedToken.firebase.sign_in_provider === 'google.com';
    
    if (isGoogleLogin) {
      const email = decodedToken.email;
      if (!email) {
        return res.status(400).json({ message: 'Email not found in Google token' });
      }

      let user = await User.findOne({ email });

      if (!user) {
        // User does not exist. They must provide a mobile number (Option B).
        return res.status(206).json({ 
          requireMobile: true,
          message: 'Please provide a mobile number to complete registration'
        });
      } else {
        // User exists, just log them in
        if (!user.firebaseUid) {
          user.firebaseUid = decodedToken.uid;
          await user.save();
        }
        
        const token = generateToken(user._id, user.role);
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({
          id: user._id,
          name: user.name,
          mobile: user.mobile,
          role: user.role,
        });
      }
    } else {
      // It's a phone login (OTP)
      let mobile = decodedToken.phone_number;

      if (!mobile) {
        return res.status(400).json({ message: 'Phone number not found in Firebase token' });
      }

      if (mobile.startsWith('+91')) {
        mobile = mobile.replace('+91', '');
      } else if (mobile.startsWith('+')) {
        mobile = mobile.slice(-10);
      }

      let user = await User.findOne({ mobile });

      if (!user) {
        user = await User.create({
          name: `User_${mobile.slice(-4)}`,
          mobile: mobile,
          firebaseUid: decodedToken.uid,
          role: 'customer'
        });
      } else if (!user.firebaseUid) {
        user.firebaseUid = decodedToken.uid;
        await user.save();
      }

      const token = generateToken(user._id, user.role);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
      });
    }
  } catch (error) {
    console.error('Firebase Login Error:', error);
    res.status(401).json({ message: 'Invalid or expired Firebase token' });
  }
};

const completeGoogleSignup = async (req, res) => {
  try {
    const { idToken, mobile } = req.body;
    
    if (!idToken || !mobile) {
      return res.status(400).json({ message: 'ID token and mobile number are required' });
    }
    
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Invalid mobile number format' });
    }

    // Verify token again for security
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const email = decodedToken.email;
    const name = decodedToken.name || `User_${mobile.slice(-4)}`;
    
    if (!email) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    // Ensure mobile is not already in use
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ message: 'This mobile number is already registered to another account' });
    }

    // Create the user
    const user = await User.create({
      name,
      email,
      mobile,
      firebaseUid: decodedToken.uid,
      role: 'customer'
    });

    const token = generateToken(user._id, user.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      id: user._id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
    });
  } catch (error) {
    console.error('Complete Google Signup Error:', error);
    res.status(500).json({ message: 'Failed to complete registration' });
  }
};

module.exports = { signup, login, logout, getMe, firebaseLogin, completeGoogleSignup };
