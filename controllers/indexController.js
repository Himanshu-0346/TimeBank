const userService = require('../services/userService');

exports.getLandingPage = (req, res) => {
  res.render('index', { title: 'TimeBank - Exchange Help for Time' });
};

exports.getDashboard = async (req, res) => {
  try {
    const data = await userService.getDashboardData(res.locals.currentUser);
    res.render('dashboard', { 
      title: 'Dashboard',
      ...data
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};
