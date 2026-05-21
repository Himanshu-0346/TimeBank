const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true, index: true },
  initiator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  defendant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true, maxlength: 500 },
  defendantResponse: { type: String, maxlength: 500 },
  status: { 
    type: String, 
    enum: ['open', 'voting', 'resolved_initiator', 'resolved_defendant'], 
    default: 'open' 
  },
  votes: [{
    juror: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    voteFor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // initiator or defendant
  }]
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);
