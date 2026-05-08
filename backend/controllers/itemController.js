const Item = require('../models/Item');
const fs = require('fs');
const path = require('path');

// Get all items with filtering
const getAllItems = async (req, res) => {
  try {
    const { type, category, search, status, page = 1, limit = 10 } = req.query;
    const filter = { status: 'active' };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status && status !== 'all') filter.status = status;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await Item.find(filter)
      .populate('owner', 'displayName photoURL email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Item.countDocuments(filter);

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

// Get single item
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'displayName photoURL email');

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
};

// Get user's items
const getUserItems = async (req, res) => {
  try {
    const items = await Item.find({ owner: req.params.userId })
      .populate('owner', 'displayName photoURL email')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error('Error fetching user items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

// Create new item
const createItem = async (req, res) => {
  try {
    const { title, description, category, type, location, contact, status } = req.body;
    const photos = req.files ? req.files.map(f => f.filename) : [];

    if (!title || !description || !category || !type || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const item = new Item({
      owner: req.userId,
      title: title.trim(),
      description: description.trim(),
      category,
      type,
      location: location.trim(),
      contact: contact || {},
      photos,
      status: status || 'pending',
      createdAt: new Date(),
    });

    await item.save();
    await item.populate('owner', 'displayName photoURL email');

    res.status(201).json({
      message: 'Item posted successfully',
      item,
    });
  } catch (error) {
    console.error('Error creating item:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(f => {
        try {
          fs.unlinkSync(path.join(__dirname, '../uploads', f.filename));
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: `Validation failed: ${messages.join(', ')}` });
    }

    res.status(500).json({ error: 'Failed to create item' });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check authorization
    if (item.owner.toString() !== req.userId && !req.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to update this item' });
    }

    const { title, description, category, type, location, contact, status } = req.body;

    if (title) item.title = title.trim();
    if (description) item.description = description.trim();
    if (category) item.category = category;
    if (type) item.type = type;
    if (location) item.location = location.trim();
    if (contact) item.contact = contact;
    if (status) item.status = status;

    // Handle new photo uploads
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(f => f.filename);
      item.photos = [...(item.photos || []), ...newPhotos];
    }

    item.updatedAt = new Date();
    await item.save();
    await item.populate('owner', 'displayName photoURL email');

    res.json({
      message: 'Item updated successfully',
      item,
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check authorization
    if (item.owner.toString() !== req.userId && !req.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }

    // Delete associated photos
    if (item.photos && item.photos.length > 0) {
      item.photos.forEach(photo => {
        try {
          fs.unlinkSync(path.join(__dirname, '../uploads', photo));
        } catch (err) {
          console.error('Error deleting photo:', err);
        }
      });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

// Approve item (admin)
const approveItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    ).populate('owner', 'displayName photoURL email');

    res.json({
      message: 'Item approved',
      item,
    });
  } catch (error) {
    console.error('Error approving item:', error);
    res.status(500).json({ error: 'Failed to approve item' });
  }
};

// Reject item (admin)
const rejectItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).populate('owner', 'displayName photoURL email');

    res.json({
      message: 'Item rejected',
      item,
    });
  } catch (error) {
    console.error('Error rejecting item:', error);
    res.status(500).json({ error: 'Failed to reject item' });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  getUserItems,
  createItem,
  updateItem,
  deleteItem,
  approveItem,
  rejectItem,
};
