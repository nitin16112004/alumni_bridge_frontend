import axios from 'axios';
import { API_URL } from '../config/env';
import { clearStoredSession, getStoredToken } from './session';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AUTH_URLS = [
  '/auth/login',
  '/auth/register',
  '/auth/register-college',
  '/auth/send-otp',
  '/auth/verify-otp',
  '/auth/forgot-password',
  '/auth/reset-password',
];

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const isAuthEndpoint = AUTH_URLS.some((u) => url.includes(u));

    if (err.response?.status === 401 && !isAuthEndpoint) {
      clearStoredSession();
      window.dispatchEvent(new CustomEvent('alumni-bridge:session-expired'));
    }
    return Promise.reject(err);
  }
);

export default api;
