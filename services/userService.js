const User = require('../models/User');
const Review = require('../models/Review');
const Request = require('../models/Request');
const Transaction = require('../models/Transaction');

class UserService {
  async getProfileData(userId) {
    const user = await User.findById(userId).lean();
    if (!user) throw new Error('User not found');

    const reviews = await Review.find({ reviewee: user._id })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    const requestsCreated = await Request.countDocuments({ poster: user._id });
    const requestsAccepted = await Request.countDocuments({ helper: user._id });

    const transactions = await Transaction.find({
      $or: [{ fromUser: user._id }, { toUser: user._id }]
    }).lean();

    const earned = transactions
      .filter(tx => tx.toUser?.toString() === user._id.toString())
      .reduce((sum, tx) => sum + tx.amount, 0);

    const spent = transactions
      .filter(tx => tx.fromUser?.toString() === user._id.toString())
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      user,
      reviews,
      stats: {
        earned,
        spent,
        totalReviews: reviews.length,
        averageRating: user.ratingAvg || 0,
        taskCompleted: user.helpsCount,
        taskCreated: requestsCreated,
        currentCredits: user.credits
      }
    };
  }

  async updateProfile(userId, updateData) {
    const { name, bio, location, skills = '' } = updateData;
    const skillsArray = skills
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    const user = await User.findByIdAndUpdate(
      userId,
      { name, bio, location, skills: skillsArray },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async postReview(reviewData) {
    const { rating, comment, requestId, reviewerId, revieweeId } = reviewData;

    const existing = await Review.findOne({
      reviewer: reviewerId,
      requestId
    });
    if (existing) throw new Error('You have already reviewed this request.');

    const review = await Review.create({
      reviewer: reviewerId,
      reviewee: revieweeId,
      requestId,
      rating: parseInt(rating, 10),
      comment
    });

    const revieweeReviews = await Review.find({ reviewee: revieweeId });
    const averageRating = revieweeReviews.length
      ? revieweeReviews.reduce((sum, r) => sum + r.rating, 0) / revieweeReviews.length
      : 0;

    await User.findByIdAndUpdate(revieweeId, {
      ratingAvg: parseFloat(averageRating.toFixed(1))
    });

    return review;
  }

  async getDashboardData(user) {
    const openRequests = await Request.find({
      status: 'open',
      poster: { $ne: user._id }
    })
      .populate('poster', 'name avatar ratingAvg')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const totalHelped = await Request.countDocuments({ helper: user._id, status: 'completed' });
    const totalPosted = await Request.countDocuments({ poster: user._id });

    const transactions = await Transaction.find({
      $or: [{ fromUser: user._id }, { toUser: user._id }]
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('requestId', 'title')
      .populate('couponId', 'code')
      .lean();

    return {
      openRequests,
      stats: { totalHelped, totalPosted },
      transactions
    };
  }

  async getLeaderboard() {
    const topEarners = await User.find({})
      .sort({ credits: -1 })
      .limit(10)
      .select('name avatar credits ratingAvg')
      .lean();

    const topHelpers = await User.find({})
      .sort({ helpsCount: -1 })
      .limit(10)
      .select('name avatar helpsCount ratingAvg')
      .lean();

    const topRated = await User.find({ ratingAvg: { $gt: 0 } })
      .sort({ ratingAvg: -1 })
      .limit(10)
      .select('name avatar ratingAvg helpsCount')
      .lean();

    return { topEarners, topHelpers, topRated };
  }
}

module.exports = new UserService();
