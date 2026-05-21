const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  requiredSkill: { type: String, required: true },
  credits: { type: Number, required: true, min: 1 },
  poster: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  helper: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  status: { type: String, enum: ['open', 'accepted', 'completed', 'disputed'], default: 'open', index: true },
  completedAt: { type: Date },
  
  // Time Capsule (Scheduled Requests)
  isScheduled: { type: Boolean, default: false },
  scheduledDate: { type: Date },
  paymentReleased: { type: Boolean, default: false },
  
  // Voice Note
  voiceNote: { type: String } // Base64 audio data
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
