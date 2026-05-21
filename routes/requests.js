const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

// Create new request form
router.get('/new', requestController.getNewRequest);

// Post new request
router.post('/new', requestController.postNewRequest);

// View all requests
router.get('/all', requestController.getAllRequests);

// View my posted requests
router.get('/my', requestController.getMyRequests);

// View requests I am helping with
router.get('/helping', requestController.getHelpingRequests);

// View single request
router.get('/:id', requestController.getRequestById);

// Accept a request
router.post('/:id/accept', requestController.acceptRequest);

// Mark as complete
router.post('/:id/complete', requestController.completeRequest);

// Claim Escrow
router.post('/:id/claim-escrow', requestController.claimEscrow);

module.exports = router;
