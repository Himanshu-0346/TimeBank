const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/auth');

// View profile
router.get('/:id', profileController.getProfile);

// Edit profile form
router.get('/edit/me', isAuthenticated, profileController.getEditProfile);

// Update profile
router.post('/edit/me', isAuthenticated, profileController.postEditProfile);

// Post review
router.post('/:id/review', isAuthenticated, profileController.postReview);

module.exports = router;
