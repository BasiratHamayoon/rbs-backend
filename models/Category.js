const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    en: {
      type: String,
      required: [true, 'English category name is required'],
      trim: true
    },
    ar: {
      type: String,
      required: [true, 'Arabic category name is required'],
      trim: true
    }
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    en: { type: String, trim: true, default: '' },
    ar: { type: String, trim: true, default: '' }
  },
  icon: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Run BEFORE validation so 'slug' is populated when required check executes
categorySchema.pre('validate', function(next) {
  if (this.name && this.name.en) {
    this.slug = this.name.en
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);