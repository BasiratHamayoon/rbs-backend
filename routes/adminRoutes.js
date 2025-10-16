const express = require('express');
const { login, protect, restrictTo } = require('../middleware/auth');
const { getAdminProfile, updateAdminProfile } = require('../controllers/adminController');

const router = express.Router();

router.post('/login', login);
router.get('/profile', protect, restrictTo('admin'), getAdminProfile);
router.patch('/profile', protect, restrictTo('admin'), updateAdminProfile);

module.exports = router;