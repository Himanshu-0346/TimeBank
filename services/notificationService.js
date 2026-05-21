const Notification = require('../models/Notification');

class NotificationService {
  async getNotifications(userId) {
    return await Notification.find({ recipient: userId }).sort({ createdAt: -1 }).lean();
  }

  async markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
  }
}

module.exports = new NotificationService();
