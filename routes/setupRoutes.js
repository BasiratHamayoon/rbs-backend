const express = require('express');
const { checkSetupStatus, initialAdminSetup } = require('../controllers/setupController');

const router = express.Router();

// Public routes for initial setup
router.get('/status', checkSetupStatus);
router.post('/create', initialAdminSetup);

module.exports = router;