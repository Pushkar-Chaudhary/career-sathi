const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRuntimeConfig } = require('../src/config/runtime-config');

const validConfig = {
  MONGO_URI: 'mongodb://localhost/career-sathi',
  JWT_SECRET: 'a'.repeat(32),
  GOOGLE_GENAI_API_KEY: 'test-key'
};

test('runtime config rejects missing required secrets', () => {
  assert.throws(() => validateRuntimeConfig({ ...validConfig, MONGO_URI: '' }), /MONGO_URI is required/);
  assert.throws(() => validateRuntimeConfig({ ...validConfig, JWT_SECRET: 'short' }), /at least 32 characters/);
  assert.throws(() => validateRuntimeConfig({ ...validConfig, GOOGLE_GENAI_API_KEY: '' }), /GOOGLE_GENAI_API_KEY is required/);
});

test('production runtime config requires exact HTTPS frontend origins', () => {
  assert.throws(() => validateRuntimeConfig({ ...validConfig, NODE_ENV: 'production' }), /FRONTEND_URL is required/);
  assert.throws(() => validateRuntimeConfig({
    ...validConfig,
    NODE_ENV: 'production',
    FRONTEND_URL: 'https://career-sathi.example/path'
  }), /must be HTTPS origins without paths/);
  assert.doesNotThrow(() => validateRuntimeConfig({
    ...validConfig,
    NODE_ENV: 'production',
    FRONTEND_URL: 'https://career-sathi.example,https://www.career-sathi.example'
  }));
});