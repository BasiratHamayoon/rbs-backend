const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Project category is required'],
    enum: ['Bathrooms', 'Kitchens', 'Stores', 'Restaurants', 'Buildings', 'Houses', 'Hospitals', 'Hotels']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  images: [{
    url: String,
    public_id: String,
    caption: String
  }],
  duration: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
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
  features: [String],
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

// Index for better query performance
projectSchema.index({ category: 1, createdAt: -1 });
projectSchema.index({ featured: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);