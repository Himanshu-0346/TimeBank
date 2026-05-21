const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

// Jury Dashboard
router.get('/jury', disputeController.getJuryDashboard);

// Raise Dispute
router.post('/:requestId/raise', disputeController.raiseDispute);

// Defendant Respond
router.post('/:disputeId/respond', disputeController.respondToDispute);

// Vote on Dispute
router.post('/:disputeId/vote', disputeController.voteOnDispute);

module.exports = router;
