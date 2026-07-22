const BACKEND_MESSAGE_STATUSES = new Set([400, 401, 403, 404, 409, 422]);

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return 'The server took too long to respond. Please try again.';
  }

  if (!error?.response) {
    return 'Unable to connect to the server. Check the backend URL or CORS configuration.';
  }

  const { status, data } = error.response;
  if (status === 429) {
    return 'Too many registration attempts. Please wait and try again.';
  }

  if (BACKEND_MESSAGE_STATUSES.has(status) && typeof data?.message === 'string') {
    return data.message;
  }

  if (status >= 500) {
    return 'The server is temporarily unavailable. Please try again shortly.';
  }

  return fallback;
}
