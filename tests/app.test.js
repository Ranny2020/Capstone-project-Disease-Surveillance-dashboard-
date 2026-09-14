const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const scriptPath = path.join(__dirname, '..', 'script.js');
const script = fs.readFileSync(scriptPath, 'utf8');

test('frontend auth requests use API_URL and avoid stale hardcoded hosts', () => {
  assert.match(script, /API_URL.*\/api\/login/i);
  assert.match(script, /API_URL.*\/api\/signup/i);
  assert.doesNotMatch(script, /https:\/\/capstone-project-disease-surveillance\.onrender\.com/);
});
