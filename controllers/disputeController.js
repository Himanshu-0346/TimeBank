const disputeService = require('../services/disputeService');

exports.getJuryDashboard = async (req, res) => {
  try {
    const disputes = await disputeService.getJuryDisputes(res.locals.currentUser);
    res.render('disputes/jury', { title: 'Jury Duty', disputes });
  } catch (err) {
    console.error(err);
    if (err.message.includes('Only Trusted Users')) {
      return res.status(403).render('error', { title: 'Access Denied', message: err.message });
    }
    res.status(500).send('Server Error');
  }
};

exports.raiseDispute = async (req, res) => {
  try {
    await disputeService.raiseDispute(req.params.requestId, res.locals.currentUser, req.body.reason);
    res.redirect(`/requests/${req.params.requestId}`);
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message || 'Server Error');
  }
};

exports.respondToDispute = async (req, res) => {
  try {
    const dispute = await disputeService.respondToDispute(req.params.disputeId, res.locals.currentUser, req.body.defendantResponse);
    res.redirect(`/requests/${dispute.request.id}`);
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message || 'Server Error');
  }
};

exports.voteOnDispute = async (req, res) => {
  try {
    await disputeService.voteOnDispute(req.params.disputeId, res.locals.currentUser, req.body.voteFor);
    res.redirect('/disputes/jury');
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message || 'Server Error');
  }
};
