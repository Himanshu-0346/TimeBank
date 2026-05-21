require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Request = require('./models/Request');
const Transaction = require('./models/Transaction');
const Review = require('./models/Review');
const Coupon = require('./models/Coupon');
const connectDB = require('./config/db');

const runDemo = async () => {
  try {
    await connectDB();
    console.log('Connected. Generating demo data...');

    // Delete existing demo users
    await User.deleteMany({ email: { $in: ['alice@demo.com', 'bob@demo.com', 'charlie@demo.com'] } });

    // Create Users
    const alice = await User.create({
      name: 'Alice Wonder',
      email: 'alice@demo.com',
      password: 'password123',
      skills: ['coding', 'tutoring'],
      location: 'New York',
      credits: 100,
      avatar: 'https://ui-avatars.com/api/?name=Alice&background=random'
    });

    const bob = await User.create({
      name: 'Bob Builder',
      email: 'bob@demo.com',
      password: 'password123',
      skills: ['home repair', 'gardening'],
      location: 'London',
      credits: 50,
      avatar: 'https://ui-avatars.com/api/?name=Bob&background=random'
    });

    const charlie = await User.create({
      name: 'Charlie Tech',
      email: 'charlie@demo.com',
      password: 'password123',
      skills: ['tech support', 'coding'],
      location: 'San Francisco',
      credits: 80,
      avatar: 'https://ui-avatars.com/api/?name=Charlie&background=random'
    });

    console.log('Users created.');

    // Bob posts a request
    const bobReq = await Request.create({
      title: 'Need help with plumbing',
      description: 'My sink is leaking, need someone who knows plumbing to fix it.',
      category: 'Home Repair',
      requiredSkill: 'plumbing',
      credits: 2,
      poster: bob._id
    });
    bob.credits -= 2;
    await bob.save();
    
    await Transaction.create({ fromUser: bob._id, toUser: bob._id, amount: 2, type: 'post_request', requestId: bobReq._id });

    // Charlie posts a request
    const charlieReq = await Request.create({
      title: 'Need help with React JS',
      description: 'I am stuck with a React Hooks bug. Need help debugging.',
      category: 'Tutoring',
      requiredSkill: 'coding',
      credits: 3,
      poster: charlie._id
    });
    charlie.credits -= 3;
    await charlie.save();
    
    await Transaction.create({ fromUser: charlie._id, toUser: charlie._id, amount: 3, type: 'post_request', requestId: charlieReq._id });

    // Alice accepts Charlie's request
    charlieReq.status = 'accepted';
    charlieReq.helper = alice._id;
    await charlieReq.save();

    // Alice marks it complete
    charlieReq.status = 'completed';
    charlieReq.completedAt = new Date();
    await charlieReq.save();

    alice.credits += 3;
    alice.helpsCount += 1;
    await alice.save();

    await Transaction.create({ fromUser: charlie._id, toUser: alice._id, amount: 3, type: 'help_completed', requestId: charlieReq._id });

    // Charlie reviews Alice
    const review = await Review.create({
      reviewer: charlie._id,
      reviewee: alice._id,
      requestId: charlieReq._id,
      rating: 5,
      comment: 'Alice was super helpful and solved my bug in minutes!'
    });

    alice.reviewsReceived.push(review._id);
    alice.ratingAvg = 5;
    await alice.save();

    console.log('Demo Requests, Transactions, and Reviews created.');

    console.log('Demo Data generation complete!');
    console.log('You can now login with:\n- alice@demo.com / password123\n- bob@demo.com / password123\n- charlie@demo.com / password123');
    
    process.exit(0);
  } catch (err) {
    console.error('Error in demo script:', err);
    process.exit(1);
  }
};

runDemo();
