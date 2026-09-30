const crypto = require('crypto');

function hashSessionToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { hashSessionToken };
