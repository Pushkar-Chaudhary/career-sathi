require('dotenv').config();

const connectToDB = require('./src/config/database');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

async function startServer() {
  const mongoURI = process.env.MONGO_URI;
  const jwtSecret = process.env.JWT_SECRET;

  if (!mongoURI || !jwtSecret) {
    throw new Error('Missing required environment variables: MONGO_URI and JWT_SECRET');
  }

  await connectToDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});

