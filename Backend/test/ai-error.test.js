const test = require('node:test');
const assert = require('node:assert/strict');
const { aiErrorResponse } = require('../src/controllers/ai.controller');
const { generateContentWithRetry } = require('../src/services/ai.service');

function createResponse() {
  return {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

test('Google 503 errors are reported as temporary outages, not missing configuration', () => {
  const response = createResponse();
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    aiErrorResponse(response, 'Gemini test', { status: 503 });
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(response.statusCode, 503);
  assert.match(response.body.message, /temporarily unavailable/i);
});

test('missing Gemini configuration keeps its actionable message', () => {
  const response = createResponse();
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    aiErrorResponse(response, 'Gemini test', { status: 503, code: 'AI_NOT_CONFIGURED' });
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(response.statusCode, 503);
  assert.match(response.body.message, /not configured/i);
});

test('transient Gemini 503 failures are retried before succeeding', async () => {
  let calls = 0;
  const ai = {
    models: {
      async generateContent() {
        calls += 1;
        if (calls < 3) {
          const error = new Error('Service unavailable');
          error.status = 503;
          throw error;
        }
        return { text: 'success' };
      }
    }
  };

  const response = await generateContentWithRetry(ai, {});

  assert.equal(response.text, 'success');
  assert.equal(calls, 3);
});

test('non-transient Gemini errors are not retried', async () => {
  let calls = 0;
  const expectedError = Object.assign(new Error('Invalid request'), { status: 400 });
  const ai = {
    models: {
      async generateContent() {
        calls += 1;
        throw expectedError;
      }
    }
  };

  await assert.rejects(generateContentWithRetry(ai, {}), expectedError);
  assert.equal(calls, 1);
});