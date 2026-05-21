const requestService = require('../services/requestService');

exports.getNewRequest = (req, res) => {
  res.render('requests/new', { title: 'New Help Request', error: null });
};

exports.postNewRequest = async (req, res) => {
  try {
    await requestService.createRequest(req.body, res.locals.currentUser);
    res.redirect('/requests/my');
  } catch (error) {
    console.error(error);
    res.render('requests/new', { title: 'New Help Request', error: error.message || 'Error creating request.' });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await requestService.getAllOpenRequests(res.locals.currentUser.id);
    res.render('requests/list', { title: 'All Open Requests', requests, type: 'all' });
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await requestService.getMyRequests(res.locals.currentUser.id);
    res.render('requests/list', { title: 'My Requests', requests, type: 'my' });
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.getHelpingRequests = async (req, res) => {
  try {
    const requests = await requestService.getHelpingRequests(res.locals.currentUser.id);
    res.render('requests/list', { title: 'Requests I am Helping', requests, type: 'helping' });
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const { request, dispute } = await requestService.getRequestById(req.params.id);
    res.render('requests/show', { title: request.title, request, dispute });
  } catch (error) {
    console.error(error);
    res.status(404).send(error.message || 'Server Error');
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const request = await requestService.acceptRequest(req.params.id, res.locals.currentUser);
    res.redirect(`/requests/${request.id}`);
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message || 'Server Error');
  }
};

exports.completeRequest = async (req, res) => {
  try {
    const request = await requestService.completeRequest(req.params.id, res.locals.currentUser);
    res.redirect(`/requests/${request.id}`);
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message || 'Server Error');
  }
};

exports.claimEscrow = async (req, res) => {
  try {
    const request = await requestService.claimEscrow(req.params.id, res.locals.currentUser);
    res.redirect(`/requests/${request.id}`);
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message || 'Server Error');
  }
};
