const userService = require('../services/userService');

exports.getLeaderboard = async (req, res) => {
  try {
    const { topEarners, topHelpers, topRated } = await userService.getLeaderboard();
    res.render('leaderboard/index', { title: 'Hall of Fame', topEarners, topHelpers, topRated });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};
