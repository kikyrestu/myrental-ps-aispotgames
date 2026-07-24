const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Event kecil buat ngasih tau AuthContext kalau session ternyata udah expired
 * (dapet 401 dari endpoint manapun), tanpa bikin circular import ke context.
 */
export const AUTH_EXPIRED_EVENT = 'auth:expired';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include', // wajib biar cookie PHPSESSID kekirim
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let json;
  try {
    json = await res.json();
  } catch {
    json = { success: false, message: 'Response server tidak valid' };
  }

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
  }

  if (!res.ok || json.success === false) {
    const error = new Error(json.message || 'Terjadi kesalahan');
    error.status = res.status;
    error.errors = json.errors;
    throw error;
  }

  return json.data;
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
