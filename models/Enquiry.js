const mongoose = require('mongoose');
const validator = require('validator');

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
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
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
  preferredLanguage: {
    type: String,
    enum: ['en', 'ar'],
    default: 'en'
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