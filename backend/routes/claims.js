const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Claim = require('../models/Claim');
const Item = require('../models/Item');

// Get all claims for an item
router.get('/item/:itemId', async (req, res) => {
  try {
    const claims = await Claim.find({ item: req.params.itemId })
      .populate('claimant', 'displayName photoURL email')
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
});

// Get claims for current user
router.get('/user/me', auth, async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.userId })
      .populate('item')
      .populate('claimant', 'displayName photoURL email')
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
});

// Create claim
router.post('/', auth, async (req, res) => {
  try {
    const { itemId, description, evidence } = req.body;

    if (!itemId || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if user already claimed this item
    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.userId,
    });

    if (existingClaim) {
      return res.status(400).json({ error: 'You have already claimed this item' });
    }

    const claim = new Claim({
      item: itemId,
      claimant: req.userId,
      description,
      evidence: evidence || [],
      status: 'pending', // Always create as pending - admin must approve
    });

    await claim.save();
    await claim.populate('claimant', 'displayName photoURL email');

    res.status(201).json(claim);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create claim' });
  }
});

// Approve claim
router.put('/:id/approve', auth, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('item');

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Check if user is item owner
    if (claim.item.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    claim.status = 'approved';
    claim.item.status = 'claimed';
    
    await claim.save();
    await claim.item.save();

    res.json(claim);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve claim' });
  }
});

// Reject claim
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('item');

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Check if user is item owner
    if (claim.item.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    claim.status = 'rejected';
    await claim.save();

    res.json(claim);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject claim' });
  }
});

module.exports = router;
