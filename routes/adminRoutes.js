const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  login, logout, protect, forgotPassword, resetPassword
} = require('../middleware/auth');
const {
  validateLogin, validateForgotPassword, validateResetPassword,
  validateChangePassword, validateUpdateProfile
} = require('../middleware/validation');
const {
  getAdminProfile, updateAdminProfile, changePassword, setupFirstAdmin
} = require('../controllers/adminController');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { status: 'fail', message: 'Too many login attempts, try again later' }
});

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { status: 'fail', message: 'Too many password reset requests' }
});

router.post('/setup-first-admin', setupFirstAdmin);
router.post('/login', loginLimiter, validateLogin, login);
router.post('/logout', logout);
router.post('/forgot-password', forgotLimiter, validateForgotPassword, forgotPassword);
router.patch('/reset-password/:token', validateResetPassword, resetPassword);

router.use(protect);

router.get('/profile', getAdminProfile);
router.patch('/profile', validateUpdateProfile, updateAdminProfile);
router.patch('/change-password', validateChangePassword, changePassword);

module.exports = router;