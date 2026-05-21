const authService = require('../services/authService');

exports.getSignup = (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('auth/signup', { title: 'Sign Up - TimeBank', error: null });
};

exports.postSignup = async (req, res) => {
  try {
    const user = await authService.signup(req.body);
    req.session.userId = user.id;
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.render('auth/signup', { title: 'Sign Up - TimeBank', error: error.message || 'An error occurred during signup' });
  }
};

exports.getLogin = (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('auth/login', { title: 'Log In - TimeBank', error: null });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authService.login(email, password);
    req.session.userId = user.id;
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    res.redirect(redirectTo);
  } catch (error) {
    console.error(error);
    res.render('auth/login', { title: 'Log In - TimeBank', error: error.message || 'An error occurred during login' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('Error destroying session:', err);
    res.redirect('/');
  });
};
