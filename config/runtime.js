const PRODUCTION_API_URL = 'https://alumni-bridge-backend.onrender.com/api';
const PRODUCTION_SOCKET_URL = 'https://alumni-bridge-backend.onrender.com';

const trimTrailingSlashes = (value) => value.replace(/\/+$/, '');

export const API_URL = trimTrailingSlashes(
  import.meta.env.VITE_API_URL
    || (import.meta.env.DEV ? 'http://localhost:5000/api' : PRODUCTION_API_URL),
);

export const SOCKET_URL = trimTrailingSlashes(
  import.meta.env.VITE_SOCKET_URL
    || (import.meta.env.DEV ? 'http://localhost:5000' : PRODUCTION_SOCKET_URL),
);
