const { isTrustedFrontendOrigin } = require('../config/frontend-origin');

function requireTrustedOrigin(req, res, next) {
  const origin = req.get('Origin');
  if (!origin || isTrustedFrontendOrigin(origin)) return next();
  return res.status(403).json({ message: 'Request origin is not allowed.' });
}

module.exports = { requireTrustedOrigin };
