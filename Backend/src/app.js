const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const allowedFrontendOrigins = new Set(
  (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

app.disable('x-powered-by');
app.use(
  cors({
    origin(origin, callback) {
      const isLocalDevelopmentOrigin =
        process.env.NODE_ENV !== 'production' &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');

      callback(
        null,
        !origin || allowedFrontendOrigins.has(origin) || isLocalDevelopmentOrigin
      );
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);
app.use(express.json());
app.use(cookieParser());

const authRouter = require('./routes/auth.routes');

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
