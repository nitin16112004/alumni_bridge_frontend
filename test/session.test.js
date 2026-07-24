import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearStoredSession,
  loadStoredSession,
  normalizeAuthPayload,
  persistSession,
  safeJsonParse,
} from '../services/session';

describe('authentication entity normalization', () => {
  beforeEach(() => localStorage.clear());

  it('normalizes and persists a User login', () => {
    const session = normalizeAuthPayload({
      token: 'user-token',
      entityType: 'user',
      user: { _id: 'u1', name: 'Student', role: 'student' },
    });
    expect(session.role).toBe('student');
    expect(session.college).toBeNull();
    persistSession(session);
    expect(loadStoredSession().currentEntity.name).toBe('Student');
  });

  it('normalizes College registration without forcing a User shape', () => {
    const session = normalizeAuthPayload({
      token: 'college-token',
      college: { _id: 'c1', name: 'Example College' },
    }, 'college');
    expect(session.role).toBe('college');
    expect(session.user).toBeNull();
    expect(session.college.name).toBe('Example College');
  });

  it('handles corrupt storage and logout safely', () => {
    expect(safeJsonParse('{broken')).toBeNull();
    localStorage.setItem('token', 'token');
    localStorage.setItem('user', '{broken');
    expect(loadStoredSession()).toBeNull();
    clearStoredSession();
    expect(localStorage.length).toBe(0);
  });
});
