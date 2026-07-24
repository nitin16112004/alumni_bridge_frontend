import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../services/api';
import reducer, { login, logout, restoreSession } from '../store/slices/authSlice';
import { persistSession } from '../services/session';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('authentication lifecycle', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('normalizes a College login and stores it separately from User', async () => {
    api.post.mockResolvedValue({
      data: {
        token: 'college-token',
        entityType: 'college',
        college: { _id: 'c1', name: 'College', email: 'admin@college.edu' },
      },
    });
    const store = configureStore({ reducer: { auth: reducer } });
    await store.dispatch(login({ email: 'admin@college.edu', password: 'secret' }));
    expect(store.getState().auth.role).toBe('college');
    expect(store.getState().auth.user).toBeNull();
    expect(store.getState().auth.college.name).toBe('College');
  });

  it('clears an expired restored session', async () => {
    persistSession({
      token: 'expired',
      entityType: 'user',
      user: { _id: 'u1', role: 'student' },
      college: null,
      currentEntity: { _id: 'u1', role: 'student' },
      role: 'student',
    });
    api.get.mockRejectedValue({ response: { status: 401, data: { message: 'Invalid or expired token' } } });
    const store = configureStore({ reducer: { auth: reducer } });
    await store.dispatch(restoreSession());
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('clears persisted data on logout', () => {
    localStorage.setItem('token', 'token');
    const store = configureStore({ reducer: { auth: reducer } });
    store.dispatch(logout());
    expect(localStorage.getItem('token')).toBeNull();
  });
});
