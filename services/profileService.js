// services/profileService.js
// Profile service handling avatar uploads with Cloudinary

const User = require('../models/User');
const Review = require('../models/Review');
const Request = require('../models/Request');
const Transaction = require('../models/Transaction');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

const uploadUserAvatar = async (userId, fileBuffer) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const result = await uploadToCloudinary(fileBuffer, 'timebank/avatars', {
      width: 200,
      height: 200,
      crop: 'fill'
    });

    if (user.avatar && user.avatar.includes('cloudinary')) {
      try {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`timebank/avatars/${publicId}`);
      } catch (error) {
        console.log('Could not delete old avatar:', error.message);
      }
    }

    user.avatar = result.secure_url;
    await user.save();

    return {
      success: true,
      avatarUrl: result.secure_url,
      user
    };
  } catch (error) {
    throw new Error(`Avatar upload failed: ${error.message}`);
  }
};

const getUserProfile = async (userId) => {
  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new Error('User not found');
    }

    const reviews = await Review.find({ reviewee: user._id }).lean();
    const requestsCreated = await Request.countDocuments({ poster: user._id });
    const requestsAccepted = await Request.countDocuments({ helper: user._id });
    const transactions = await Transaction.find({
      $or: [{ fromUser: user._id }, { toUser: user._id }]
    }).lean();

    const avgRating = user.ratingAvg || 0;

    return {
      ...user,
      stats: {
        totalReviews: reviews.length,
        averageRating: avgRating,
        taskCompleted: user.helpsCount,
        taskCreated: requestsCreated,
        currentCredits: user.credits,
        totalCreditTransactions: transactions.length
      }
    };
  } catch (error) {
    throw new Error(`Failed to get profile: ${error.message}`);
  }
};

const updateProfile = async (userId, profileData) => {
  try {
    const skillsArray = (profileData.skills || '')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: profileData.name,
        bio: profileData.bio,
        location: profileData.location,
        skills: skillsArray
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  } catch (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
};

module.exports = {
  uploadUserAvatar,
  getUserProfile,
  updateProfile
};
