const mongoose = require('mongoose');

async function connectToDB() {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error('MONGO_URI is not defined in the environment variables.');
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('Database Connected');
    return mongoose.connection;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
}

module.exports = connectToDB;
