const express = require('express');
const { login, protect, restrictTo } = require('../middleware/auth');
const { 
  getAdminProfile, 
  updateAdminProfile, 
  changePassword
} = require('../controllers/adminController');

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes (all admins)
router.use(protect); // All routes below are protected

router.get('/profile', getAdminProfile);
router.patch('/profile', updateAdminProfile);
router.patch('/change-password', changePassword);

module.exports = router;