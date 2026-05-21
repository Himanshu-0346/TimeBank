const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // Optional, null if system generated (e.g. signup bonus)
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['signup_bonus', 'post_request', 'help_completed', 'coupon_redeem', 'refund', 'escrow_held', 'escrow_released', 'dispute_refund'], 
    required: true 
  },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
