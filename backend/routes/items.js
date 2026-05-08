const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const Item = require('../models/Item');
const fs = require('fs');

// Configure multer
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Get all items with filtering
router.get('/', async (req, res) => {
  try {
    const { type, category, search, status } = req.query;
    const filter = { status: 'active' }; // Only show approved items by default

    if (type) filter.type = type;
    if (category) filter.category = category;
    // Allow status override only if explicitly requested
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await Item.find(filter)
      .populate('owner', 'displayName photoURL email')
      .sort({ createdAt: -1 });

    // Convert photos array to photoUrl for backward compatibility
    const itemsWithPhotoUrl = items.map(item => {
      const itemObj = item.toObject();
      if (!itemObj.photoUrl && itemObj.photos && itemObj.photos.length > 0) {
        itemObj.photoUrl = itemObj.photos[0];
      }
      return itemObj;
    });

    console.log('GET /items - Filter:', filter, 'Results:', itemsWithPhotoUrl.length);
    res.json(itemsWithPhotoUrl);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get user's items
router.get('/user/:userId', async (req, res) => {
  try {
    const items = await Item.find({ owner: req.params.userId })
      .populate('owner', 'displayName photoURL email')
      .sort({ createdAt: -1 });

    // Convert photos array to photoUrl for backward compatibility
    const itemsWithPhotoUrl = items.map(item => {
      const itemObj = item.toObject();
      if (!itemObj.photoUrl && itemObj.photos && itemObj.photos.length > 0) {
        itemObj.photoUrl = itemObj.photos[0];
      }
      return itemObj;
    });

    res.json(itemsWithPhotoUrl);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get single item (show if active OR if user owns it)
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'displayName photoURL email');

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Only show if active OR if user owns it (for draft/pending items)
    const isOwner = req.userId && item.owner._id.toString() === req.userId;
    if (item.status !== 'active' && !isOwner) {
      return res.status(403).json({ error: 'Item not found or not approved yet' });
    }

    // Convert photos array to photoUrl for backward compatibility
    const itemObj = item.toObject();
    if (!itemObj.photoUrl && itemObj.photos && itemObj.photos.length > 0) {
      itemObj.photoUrl = itemObj.photos[0];
    }

    res.json(itemObj);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Create item
router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    const { title, description, category, type, location, date, claimQuestion, tags } = req.body;

    if (!title || !description || !category || !type || !location || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Parse tags if it's a JSON string
    let tagsArray = [];
    if (tags) {
      try {
        tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        tagsArray = [];
      }
    }

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const itemData = {
      title: title.trim(),
      description: description.trim(),
      category: category.toLowerCase(),
      type,
      location: location.trim(),
      date: new Date(date),
      claimQuestion: claimQuestion ? claimQuestion.trim() : null,
      tags: tagsArray,
      photoUrl,
      owner: req.userId,
      status: 'pending',
    };

    const item = new Item(itemData);

    await item.save();
    await item.populate('owner', 'displayName photoURL email');

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to create item' });
  }
});

// Update item
router.put('/:id', auth, upload.single('photo'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { title, description, category, type, location, date, status, claimQuestion, tags } = req.body;

    if (title) item.title = title;
    if (description) item.description = description;
    if (category) item.category = category.toLowerCase();
    if (type) item.type = type;
    if (location) item.location = location;
    if (date) item.date = date;
    if (status) item.status = status;
    if (claimQuestion !== undefined) item.claimQuestion = claimQuestion;
    if (tags) {
      try {
        item.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        item.tags = [];
      }
    }

    if (req.file) {
      item.photoUrl = `/uploads/${req.file.filename}`;
    }

    item.updatedAt = Date.now();
    await item.save();
    await item.populate('owner', 'displayName photoURL email');

    res.json(item);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete associated photos
    if (item.photos && item.photos.length > 0) {
      item.photos.forEach(photo => {
        const filePath = path.join(__dirname, '..', photo);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;
