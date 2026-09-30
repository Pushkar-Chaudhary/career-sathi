const path = require('node:path');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '../../.env');
const result = dotenv.config({ path: envPath });

// Keep hosting-provider variables authoritative, but let a local .env fill
// variables that were exported as empty strings by the shell or IDE.
if (result.parsed) {
  for (const [name, value] of Object.entries(result.parsed)) {
    if (!process.env[name] && value) process.env[name] = value;
  }
}

module.exports = { envPath };
