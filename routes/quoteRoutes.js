const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { validateQuote } = require('../middleware/validation');
const {
  createQuote, getAllQuotes, getQuote, updateQuote, deleteQuote
} = require('../controllers/quoteController');

const router = express.Router();

router.post('/', validateQuote, createQuote);

router.use(protect, restrictTo('admin', 'super-admin'));

router.get('/', getAllQuotes);
router.get('/:id', getQuote);
router.patch('/:id', updateQuote);
router.delete('/:id', deleteQuote);

module.exports = router;