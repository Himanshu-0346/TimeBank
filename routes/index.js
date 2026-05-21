const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const { isAuthenticated } = require('../middleware/auth');

// Landing Page
router.get('/', indexController.getLandingPage);

// Dashboard
router.get('/dashboard', isAuthenticated, indexController.getDashboard);

module.exports = router;
