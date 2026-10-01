require('../Backend/src/config/load-env');

const { validateRuntimeConfig } = require('../Backend/src/config/runtime-config');
const connectToDB = require('../Backend/src/config/database');
const app = require('../Backend/src/app');

validateRuntimeConfig();

module.exports = async function handler(req, res) {
  try {
    await connectToDB();

    const forwardedPath = req.query?.path;
    if (typeof forwardedPath === 'string' && forwardedPath.startsWith('/')) {
      const originalQuery = new URL(req.url, 'http://localhost').searchParams;
      originalQuery.delete('path');
      const queryString = originalQuery.toString();
      req.url = `${forwardedPath}${queryString ? `?${queryString}` : ''}`;
    }

    return app(req, res);
  } catch (error) {
    console.error('API request initialization failed:', error);
    return res.status(503).json({ message: 'The API is temporarily unavailable.' });
  }
};