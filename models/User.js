const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skills: [{ type: String }],
  location: { type: String, default: '' },
  bio: { type: String, default: '' },
  avatar: { type: String, default: 'https://api.dicebear.com/7.x/bottts/svg?seed=TimeBank&backgroundColor=e2e8f0' },
  credits: { type: Number, default: 50 },
  ratingAvg: { type: Number, default: 0 },
  reviewsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  coupons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' }], // Claimed coupons
  isVerified: { type: Boolean, default: false },
  helpsCount: { type: Number, default: 0 } // Tasks they accepted and completed
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
