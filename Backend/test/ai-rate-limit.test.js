const test = require('node:test');
const assert = require('node:assert/strict');
const { createUserRateLimit } = require('../src/middlewares/ai-rate-limit.middleware');

test('user rate limit blocks requests after the shared counter reaches its limit', async () => {
  const counts = new Map();
  const limiter = createUserRateLimit({
    action: 'test',
    maxRequests: 2,
    windowMs: 60_000,
    message: 'Too many requests.',
    increment: async (bucketId) => {
      const count = (counts.get(bucketId) || 0) + 1;
      if (count > 2) return null;
      counts.set(bucketId, count);
      return { count };
    }
  });

  async function sendRequest() {
    const response = {
      headers: {},
      set(name, value) { this.headers[name] = value; return this; },
      status(code) { this.statusCode = code; return this; },
      json(body) { this.body = body; return this; }
    };
    let continued = false;
    await limiter({ user: { id: 'user-1' } }, response, () => { continued = true; });
    return { response, continued };
  }

  assert.equal((await sendRequest()).continued, true);
  assert.equal((await sendRequest()).continued, true);
  const blocked = await sendRequest();
  assert.equal(blocked.response.statusCode, 429);
  assert.equal(blocked.response.body.message, 'Too many requests.');
  assert.ok(Number(blocked.response.headers['Retry-After']) > 0);
});