const User = require('../models/User');
const Transaction = require('../models/Transaction');

class AuthService {
  async signup(userData) {
    const { name, email, password, skills = '', location = '' } = userData;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const skillsArray = skills
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    const user = new User({
      name,
      email: normalizedEmail,
      password,
      skills: skillsArray,
      location,
      credits: 50
    });

    await user.save();

    await Transaction.create({
      toUser: user._id,
      amount: 50,
      type: 'signup_bonus'
    });

    return user;
  }

  async login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    return user;
  }
}

module.exports = new AuthService();
