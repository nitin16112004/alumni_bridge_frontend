export function buildRegistrationRequest(form) {
  const name = form.name.trim();
  const email = form.email.trim().toLowerCase();

  if (form.entityType === 'college') {
    return {
      entityType: 'college',
      endpoint: '/auth/register-college',
      payload: {
        name,
        email,
        password: form.password,
        domain: form.domain.trim().toLowerCase(),
      },
    };
  }

  return {
    entityType: 'user',
    endpoint: '/auth/register',
    payload: {
      name,
      email,
      password: form.password,
      role: form.entityType,
      collegeId: form.collegeId || undefined,
      graduationYear: form.entityType === 'alumni' ? Number(form.graduationYear) : undefined,
    },
  };
}
