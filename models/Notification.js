const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['new_request', 'request_accepted', 'task_completed', 'review_received'], required: true },
  message: { type: String, required: true },
  link: { type: String }, // e.g., /requests/123
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
