const userService = require('../services/userService');

exports.getProfile = async (req, res) => {
  try {
    const { user, reviews, stats } = await userService.getProfileData(req.params.id);
    const reviewRequestId = req.query.reviewRequest;

    res.render('profile/show', { 
      title: `${user.name}'s Profile`, 
      profileUser: user, 
      reviews,
      stats,
      reviewRequestId
    });
  } catch (error) {
    console.error(error);
    res.status(404).send(error.message || 'Server Error');
  }
};

exports.getEditProfile = (req, res) => {
  res.render('profile/edit', { title: 'Edit Profile' });
};

exports.postEditProfile = async (req, res) => {
  try {
    const user = await userService.updateProfile(res.locals.currentUser.id, req.body);
    res.redirect(`/profile/${user.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.postReview = async (req, res) => {
  try {
    await userService.postReview({
      ...req.body,
      reviewerId: res.locals.currentUser.id,
      revieweeId: req.params.id
    });
    res.redirect(`/profile/${req.params.id}`);
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message || 'Server Error');
  }
};
