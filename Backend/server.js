require('./src/config/load-env');

const connectToDB = require('./src/config/database');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

async function startServer() {
  const mongoURI = process.env.MONGO_URI;
  const jwtSecret = process.env.JWT_SECRET;
  const geminiApiKey = process.env.GOOGLE_GENAI_API_KEY;

  if (!mongoURI || !jwtSecret || jwtSecret.length < 32 || !geminiApiKey) {
    throw new Error('Set MONGO_URI, a JWT_SECRET of at least 32 characters, and GOOGLE_GENAI_API_KEY.');
  }
  console.log('Gemini API key: configured');

  if (process.env.NODE_ENV === 'production') {
    const frontendOrigins = (process.env.FRONTEND_URL || '').split(',').map((origin) => origin.trim()).filter(Boolean);
    if (frontendOrigins.length === 0) {
      throw new Error('FRONTEND_URL is required in production. Set the exact frontend origin(s), comma-separated.');
    }

    for (const origin of frontendOrigins) {
      let parsedOrigin;
      try {
        parsedOrigin = new URL(origin);
      } catch {
        throw new Error(`Invalid FRONTEND_URL origin: ${origin}`);
      }
      if (parsedOrigin.protocol !== 'https:' || parsedOrigin.origin !== origin) {
        throw new Error(`Production FRONTEND_URL entries must be HTTPS origins without paths or trailing slashes: ${origin}`);
      }
    }
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

