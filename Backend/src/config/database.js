const mongoose = require('mongoose');

let connectionPromise;

async function connectToDB() {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error('MONGO_URI is not defined in the environment variables.');
  }

  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (connectionPromise) return connectionPromise;

  connectionPromise = connect(mongoURI);
  try {
    return await connectionPromise;
  } finally {
    connectionPromise = undefined;
  }
}

async function connect(mongoURI) {
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
