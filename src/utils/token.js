/**
 * Utilidades para manejar y parsear tokens JWT.
 * - getToken / getCurrentUser / isTokenValid / parseJwt
 * - Logs concisos y defensivos; devuelve null en lugar de lanzar en parseos.
 */

export const getToken = () => {
  try {
    return localStorage.getItem('token') || null;
  } catch {
    return null;
  }
};

export function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = parseJwt(token);
    if (!payload) return null;
    if (payload.exp && payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export const isTokenValid = () => Boolean(getCurrentUser());

export const parseJwt = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const decoded = atob(padded);
    const jsonPayload = decodeURIComponent(
      decoded
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('parseJwt error:', err.message || err);
    return null;
  }
};