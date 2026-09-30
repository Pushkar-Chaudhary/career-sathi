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
    server.close();
  }
});
