const rewardService = require('../services/rewardService');

exports.getRewards = async (req, res) => {
  try {
    const { coupons, myCoupons } = await rewardService.getRewardsData(res.locals.currentUser.id);
    
    res.render('rewards/index', { 
      title: 'Rewards Store', 
      coupons, 
      myCoupons,
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.claimReward = async (req, res) => {
  try {
    await rewardService.claimReward(res.locals.currentUser.id, req.params.id);
    res.redirect('/rewards?success=Coupon claimed successfully!');
  } catch (error) {
    console.error(error);
    if (error.message === 'Coupon not found') {
      return res.status(404).send(error.message);
    }
    res.redirect(`/rewards?error=${encodeURIComponent(error.message)}`);
  }
};
