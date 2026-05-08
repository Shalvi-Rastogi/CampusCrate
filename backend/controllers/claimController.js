const Claim = require('../models/Claim');
const Item = require('../models/Item');
const { sendEmail } = require('../utils/emailService');

// Create new claim
const createClaim = async (req, res) => {
  try {
    const { itemId, message } = req.body;

    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if user has already claimed this item
    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.userId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingClaim) {
      return res.status(400).json({ error: 'You have already claimed this item' });
    }

    const claim = new Claim({
      item: itemId,
      claimant: req.userId,
      itemOwner: item.owner,
      message: message || '',
      status: 'pending',
      createdAt: new Date(),
    });

    await claim.save();
    await claim.populate([
      { path: 'item', select: 'title description photos' },
      { path: 'claimant', select: 'displayName email' },
      { path: 'itemOwner', select: 'displayName email' }
    ]);

    res.status(201).json({
      message: 'Claim submitted successfully',
      claim,
    });
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({ error: 'Failed to create claim' });
  }
};

// Get user's claims
const getUserClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.userId })
      .populate([
        { path: 'item', select: 'title description photos' },
        { path: 'itemOwner', select: 'displayName email' }
      ])
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
};

// Get claims for user's items
const getItemClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ itemOwner: req.userId })
      .populate([
        { path: 'item', select: 'title description' },
        { path: 'claimant', select: 'displayName email' }
      ])
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (error) {
    console.error('Error fetching item claims:', error);
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
};

// Approve claim
const approveClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Check authorization
    if (claim.itemOwner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to approve this claim' });
    }

    claim.status = 'approved';
    claim.approvedAt = new Date();
    await claim.save();

    await claim.populate([
      { path: 'item', select: 'title' },
      { path: 'claimant', select: 'displayName email' }
    ]);

    // Send approval email
    if (claim.claimant && claim.claimant.email) {
      await sendEmail(
        claim.claimant.email,
        `Your claim for "${claim.item.title}" has been approved!`
      );
    }

    res.json({
      message: 'Claim approved',
      claim,
    });
  } catch (error) {
    console.error('Error approving claim:', error);
    res.status(500).json({ error: 'Failed to approve claim' });
  }
};

// Reject claim
const rejectClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Check authorization
    if (claim.itemOwner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to reject this claim' });
    }

    claim.status = 'rejected';
    claim.rejectedAt = new Date();
    await claim.save();

    await claim.populate([
      { path: 'item', select: 'title' },
      { path: 'claimant', select: 'displayName email' }
    ]);

    res.json({
      message: 'Claim rejected',
      claim,
    });
  } catch (error) {
    console.error('Error rejecting claim:', error);
    res.status(500).json({ error: 'Failed to reject claim' });
  }
};

// Resolve claim
const resolveClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Check authorization
    if (claim.itemOwner.toString() !== req.userId && claim.claimant.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to resolve this claim' });
    }

    if (claim.status !== 'approved') {
      return res.status(400).json({ error: 'Only approved claims can be resolved' });
    }

    claim.status = 'resolved';
    claim.resolvedAt = new Date();
    await claim.save();

    // Mark item as resolved
    await Item.findByIdAndUpdate(req.params.id, { status: 'resolved' });

    await claim.populate([
      { path: 'item', select: 'title' },
      { path: 'claimant', select: 'displayName email' },
      { path: 'itemOwner', select: 'displayName email' }
    ]);

    res.json({
      message: 'Claim resolved',
      claim,
    });
  } catch (error) {
    console.error('Error resolving claim:', error);
    res.status(500).json({ error: 'Failed to resolve claim' });
  }
};

module.exports = {
  createClaim,
  getUserClaims,
  getItemClaims,
  approveClaim,
  rejectClaim,
  resolveClaim,
};
