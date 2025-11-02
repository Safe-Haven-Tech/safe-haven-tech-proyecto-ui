/**
 * Actualizar perfil del usuario (fetch, coherente con el resto del repo).
 * - Lee token desde localStorage con clave 'token'.
 * - Acepta JSON o FormData (no añade Content-Type para FormData).
 * - Si la respuesta incluye accessToken/refreshToken/nuevoToken los guarda en localStorage.
 */

const API_URL = import.meta.env.VITE_API_URL || '';

const parseResponse = async (res) => {
  const text = await res.text().catch(() => null);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const actualizarPerfil = async (usuarioId, datosUsuario) => {
  if (!usuarioId) throw new Error('ID de usuario requerido');

  const token = localStorage.getItem('token');
  const isForm = datosUsuario instanceof FormData;

  const headers = {};
  if (!isForm) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_URL}/api/usuarios/${encodeURIComponent(usuarioId)}`, {
      method: 'PUT',
      headers,
      body: isForm ? datosUsuario : JSON.stringify(datosUsuario),
    });

    const payload = await parseResponse(res);

    if (!res.ok) {
      const msg = (payload && (payload.detalles || payload.message || payload.error)) || `Error ${res.status}`;
      throw new Error(msg);
    }

    // Guardar tokens si el backend devuelve nuevos
    if (payload?.accessToken) localStorage.setItem('token', payload.accessToken);
    if (payload?.refreshToken) localStorage.setItem('refreshToken', payload.refreshToken);
    if (payload?.nuevoToken) localStorage.setItem('token', payload.nuevoToken);

    return payload;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('actualizarPerfil error:', err.message || err);
    throw err;
  }
};
