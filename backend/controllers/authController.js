const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail, generateVerificationCode } = require('../utils/emailService');

// Register with email and password
const register = async (req, res) => {
  try {
    const { firebaseUid, email, displayName, userType } = req.body;

    if (!email || !displayName) {
      return res.status(400).json({ error: 'Email and display name are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser && existingUser.firebaseUid && existingUser.isVerified) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update or create user
    const userData = {
      firebaseUid: firebaseUid || null,
      email: email.toLowerCase(),
      displayName: displayName,
      photoURL: null,
      isAdmin: userType === 'admin' ? true : false,
      isVerified: false,
      verificationCode,
      verificationCodeExpiry,
      updatedAt: new Date(),
    };

    let user;
    if (existingUser) {
      user = await User.findByIdAndUpdate(existingUser._id, userData, { new: true });
    } else {
      user = new User(userData);
      await user.save();
    }

    // Send verification email
    await sendEmail(email, verificationCode);

    res.json({
      message: 'Registration successful. Please verify your email.',
      userId: user._id,
      email: user.email,
      requiresVerification: true,
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: `Validation failed: ${messages.join(', ')}` });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    if (new Date() > user.verificationCodeExpiry) {
      return res.status(400).json({ error: 'Verification code expired. Request a new one' });
    }

    // Mark email as verified
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        isAdmin: user.isAdmin,
        photoURL: user.photoURL,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { firebaseUid, email, displayName } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        firebaseUid: firebaseUid || null,
        email: email.toLowerCase(),
        displayName: displayName || 'User',
        isVerified: true, // Firebase handles verification
        photoURL: null,
      });
      await user.save();
    } else {
      // Update Firebase UID and display name if different
      if (firebaseUid && !user.firebaseUid) {
        user.firebaseUid = firebaseUid;
      }
      if (displayName && user.displayName !== displayName) {
        user.displayName = displayName;
      }
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        isAdmin: user.isAdmin,
        photoURL: user.photoURL,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Resend verification code
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationCode = verificationCode;
    user.verificationCodeExpiry = verificationCodeExpiry;
    await user.save();

    // Send verification email
    await sendEmail(email, verificationCode);

    res.json({
      message: 'Verification code sent to your email',
      email: user.email,
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification code' });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-verificationCode -verificationCodeExpiry');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { displayName, photoURL } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { displayName, photoURL },
      { new: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  resendVerificationCode,
  getUserProfile,
  updateUserProfile,
};
