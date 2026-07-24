const BACKEND_MESSAGE_STATUSES = new Set([400, 401, 403, 404, 409, 422]);

export function normalizeApiError(error, fallback = 'Something went wrong. Please try again.') {
  const status = error?.response?.status || null;

  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return {
      status,
      kind: 'timeout',
      message: 'The server is taking longer than expected to wake up. Please try again.',
      retryable: true,
    };
  }

  if (!error?.response) {
    return {
      status,
      kind: typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'network',
      message: typeof navigator !== 'undefined' && navigator.onLine === false
        ? 'You appear to be offline. Reconnect and try again.'
        : 'We could not reach Alumni Bridge. The service may be waking up—please retry shortly.',
      retryable: true,
    };
  }

  const { data } = error.response;
  if (status === 429) {
    return {
      status,
      kind: 'rate-limit',
      message: 'Too many requests. Please wait a moment and try again.',
      retryable: true,
    };
  }

  if (BACKEND_MESSAGE_STATUSES.has(status) && typeof data?.message === 'string') {
    return {
      status,
      kind: status === 401 ? 'unauthorized'
        : status === 403 ? 'forbidden'
          : status === 404 ? 'not-found'
            : status === 409 ? 'conflict'
              : 'validation',
      message: data.message,
      retryable: status >= 500,
    };
  }

  if (status >= 500) {
    return {
      status,
      kind: 'server',
      message: 'The server is temporarily unavailable. Please try again shortly.',
      retryable: true,
    };
  }

  return { status, kind: 'unexpected', message: fallback, retryable: false };
}

export function getApiErrorMessage(error, fallback) {
  return normalizeApiError(error, fallback).message;
}
