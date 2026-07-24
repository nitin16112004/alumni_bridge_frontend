const SESSION_KEY = 'alumniBridge.session';
const LEGACY_TOKEN_KEY = 'token';
const LEGACY_ENTITY_KEY = 'user';

export function safeJsonParse(value, fallback = null) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function normalizeAuthPayload(payload = {}, fallbackEntityType) {
  const entityType = payload.entityType
    || fallbackEntityType
    || (payload.college ? 'college' : 'user');
  const user = entityType === 'user' ? (payload.user || payload.entity || null) : null;
  const college = entityType === 'college' ? (payload.college || payload.entity || null) : null;
  const currentEntity = college || user;

  return {
    token: payload.token || null,
    entityType,
    user,
    college,
    currentEntity,
    role: entityType === 'college' ? 'college' : user?.role || null,
  };
}

export function loadStoredSession() {
  const current = safeJsonParse(localStorage.getItem(SESSION_KEY));
  if (current?.token) return normalizeAuthPayload(current, current.entityType);

  const token = localStorage.getItem(LEGACY_TOKEN_KEY);
  const legacyEntity = safeJsonParse(localStorage.getItem(LEGACY_ENTITY_KEY));
  if (!token || !legacyEntity) return null;

  return normalizeAuthPayload({
    token,
    entityType: legacyEntity.entityType || 'user',
    [legacyEntity.entityType === 'college' ? 'college' : 'user']: legacyEntity,
  });
}

export function persistSession(session) {
  if (!session?.token || !session.currentEntity) return;
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    token: session.token,
    entityType: session.entityType,
    user: session.user,
    college: session.college,
  }));
  localStorage.setItem(LEGACY_TOKEN_KEY, session.token);
  localStorage.setItem(
    LEGACY_ENTITY_KEY,
    JSON.stringify({ ...session.currentEntity, entityType: session.entityType }),
  );
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_ENTITY_KEY);
}

export function getStoredToken() {
  return loadStoredSession()?.token || null;
}

export { SESSION_KEY };
