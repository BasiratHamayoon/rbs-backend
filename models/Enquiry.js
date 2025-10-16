const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
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
  enquiryType: {
    type: String,
    required: true,
    enum: ['General Inquiry', 'Project Consultation', 'Partnership Opportunity', 'Career Opportunities', 'Media Inquiry', 'Technical Support', 'Other']
  },
  phoneCountryCode: {
    type: String,
    default: '+1'
  },
  preferredContact: {
    type: String,
    enum: ['email', 'phone', 'write', 'do not'],
    default: 'email'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'in-progress', 'resolved'],
    default: 'new'
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Enquiry', enquirySchema);