const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { createQuote, getAllQuotes } = require('../controllers/quoteController');

const router = express.Router();

// Public route - anyone can submit quote request
router.post('/', createQuote);

// Protected routes (Admin only)
router.get('/', protect, restrictTo('admin'), getAllQuotes);

module.exports = router;