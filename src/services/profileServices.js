/**
 * Cliente HTTP para operaciones de perfil de usuario.
 * Entorno: Vite (import.meta.env.VITE_API_URL).
 *
 */

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Obtiene el token almacenado en localStorage.
 * @returns {string|null}
 */
export const getToken = () => localStorage.getItem('token');

/**
 * Construye headers para fetch.
 * - No añade Content-Type cuando se envía FormData (pasar asJson = false).
 * @param {string|null} token
 * @param {boolean} asJson
 * @returns {{[k:string]:string}}
 */
const buildHeaders = (token = null, asJson = true) => {
  const headers = {};
  if (asJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

/**
 * Intenta parsear Response a JSON; si falla, devuelve texto o null.
 * @param {Response} res
 * @returns {Promise<any|null>}
 */
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

/**
 * Maneja respuesta no OK: extrae mensaje útil del body si existe y lanza Error con metadatos.
 * @param {Response} res
 * @param {string} defaultMessage
 * @throws {Error}
 */
const handleErrorResponse = async (
  res,
  defaultMessage = 'Error en la petición'
) => {
  const body = await parseResponse(res).catch(() => null);
  const message =
    (body && (body.detalles || body.error || body.message)) ||
    defaultMessage ||
    `HTTP ${res.status}`;
  const err = new Error(message);
  err.status = res.status;
  err.body = body;
  throw err;
};

/**
 * Obtiene los datos públicos de un usuario por nickname.
 * @param {string} nickname - Nickname del usuario
 * @param {string|null} token - Token de autenticación (opcional)
 * @returns {Promise<Object>} Datos del usuario
 */
export const fetchUsuarioPublico = async (nickname, token = null) => {
  if (!nickname) throw new Error('Nickname requerido');

  const cleaned = nickname.trim();
  const url = `${API_URL}/api/usuarios/public/${encodeURIComponent(cleaned)}`;

  try {
    const res = await fetch(url, { headers: buildHeaders(token, true) });

    if (!res.ok) {
      if (res.status === 404) {
        const body = await parseResponse(res).catch(() => null);
        throw new Error(body?.detalles || 'Usuario no encontrado');
      }
      await handleErrorResponse(res, 'Error al obtener datos del usuario');
    }

    const data = await parseResponse(res);
    return data?.usuario ?? null;
  } catch (error) {
    console.error('fetchUsuarioPublico error:', error.message || error);
    throw error;
  }
};

/**
 * Obtiene los datos completos del usuario por ID (para edición).
 * @param {string} id - ID del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Datos completos del usuario
 */
export const fetchUsuarioCompleto = async (id, token) => {
  if (!id) throw new Error('ID requerido');

  const url = `${API_URL}/api/usuarios/${encodeURIComponent(id)}`;

  try {
    const res = await fetch(url, {
      headers: { ...buildHeaders(token, true), 'Cache-Control': 'no-cache' },
    });

    if (!res.ok)
      await handleErrorResponse(res, 'Error al obtener datos del usuario');

    const data = await parseResponse(res);
    return data?.usuario ?? null;
  } catch (error) {
    console.error('fetchUsuarioCompleto error:', error.message || error);
    throw error;
  }
};

/**
 * Verificar disponibilidad de nickname.
 * Mantiene la semántica: devuelve true sólo si la API responde { disponible: true }.
 * @param {string} nickname
 * @returns {Promise<boolean>}
 */
export const verificarNickname = async (nickname) => {
  if (!nickname) return false;
  const url = `${API_URL}/api/usuarios/verificar-nickname/${encodeURIComponent(nickname.trim())}`;

  try {
    const res = await fetch(url, { headers: buildHeaders(null, true) });
    if (!res.ok) return false;
    const data = await parseResponse(res);
    return Boolean(data?.disponible);
  } catch (error) {
    console.error('verificarNickname error:', error.message || error);
    return false;
  }
};

/**
 * Actualizar perfil del usuario.
 * @param {string} id - ID del usuario
 * @param {Object|FormData} data - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @param {boolean} esFormData - Si los datos son FormData
 * @returns {Promise<Object>}
 */
export const actualizarPerfil = async (id, data, token, esFormData = false) => {
  if (!id) throw new Error('ID requerido');

  try {
    const res = await fetch(
      `${API_URL}/api/usuarios/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        headers: buildHeaders(token, !esFormData),
        body: esFormData ? data : JSON.stringify(data),
      }
    );

    const parsed = await parseResponse(res);
    if (!res.ok) {
      const message =
        parsed?.detalles?.join?.(', ') ||
        parsed?.error ||
        parsed?.message ||
        'Error al actualizar el perfil';
      throw new Error(message);
    }

    return parsed ?? {};
  } catch (error) {
    console.error('actualizarPerfil error:', error.message || error);
    throw error;
  }
};

/**
 * Renovar token de acceso.
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} Nuevos tokens
 */
export const renovarToken = async (refreshToken) => {
  if (!refreshToken) throw new Error('Refresh token requerido');

  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: buildHeaders(null, true),
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) await handleErrorResponse(res, 'Error renovando token');

    return await parseResponse(res);
  } catch (error) {
    console.error('renovarToken error:', error.message || error);
    throw error;
  }
};

/**
 * Realiza la acción de seguir/dejar de seguir a un usuario.
 * @param {string} usuarioId - ID del usuario a seguir/dejar de seguir
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>}
 */
export const toggleSeguirUsuario = async (usuarioId, token) => {
  if (!usuarioId) throw new Error('UsuarioId requerido');

  try {
    const res = await fetch(
      `${API_URL}/api/usuarios/${encodeURIComponent(usuarioId)}/seguir`,
      {
        method: 'POST',
        headers: buildHeaders(token, true),
      }
    );

    if (!res.ok) {
      const parsed = await parseResponse(res).catch(() => null);
      throw new Error(parsed?.detalles || 'Error al seguir/dejar de seguir');
    }

    return await parseResponse(res);
  } catch (error) {
    console.error('toggleSeguirUsuario error:', error.message || error);
    throw error;
  }
};

/**
 * Obtiene el usuario actual desde el token JWT almacenado en localStorage.
 * @returns {Object|null}
 */
export const getUsuarioActual = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch (err) {
    console.error('getUsuarioActual error:', err.message || err);
    return null;
  }
};

/**
 * Verifica si el token actual es válido.
 * @returns {boolean}
 */
export const isTokenValid = () => Boolean(getUsuarioActual());

/**
 * Cambia la contraseña del usuario.
 * @param {string} contraseñaActual
 * @param {string} nuevaContraseña
 * @param {string} token
 * @returns {Promise<Object>}
 */
export const cambiarContraseña = async (
  contraseñaActual,
  nuevaContraseña,
  token
) => {
  if (!contraseñaActual || !nuevaContraseña)
    throw new Error('Datos de contraseña incompletos');

  try {
    const res = await fetch(`${API_URL}/api/auth/cambiar-contrasena`, {
      method: 'POST',
      headers: buildHeaders(token, true),
      body: JSON.stringify({ contraseñaActual, nuevaContraseña }),
    });

    const parsed = await parseResponse(res);
    if (!res.ok) {
      throw new Error(parsed?.error || 'Error al cambiar contraseña');
    }
    return parsed;
  } catch (error) {
    console.error('cambiarContraseña error:', error.message || error);
    throw error;
  }
};

/**
 * Elimina la cuenta del usuario.
 * @param {string} id
 * @param {string} contraseña
 * @param {string} token
 * @returns {Promise<Object>}
 */
export const eliminarCuenta = async (id, contraseña, token) => {
  if (!id || !contraseña) throw new Error('ID y contraseña requeridos');

  try {
    const res = await fetch(
      `${API_URL}/api/usuarios/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: buildHeaders(token, true),
        body: JSON.stringify({ contraseña }),
      }
    );

    const parsed = await parseResponse(res);
    if (!res.ok) {
      const message =
        parsed?.detalles?.join?.(', ') ||
        parsed?.error ||
        `Error ${res.status}`;
      throw new Error(message);
    }
    return parsed;
  } catch (error) {
    console.error('eliminarCuenta error:', error.message || error);
    throw error;
  }
};

/**
 * Actualiza la configuración del usuario.
 * @param {string} id
 * @param {Object} configuracion
 * @param {string} token
 * @returns {Promise<Object>}
 */
export const actualizarConfiguracion = async (id, configuracion, token) => {
  if (!id) throw new Error('ID requerido');

  try {
    const res = await fetch(
      `${API_URL}/api/usuarios/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        headers: buildHeaders(token, true),
        body: JSON.stringify(configuracion),
      }
    );

    const parsed = await parseResponse(res);
    if (!res.ok) {
      const message =
        parsed?.detalles?.join?.(', ') ||
        parsed?.error ||
        'Error al actualizar configuración';
      throw new Error(message);
    }
    return parsed;
  } catch (error) {
    console.error('actualizarConfiguracion error:', error.message || error);
    throw error;
  }
};

/**
 * Obtiene los posts de tipo "perfil" de un usuario por su ID.
 * @param {string} userId
 * @param {string|null} token
 * @returns {Promise<Array>}
 */
export const fetchPostsPerfilByUserId = async (userId, token = null) => {
  if (!userId) throw new Error('UserId requerido');

  const url = `${API_URL}/api/publicaciones/usuario/${encodeURIComponent(userId)}?tipo=perfil`;

  try {
    const res = await fetch(url, { headers: buildHeaders(token, true) });
    if (!res.ok)
      await handleErrorResponse(res, 'Error al obtener posts de perfil');

    const data = await parseResponse(res);
    return data?.posts ?? [];
  } catch (error) {
    console.error('fetchPostsPerfilByUserId error:', error.message || error);
    throw error;
  }
};
