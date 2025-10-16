const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { validateEnquiry } = require('../middleware/validation');
const {
  getAllEnquiries,
  getEnquiry,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getEnquiryStats
} = require('../controllers/enquiryController');

const router = express.Router();

// Public route - anyone can submit enquiry
router.post('/', validateEnquiry, createEnquiry);

// Protected routes (Admin only)
router.use(protect, restrictTo('admin'));

router.get('/', getAllEnquiries);
router.get('/stats', getEnquiryStats);
router.get('/:id', getEnquiry);
router.patch('/:id', updateEnquiry);
router.delete('/:id', deleteEnquiry);

module.exports = router;