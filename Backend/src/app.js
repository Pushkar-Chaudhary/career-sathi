const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const { isTrustedFrontendOrigin } = require('./config/frontend-origin');

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || isTrustedFrontendOrigin(origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);
app.use(express.json({ limit: '256kb' }));
app.use(cookieParser());
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

const authRouter = require('./routes/auth.routes');
const aiRouter = require('./routes/ai.routes');
const applicationRouter = require('./routes/application.routes');

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/ai', aiRouter);
app.use('/api/applications', applicationRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
  if (status >= 500) console.error('Unhandled API error:', err);
  res.status(status).json({
    message: status >= 500 ? 'Internal server error.' : (err.message || 'Request could not be processed.')
  });
});

module.exports = app;
