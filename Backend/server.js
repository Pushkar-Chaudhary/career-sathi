require('./src/config/load-env');

const connectToDB = require('./src/config/database');
const { validateRuntimeConfig } = require('./src/config/runtime-config');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

async function startServer() {
  validateRuntimeConfig();
  await connectToDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });
}

module.exports = async (req, res) => {
  validateRuntimeConfig();
  await connectToDB();
  return app(req, res);
};

