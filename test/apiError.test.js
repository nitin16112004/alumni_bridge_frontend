import test from 'node:test';
import assert from 'node:assert/strict';
import { getApiErrorMessage } from '../services/apiError.js';

test('uses safe backend validation and duplicate messages', () => {
  assert.equal(
    getApiErrorMessage({ response: { status: 409, data: { message: 'Email already registered' } } }),
    'Email already registered',
  );
});

test('distinguishes rate limits, timeouts, network errors, and server errors', () => {
  assert.equal(
    getApiErrorMessage({ response: { status: 429, data: {} } }),
    'Too many registration attempts. Please wait and try again.',
  );
  assert.equal(
    getApiErrorMessage({ code: 'ECONNABORTED' }),
    'The server took too long to respond. Please try again.',
  );
  assert.equal(
    getApiErrorMessage({ code: 'ERR_NETWORK' }),
    'Unable to connect to the server. Check the backend URL or CORS configuration.',
  );
  assert.equal(
    getApiErrorMessage({ response: { status: 500, data: { message: 'database stack details' } } }),
    'The server is temporarily unavailable. Please try again shortly.',
  );
});
