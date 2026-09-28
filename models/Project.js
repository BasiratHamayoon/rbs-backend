const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    en: {
      type: String,
      required: [true, 'English title is required'],
      trim: true,
      maxlength: 100
    },
    ar: {
      type: String,
      required: [true, 'Arabic title is required'],
      trim: true,
      maxlength: 100
    }
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Project category is required']
  },
  description: {
    en: {
      type: String,
      required: [true, 'English description is required'],
      maxlength: 2000
    },
    ar: {
      type: String,
      required: [true, 'Arabic description is required'],
      maxlength: 2000
    }
  },
  shortDescription: {
    en: { type: String, maxlength: 500, default: '' },
    ar: { type: String, maxlength: 500, default: '' }
  },
  images: [{
    url: String,
    public_id: String,
    caption: {
      en: String,
      ar: String
    }
  }],
  duration: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  size: {
    type: String,
    required: true
  },
  location: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  client: {
    type: String,
    required: true
  },
  completionDate: {
    type: Date,
    required: true
  },
  technologies: {
    type: [String],
    default: []
  },
  features: {
    en: { type: [String], default: [] },
    ar: { type: [String], default: [] }
  },
  status: {
    type: String,
    enum: ['completed', 'ongoing', 'upcoming'],
    default: 'completed'
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-generate a unique slug before validation
projectSchema.pre('validate', function(next) {
  if (this.title && this.title.en) {
    const baseSlug = this.title.en
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    this.slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;
  }
  next();
});

projectSchema.index({ category: 1, createdAt: -1 });
projectSchema.index({ featured: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);