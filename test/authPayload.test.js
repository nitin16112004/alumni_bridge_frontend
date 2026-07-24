import { describe, expect, it } from 'vitest';
import { buildRegistrationRequest } from '../services/authPayload';

const base = {
  name: '  Nitin User  ',
  email: ' NITIN@Example.COM ',
  password: 'secret12',
  collegeId: 'college-1',
  graduationYear: '2024',
  domain: ' Example.EDU ',
};

describe('registration payloads', () => {
  it('builds the student payload expected by the backend', () => {
    expect(buildRegistrationRequest({ ...base, entityType: 'student' }).payload).toEqual({
      name: 'Nitin User',
      email: 'nitin@example.com',
      password: 'secret12',
      role: 'student',
      collegeId: 'college-1',
      graduationYear: undefined,
    });
  });

  it('builds the alumni payload with a numeric graduation year', () => {
    expect(buildRegistrationRequest({ ...base, entityType: 'alumni' }).payload.graduationYear).toBe(2024);
  });

  it('builds a distinct College payload and endpoint', () => {
    const request = buildRegistrationRequest({ ...base, entityType: 'college' });
    expect(request.endpoint).toBe('/auth/register-college');
    expect(request.payload).toEqual({
      name: 'Nitin User',
      email: 'nitin@example.com',
      password: 'secret12',
      domain: 'example.edu',
    });
  });
});
