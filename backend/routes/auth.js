const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendEmail, generateVerificationCode } = require('../utils/emailService');

// Register with email and password
router.post('/register', async (req, res) => {
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

    // Check if user already exists in MongoDB
    let existingUser = await User.findOne({ email });
    
    // If user exists but was deleted from Firebase, we can allow re-registration
    // But only if they have no valid firebaseUid and isVerified is false
    if (existingUser && existingUser.firebaseUid && existingUser.isVerified) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // If unverified user exists with same email (from incomplete registration), update it
    if (existingUser && !existingUser.isVerified) {
      // Update the existing unverified user
      const verificationCode = generateVerificationCode();
      const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

      const updatedUser = await User.findOneAndUpdate(
        { _id: existingUser._id },
        {
          firebaseUid: firebaseUid || null,
          displayName: displayName,
          verificationCode: verificationCode,
          verificationCodeExpiry: verificationCodeExpiry,
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      );

      // Send verification email
      await sendEmail(email, verificationCode);

      return res.json({
        message: 'Registration code sent. Please verify your email.',
        userId: updatedUser._id,
        email: updatedUser.email,
        requiresVerification: true,
      });
    }

    // If user was deleted from both systems, create new account
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Use upsert to handle edge case where deleted user's email still exists in index
    const savedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase() }, // Find by email (case-insensitive)
      {
        firebaseUid: firebaseUid || null,
        email: email.toLowerCase(),
        displayName: displayName,
        photoURL: null,
        isAdmin: userType === 'admin' ? true : false,
        isVerified: false,
        verificationCode,
        verificationCodeExpiry,
        updatedAt: new Date(),
      },
      { 
        upsert: true,  // Create if doesn't exist
        new: true,     // Return the updated document
        runValidators: true,
      }
    );

    // Send verification email
    await sendEmail(email, verificationCode);

    res.json({
      message: 'Registration successful. Please verify your email.',
      userId: savedUser._id,
      email: savedUser.email,
      requiresVerification: true,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: `Validation failed: ${messages.join(', ')}` });
    }

    // Handle Mongoose duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists. Please use a different ${field}.` });
    }

    // Handle other database errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({ error: `Database error: ${error.message}` });
    }

    // Generic error
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// Verify email with code
router.post('/verify-email', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Check verification code
    if (user.verificationCode !== verificationCode) {
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    // Check if code expired
    if (new Date() > user.verificationCodeExpiry) {
      return res.status(401).json({ error: 'Verification code expired' });
    }

    // Mark user as verified
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
        photoURL: user.photoURL,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Resend verification code
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

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
    res.status(500).json({ error: 'Failed to resend verification code' });
  }
});

// Login/Register with Firebase token
router.post('/login', async (req, res) => {
  try {
    const { firebaseUid, email, displayName, photoURL } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find or create user
    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = new User({
        firebaseUid,
        email,
        displayName,
        photoURL,
        isVerified: true, // Firebase users are automatically verified
      });
      await user.save();
    } else {
      // Update user info if changed
      user.displayName = displayName || user.displayName;
      user.photoURL = photoURL || user.photoURL;
      user.isVerified = true; // Firebase users are automatically verified
      await user.save();
    }

    // Check if user is verified (for email/password registered users)
    if (!user.isVerified) {
      return res.status(403).json({ 
        error: 'Email not verified. Please verify your email first.',
        email: user.email,
        requiresVerification: true,
      });
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
        photoURL: user.photoURL,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-__v');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Logout
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Admin Login with email and password
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find admin user
    const user = await User.findOne({ email, isAdmin: true });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = password === user.password;

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
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
        photoURL: user.photoURL,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin Register with email, password and secret key
router.post('/admin-register', async (req, res) => {
  try {
    const { email, password, adminName, secretKey, userType } = req.body;

    if (!email || !password || !adminName || !secretKey) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate secret key
    const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'admin-secret-key-123';
    if (secretKey !== ADMIN_SECRET_KEY) {
      return res.status(403).json({ error: 'Invalid admin secret key' });
    }

    // Check if admin email already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new admin user
    const admin = new User({
      firebaseUid: null,
      email,
      displayName: adminName,
      password: password,
      photoURL: null,
      isAdmin: true,
    });
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: admin._id, email: admin.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: admin._id,
        email: admin.email,
        displayName: admin.displayName,
        isAdmin: admin.isAdmin,
      },
    });
  } catch (error) {
    console.error('Admin register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Delete user account
router.post('/delete-account', auth, async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.userId;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user from MongoDB
    await User.findByIdAndDelete(userId);

    // Clear user data from localStorage on frontend (will be handled by frontend)
    res.json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Reset/Clear user data (for testing/cleanup)
router.post('/cleanup-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find and delete user by email
    const user = await User.findOneAndDelete({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User data cleared successfully',
      email: email,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup user data' });
  }
});

// Claim form submission
router.post('/submit-claim', auth, async (req, res) => {
  try {
    const { id, message } = req.body;

    if (!id || !message) {
      return res.status(400).json({ error: 'ID and message are required' });
    }

    // Find the user by ID
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Here you would handle the claim submission logic
    // For now, we'll just return the received data
    res.json({
      itemId: id,
      message: claimForm.message
    });
  } catch (error) {
    res.status(500).json({ error: 'Claim submission failed' });
    res.status(500).json({ error: 'Failed to submit claim' });
  }
});

module.exports = router;
