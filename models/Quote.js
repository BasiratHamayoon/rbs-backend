const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  telephone: {
    type: String,
    required: [true, 'Telephone is required']
  },
  message: {
    type: String,
    required: [true, 'Message is required']
  },
  projectType: {
    type: String,
    enum: ['residential', 'commercial', 'renovation', 'new-construction', 'other'],
    required: true
  },
  budget: {
    type: String,
    enum: ['under-10k', '10k-50k', '50k-100k', '100k-500k', '500k-plus']
  },
  timeline: {
    type: String,
    enum: ['immediately', '1-3 months', '3-6 months', '6-12 months', 'flexible']
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'quoted', 'won', 'lost'],
    default: 'new'
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Quote', quoteSchema);