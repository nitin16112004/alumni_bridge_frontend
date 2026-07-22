import axios from 'axios';
import { API_URL } from '../config/runtime';

const api = axios.create({
  baseURL: API_URL,
  // Render free instances can take roughly 45 seconds to wake from a cold start.
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
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

    if (import.meta.env.DEV) {
      console.error('API request failed', {
        url: `${err.config?.baseURL || ''}${url}`,
        method: err.config?.method?.toUpperCase(),
        status: err.response?.status,
        response: err.response?.data,
        code: err.code,
      });
    }

    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
