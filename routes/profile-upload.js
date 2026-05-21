// routes/profile-updated.js
// Profile routes with Multer + Cloudinary integration

const express = require('express');
const router = express.Router();
const upload = require('../config/multer'); // Multer middleware
const { uploadUserAvatar, getUserProfile, updateProfile } = require('../services/profileService');
const { isAuthenticated } = require('../middleware/auth'); // Authentication middleware

/**
 * GET /profile/me
 * Retrieve current user's full profile
 * 
 * FLOW:
 *   1. User makes GET request
 *   2. isAuthenticated() verifies user session
 *   3. Service queries database for user + relations
 *   4. Return profile with stats
 */
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    const profile = await getUserProfile(req.user.id);
    res.render('profile/show', { profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /profile/edit
 * Show edit profile form
 */
router.get('/edit', isAuthenticated, (req, res) => {
  res.render('profile/edit', { user: req.user });
});

/**
 * POST /profile/update
 * Update user profile information
 * 
 * WHAT HAPPENS:
 *   1. User submits form with name, bio, location, skills
 *   2. isAuthenticated() checks if user is logged in
 *   3. Service updates database
 *   4. Redirect to profile page
 */
router.post('/update', isAuthenticated, async (req, res) => {
  try {
    const { name, bio, location, skills } = req.body;

    const updatedUser = await updateProfile(req.user.id, {
      name,
      bio,
      location,
      skills: skills.split(',') // Convert comma-separated to array
    });

    res.redirect('/profile/me');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /profile/upload-avatar
 * Upload user avatar to Cloudinary
 * 
 * MULTER + CLOUDINARY WORKFLOW:
 *   1. upload.single('avatar') - Multer intercepts file from form
 *   2. Stores file in memory (not disk)
 *   3. uploadUserAvatar() function:
 *      a. Takes file buffer
 *      b. Calls Cloudinary API
 *      c. Cloudinary stores image in cloud, returns URL
 *      d. Updates MongoDB with new URL
 *      e. Deletes old image from Cloudinary
 *   4. Return success response
 * 
 * WHY THIS IS BETTER THAN SAVING TO SERVER:
 *   - No disk space used ✓
 *   - CDN delivery (faster) ✓
 *   - Auto image optimization ✓
 *   - Scalable (no server storage limits) ✓
 *   - Free tier: 25GB storage ✓
 * 
 * FORM EXAMPLE:
 *   <form action="/profile/upload-avatar" method="POST" enctype="multipart/form-data">
 *     <input type="file" name="avatar" accept="image/*" required>
 *     <button type="submit">Upload</button>
 *   </form>
 */
router.post('/upload-avatar', isAuthenticated, upload.single('avatar'), async (req, res) => {
  try {
    // Multer stored file in req.file.buffer (memory)
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check file type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files allowed' });
    }

    // Upload to Cloudinary and update user
    const result = await uploadUserAvatar(req.user.id, req.file.buffer);

    // If API request, return JSON
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json(result);
    }

    // If form submission, redirect
    res.redirect('/profile/me');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /profile/upload-avatar-api
 * API endpoint for avatar upload with response
 * 
 * Used by JavaScript fetch requests
 */
router.post('/upload-avatar-api', isAuthenticated, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadUserAvatar(req.user.id, req.file.buffer);

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: result.avatarUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
