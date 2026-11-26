const test = require('node:test');
const assert = require('node:assert/strict');
const { createCareerRoadmapController } = require('../src/controllers/ai.controller');

function createResponse() {
  return {
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

async function submit(body) {
  const response = createResponse();
  await createCareerRoadmapController({ body }, response);
  return response;
}

test('career roadmap requires a goal and starting point', async () => {
  const response = await submit({ goal: 'Designer', currentLevel: ' ' });
  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /goal and current experience/i);
});

test('career roadmap rejects oversized text before calling Gemini', async () => {
  const response = await submit({ goal: 'Designer', currentLevel: 'x'.repeat(3001), weeklyHours: 5, consentToAI: true });
  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /shorten/i);
});

test('career roadmap accepts only a bounded integer weekly time budget', async () => {
  const response = await submit({ goal: 'Designer', currentLevel: 'New graduate', weeklyHours: 100, consentToAI: true });
  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /between 1 and 40/i);
});

test('career roadmap requires explicit AI consent', async () => {
  const response = await submit({ goal: 'Designer', currentLevel: 'New graduate', weeklyHours: 5, consentToAI: false });
  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /at least 18/i);
});
