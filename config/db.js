const mongoose = require('mongoose');

const connectDB = async (mongoUrl) => {
  try {
    const uri = mongoUrl || process.env.MONGODB_URI || 'mongodb+srv://himanshurana0124_db_user:himanshu1234@cluster0.wkaavm1.mongodb.net/?appName=Cluster0';
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
