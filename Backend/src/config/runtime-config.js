function validateRuntimeConfig(env = process.env) {
  if (!env.MONGO_URI) {
    throw new Error('MONGO_URI is required.');
  }
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters.');
  }
  if (!env.GOOGLE_GENAI_API_KEY) {
    throw new Error('GOOGLE_GENAI_API_KEY is required.');
  }

  if (env.NODE_ENV === 'production') {
    const frontendOrigins = (env.FRONTEND_URL || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    if (frontendOrigins.length === 0) {
      throw new Error('FRONTEND_URL is required in production.');
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
}

module.exports = { validateRuntimeConfig };