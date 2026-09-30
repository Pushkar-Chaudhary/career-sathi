const configuredOrigins = new Set(
  (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

function isTrustedFrontendOrigin(origin) {
  if (configuredOrigins.has(origin)) return true;
  return process.env.NODE_ENV !== 'production' &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');
}

module.exports = { isTrustedFrontendOrigin };
