const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Transaction = require('../models/Transaction');

class RewardService {
  async getRewardsData(userId) {
    const coupons = await Coupon.find({ isActive: true }).lean();
    const user = await User.findById(userId).populate('coupons').lean();
    return { coupons, myCoupons: user ? user.coupons : [] };
  }

  async claimReward(userId, couponId) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) throw new Error('Coupon not found');

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const requiredCredits = coupon.requiredCredits;
    if (user.credits < requiredCredits) {
      throw new Error('Insufficient credits');
    }

    user.credits -= requiredCredits;
    if (!user.coupons.some(id => id.toString() === coupon._id.toString())) {
      user.coupons.push(coupon._id);
    }
    await user.save();

    await Transaction.create({
      fromUser: user._id,
      toUser: user._id,
      amount: requiredCredits,
      type: 'coupon_redeem',
      couponId: coupon._id
    });

    return user;
  }
}

module.exports = new RewardService();
