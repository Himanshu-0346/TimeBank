const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', notificationController.getNotifications);
router.post('/mark-read/:id', notificationController.markRead);

module.exports = router;
