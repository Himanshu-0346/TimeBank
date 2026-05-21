const User = require('../models/User');

module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.session && req.session.userId) {
      return next();
    }
    req.session.returnTo = req.originalUrl;
    res.redirect('/auth/login');
  },
  
  injectLocals: async (req, res, next) => {
    res.locals.currentUser = null;
    res.locals.path = req.path; // for active nav links
    
    if (req.session && req.session.userId) {
      try {
        const user = await User.findById(req.session.userId);
        if (user) {
          res.locals.currentUser = user;
        }
      } catch (err) {
        console.error('Error fetching user for locals:', err);
      }
    }
    next();
  }
};
