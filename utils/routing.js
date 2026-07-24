export function getHomeRoute(role) {
  if (role === 'college') return '/college/dashboard';
  if (role === 'alumni') return '/alumni/dashboard';
  return '/dashboard';
}

export function isSafeInternalPath(value) {
  return typeof value === 'string'
    && value.startsWith('/')
    && !value.startsWith('//')
    && !value.includes('\\');
}
