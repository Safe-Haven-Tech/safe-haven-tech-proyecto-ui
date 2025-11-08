/**
 * Servicios de autenticación (registro / login).
 * Entorno: Vite (import.meta.env.VITE_API_URL).
 */

const API_URL = import.meta.env.VITE_API_URL || '';

const parseResponse = async (res) => {
  try {
    return await res.json();
  } catch {
    try {
      const text = await res.text();
      return text || null;
    } catch {
      return null;
    }
  }
};

const extractMessage = (body, fallback) => {
  if (!body) return fallback;
  if (typeof body === 'string') return body;
  return (
    body.message || body.mensaje || body.error || body.detalles || fallback
  );
};

/**
 * Registrar usuario.
 * @param {Object} data
 * @returns {Promise<any>}
 * @throws {Error}
 */
export const registrarUsuario = async (data) => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const payload = await parseResponse(response);

    if (!response.ok) {
      throw new Error(extractMessage(payload, 'Error al registrar usuario'));
    }

    return payload;
  } catch (err) {
    console.error('registrarUsuario error:', err.message || err);
    throw err;
  }
};

/**
 * Iniciar sesión.
 * Guarda tokens en localStorage si la respuesta los incluye.
 * @param {{ correo: string, contraseña: string }} creds
 * @returns {Promise<any>}
 * @throws {Error}
 */
export async function iniciarSesion({ correo, contraseña }) {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contraseña }),
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      throw new Error(extractMessage(data, 'Error al iniciar sesión'));
    }

    if (data?.accessToken) localStorage.setItem('token', data.accessToken);
    if (data?.refreshToken)
      localStorage.setItem('refreshToken', data.refreshToken);

    return data;
  } catch (err) {
    console.error('iniciarSesion error:', err.message || err);
    throw err;
  }
}
