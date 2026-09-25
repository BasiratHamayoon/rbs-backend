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
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Project category is required']
  },
  description: {
    en: {
      type: String,
      required: [true, 'English description is required'],
      maxlength: 1000
    },
    ar: {
      type: String,
      required: [true, 'Arabic description is required'],
      maxlength: 1000
    }
  },
  shortDescription: {
    en: { type: String, maxlength: 300 },
    ar: { type: String, maxlength: 300 }
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
  technologies: [String],
  features: {
    en: [String],
    ar: [String]
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

projectSchema.index({ category: 1, createdAt: -1 });
projectSchema.index({ featured: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);