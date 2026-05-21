const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://himanshurana0124_db_user:himanshu1234@cluster0.wkaavm1.mongodb.net/?appName=Cluster0')
  .then(async () => {
  const users = await User.find();
  for (let u of users) {
    if (!u.avatar || u.avatar.includes('default-avatar.png') || u.avatar.includes('ui-avatars')) {
      // Use dicebear bottts or identicon
      u.avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.name)}&backgroundColor=e2e8f0`;
      await u.save();
    }
  }
  console.log('Avatars updated');
  process.exit();
}).catch(console.error);
