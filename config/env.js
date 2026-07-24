const PRODUCTION_API_URL = 'https://alumni-bridge-backend.onrender.com/api';
const PRODUCTION_SOCKET_URL = 'https://alumni-bridge-backend.onrender.com';

const stripTrailingSlashes = (value) => value.trim().replace(/\/+$/, '');

function parseHttpUrl(value, name) {
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
    return stripTrailingSlashes(parsed.toString());
  } catch {
    throw new Error(`${name} must be a valid HTTP(S) URL.`);
  }
}

function resolveValue(name, developmentFallback, productionFallback) {
  const configured = import.meta.env[name]?.trim();
  if (configured) return configured;
  if (import.meta.env.DEV) return developmentFallback;
  return productionFallback;
}

const apiCandidate = resolveValue(
  'VITE_API_URL',
  'http://localhost:5000/api',
  PRODUCTION_API_URL,
);
const socketCandidate = resolveValue(
  'VITE_SOCKET_URL',
  'http://localhost:5000',
  PRODUCTION_SOCKET_URL,
);

export const API_URL = parseHttpUrl(apiCandidate, 'VITE_API_URL').replace(/\/api\/api$/, '/api');
export const SOCKET_URL = parseHttpUrl(socketCandidate, 'VITE_SOCKET_URL').replace(/\/api$/, '');

if (!API_URL.endsWith('/api')) {
  throw new Error('VITE_API_URL must end in /api.');
}

export const runtimeConfig = Object.freeze({
  apiUrl: API_URL,
  socketUrl: SOCKET_URL,
  isDevelopment: import.meta.env.DEV,
});
