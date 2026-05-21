const notificationService = require('../services/notificationService');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications(res.locals.currentUser.id);
    res.render('notifications/index', { title: 'Notifications', notifications });
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.markRead = async (req, res) => {
  try {
    await notificationService.markAsRead(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
