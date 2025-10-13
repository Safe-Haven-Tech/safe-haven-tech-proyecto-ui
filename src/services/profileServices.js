// src/services/profileServices.js
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Obtiene los datos públicos de un usuario por nickname
 * @param {string} nickname - Nickname del usuario
 * @param {string} token - Token de autenticación (opcional)
 * @returns {Promise<Object>} Datos del usuario
 */
export const fetchUsuarioPublico = async (nickname, token = null) => {
  try {
    const url = `${API_URL}/api/usuarios/public/${encodeURIComponent(nickname.trim())}`;

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, { headers });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));

      if (res.status === 404) {
        throw new Error(errorData.detalles || 'Usuario no encontrado');
      }

      throw new Error(
        errorData.detalles || 'Error al obtener datos del usuario'
      );
    }

    const data = await res.json();
    return data.usuario;
  } catch (error) {
    console.error('❌ Error en fetchUsuarioPublico:', error);
    throw error;
  }
};

/**
 * Obtiene los datos completos del usuario por ID (para edición)
 * @param {string} id - ID del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Datos completos del usuario
 */
export const fetchUsuarioCompleto = async (id, token) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache',
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detalles || 'Error al obtener datos del usuario'
      );
    }

    const data = await res.json();
    return data.usuario;
  } catch (error) {
    console.error('❌ Error en fetchUsuarioCompleto:', error);
    throw error;
  }
};

/**
 * Verificar disponibilidad de nickname
 * @param {string} nickname - Nickname a verificar
 * @returns {Promise<boolean>} True si está disponible, false si no cumple validaciones o está en uso
 */
export const verificarNickname = async (nickname) => {
  try {
    const res = await fetch(
      `${API_URL}/api/usuarios/verificar-nickname/${encodeURIComponent(nickname)}`
    );

    if (!res.ok) {
      // Si hay error, asumir que no está disponible
      return false;
    }

    const data = await res.json();
    return data.disponible;
  } catch (error) {
    console.error('❌ Error en verificarNickname:', error);
    return false;
  }
};
/**
 * Actualizar perfil del usuario
 * @param {string} id - ID del usuario
 * @param {Object|FormData} data - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @param {boolean} esFormData - Si los datos son FormData
 * @returns {Promise<Object>} Respuesta de la actualización
 */
export const actualizarPerfil = async (id, data, token, esFormData = false) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (!esFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
      method: 'PUT',
      headers,
      body: esFormData ? data : JSON.stringify(data),
    });

    const responseData = await res.json();

    if (!res.ok) {
      throw new Error(
        responseData.detalles?.join?.(', ') ||
          responseData.error ||
          responseData.message ||
          'Error al actualizar el perfil'
      );
    }

    return responseData;
  } catch (error) {
    console.error('❌ Error en actualizarPerfil:', error);
    throw error;
  }
};

/**
 * Renovar token de acceso
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} Nuevos tokens
 */
export const renovarToken = async (refreshToken) => {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      throw new Error('Error renovando token');
    }

    return await res.json();
  } catch (error) {
    console.error('❌ Error en renovarToken:', error);
    throw error;
  }
};

/**
 * Realiza la acción de seguir/dejar de seguir a un usuario
 * @param {string} usuarioId - ID del usuario a seguir/dejar de seguir
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Respuesta de la operación
 */
export const toggleSeguirUsuario = async (usuarioId, token) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/${usuarioId}/seguir`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detalles || 'Error al seguir/dejar de seguir');
    }

    return await res.json();
  } catch (error) {
    console.error('❌ Error en toggleSeguirUsuario:', error);
    throw error;
  }
};

/**
 * Obtiene el usuario actual desde el token JWT
 * @returns {Object|null} Datos del usuario actual o null
 */
export const getUsuarioActual = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch (err) {
    console.error('Error al decodificar token:', err);
    return null;
  }
};

/**
 * Verifica si el token actual es válido
 * @returns {boolean} True si el token es válido
 */
export const isTokenValid = () => {
  const user = getUsuarioActual();
  return user !== null;
};

/**
 * Obtiene el token del localStorage
 * @returns {string|null} Token o null si no existe
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Cambia la contraseña del usuario
 * @param {string} contraseñaActual - Contraseña actual
 * @param {string} nuevaContraseña - Nueva contraseña
 *  @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Respuesta de la operación
 * @throws {Error} Si ocurre un error durante la operación
 *
 */
export const cambiarContraseña = async (
  contraseñaActual,
  nuevaContraseña,
  token
) => {
  try {
    const res = await fetch(`${API_URL}/api/auth/cambiar-contrasena`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        contraseñaActual,
        nuevaContraseña,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al cambiar contraseña');

    return data;
  } catch (error) {
    console.error('❌ Error en cambiarContraseña:', error);
    throw error;
  }
};

/**
 * Elimina la cuenta del usuario
 * @param {string} id - ID del usuario
 *  @param {string} contraseña - Contraseña del usuario
 * @param {string} token - Token de autenticación
 * * @returns {Promise<Object>} Respuesta de la operación
 * @throws {Error} Si ocurre un error durante la operación
 */
export const eliminarCuenta = async (id, contraseña, token) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contraseña }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        data.detalles?.join?.(', ') ||
          data.error ||
          `Error ${res.status}: ${res.statusText}`
      );
    }

    return data;
  } catch (error) {
    console.error('❌ Error en eliminarCuenta:', error);
    throw error;
  }
};

/**
 * Actualiza la configuración del usuario
 * @param {string} id - ID del usuario
 *  @param {Object} configuracion - Configuración a actualizar
 *  @param {string} token - Token de autenticación
 * * @returns {Promise<Object>} Respuesta de la operación
 * * @throws {Error} Si ocurre un error durante la operación
 */
export const actualizarConfiguracion = async (id, configuracion, token) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(configuracion),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        data.detalles?.join?.(', ') ||
          data.error ||
          'Error al actualizar configuración'
      );
    }

    return data;
  } catch (error) {
    console.error('❌ Error en actualizarConfiguracion:', error);
    throw error;
  }
};

/**
 * Obtiene los posts de tipo "perfil" de un usuario por su ID
 * @param {string} userId - ID del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Lista de posts de tipo "perfil"
 */
export const fetchPostsPerfilByUserId = async (userId, token) => {
  try {
    const url = `${API_URL}/api/publicaciones/usuario/${userId}?tipo=perfil`;
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error('No se pudieron obtener los posts de perfil');
    }
    const data = await res.json();
    return data.posts;
  } catch (error) {
    console.error('❌ Error en fetchPostsPerfilByUserId:', error);
    throw error;
  }
};