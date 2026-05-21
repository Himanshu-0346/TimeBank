const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', rewardController.getRewards);
router.post('/claim/:id', rewardController.claimReward);

module.exports = router;
