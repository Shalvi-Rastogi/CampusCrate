const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');

// Middleware to check admin
const checkAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.isAdmin = true;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify admin status' });
  }
};

// Get dashboard stats
router.get('/stats', auth, checkAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalItems = await Item.countDocuments();
    const lostItems = await Item.countDocuments({ type: 'lost', status: 'active' });
    const foundItems = await Item.countDocuments({ type: 'found', status: 'active' });
    const pendingItems = await Item.countDocuments({ status: 'pending' });
    const pendingClaims = await Claim.countDocuments({ status: 'pending' });
    const resolvedClaims = await Claim.countDocuments({ status: 'approved' });

    res.json({
      totalUsers,
      totalItems,
      lostItems,
      foundItems,
      pendingItems,
      pendingClaims,
      resolvedClaims,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats: ' + error.message });
  }
});

// Get all users
router.get('/users', auth, checkAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-firebaseUid').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users: ' + error.message });
  }
});

// Get all items
router.get('/items', auth, checkAdmin, async (req, res) => {
  try {
    const items = await Item.find()
      .populate('owner', 'displayName email')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items: ' + error.message });
  }
});

// Get all claims
router.get('/claims', auth, checkAdmin, async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate('item')
      .populate('claimant', 'displayName email')
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch claims: ' + error.message });
  }
});

// Promote user to admin
router.put('/users/:userId/promote', auth, checkAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isAdmin: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to promote user' });
  }
});

// Demote user from admin
router.put('/users/:userId/demote', auth, checkAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isAdmin: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to demote user' });
  }
});

// Delete user
router.delete('/users/:userId', auth, checkAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Delete item
router.delete('/items/:itemId', auth, checkAdmin, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Approve item (pending -> active)
router.put('/items/:itemId/approve', auth, checkAdmin, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.itemId,
      { status: 'active' },
      { new: true }
    ).populate('owner', 'displayName photoURL email');

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve item: ' + error.message });
  }
});

// Reject item
router.put('/items/:itemId/reject', auth, checkAdmin, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item rejected and deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject item: ' + error.message });
  }
});

// Approve claim (admin)
router.put('/claims/:claimId/approve', auth, checkAdmin, async (req, res) => {
  try {
    console.log('Approving claim:', req.params.claimId);
    const claim = await Claim.findByIdAndUpdate(
      req.params.claimId,
      { status: 'approved' },
      { new: true }
    ).populate('claimant', 'displayName photoURL email')
     .populate('item', 'title type');

    if (!claim) {
      console.error('Claim not found:', req.params.claimId);
      return res.status(404).json({ error: 'Claim not found' });
    }

    console.log('Claim found, updating item:', claim.item._id);
    // Update item status to 'claimed'
    const updatedItem = await Item.findByIdAndUpdate(claim.item._id, { status: 'claimed' });
    console.log('Item updated to claimed:', updatedItem?._id);

    console.log('Sending response:', claim);
    res.json(claim);
  } catch (error) {
    console.error('Error approving claim:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to approve claim: ' + error.message });
  }
});

// Reject claim (admin)
router.put('/claims/:claimId/reject', auth, checkAdmin, async (req, res) => {
  try {
    console.log('Rejecting claim:', req.params.claimId);
    const claim = await Claim.findByIdAndUpdate(
      req.params.claimId,
      { status: 'rejected' },
      { new: true }
    ).populate('claimant', 'displayName photoURL email')
     .populate('item', 'title type');

    if (!claim) {
      console.error('Claim not found:', req.params.claimId);
      return res.status(404).json({ error: 'Claim not found' });
    }

    res.json(claim);
  } catch (error) {
    console.error('Error rejecting claim:', error.message);
    res.status(500).json({ error: 'Failed to reject claim: ' + error.message });
  }
});

module.exports = router;