const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

function getServerAddress(server) {
  const address = server.address();
  if (typeof address === 'string') return address;
  return `http://127.0.0.1:${address.port}`;
}

test('GET /health returns application status', async () => {
  const server = app.listen(0);
  const baseUrl = getServerAddress(server);

  try {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, { status: 'ok' });
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test('report and application data routes require a signed-in session', async () => {
  const server = app.listen(0);
  const baseUrl = getServerAddress(server);

  try {
    const responses = await Promise.all([
      fetch(`${baseUrl}/api/ai/reports`),
      fetch(`${baseUrl}/api/applications`),
      fetch(`${baseUrl}/api/ai/resume-draft`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ targetRole: 'Designer', consentToAI: true }) }),
      fetch(`${baseUrl}/api/ai/assistant`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'Help me' }], consentToAI: true }) }),
      fetch(`${baseUrl}/api/ai/reports`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jobDescription: 'Role', resume: 'Resume' })
      })
    ]);

    assert.deepEqual(responses.map((response) => response.status), [401, 401, 401, 401, 401]);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test('write requests from untrusted origins are rejected before login', async () => {
  const server = app.listen(0);
  const baseUrl = getServerAddress(server);

  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://untrusted.example'
      },
      body: JSON.stringify({ email: 'user@example.com', password: 'not-a-real-password' })
    });

    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { message: 'Request origin is not allowed.' });
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
