const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'clothing', 'accessories', 'documents', 'other'],
  },
  type: {
    type: String,
    required: true,
    enum: ['lost', 'found'],
  },
  location: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  claimQuestion: {
    type: String,
    default: null,
  },
  tags: [{
    type: String,
  }],
  photoUrl: {
    type: String,
    default: null,
  },
  // Keep photos field for backward compatibility with existing data
  photos: [{
    type: String,
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'claimed', 'resolved'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual getter to handle both photoUrl and photos array
itemSchema.virtual('photo').get(function() {
  return this.photoUrl || (this.photos && this.photos.length > 0 ? this.photos[0] : null);
});

// Ensure virtuals are included in JSON output
itemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Item', itemSchema);
