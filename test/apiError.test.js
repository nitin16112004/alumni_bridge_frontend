import { describe, expect, it } from 'vitest';
import { getApiErrorMessage, normalizeApiError } from '../services/apiError';

describe('API error normalization', () => {
  it('preserves safe validation, forbidden, and conflict messages', () => {
    expect(getApiErrorMessage({ response: { status: 400, data: { message: 'Email already registered' } } })).toBe('Email already registered');
    expect(normalizeApiError({ response: { status: 403, data: { message: 'Access denied' } } }).kind).toBe('forbidden');
    expect(normalizeApiError({ response: { status: 409, data: { message: 'Already registered' } } }).kind).toBe('conflict');
  });

  it('distinguishes rate limits, timeouts, network failures, and server errors', () => {
    expect(getApiErrorMessage({ response: { status: 429, data: {} } })).toBe('Too many requests. Please wait a moment and try again.');
    expect(normalizeApiError({ code: 'ECONNABORTED' }).kind).toBe('timeout');
    expect(normalizeApiError({ code: 'ERR_NETWORK' }).kind).toBe('network');
    expect(getApiErrorMessage({ response: { status: 500, data: { message: 'database stack details' } } })).toBe('The server is temporarily unavailable. Please try again shortly.');
  });
});
