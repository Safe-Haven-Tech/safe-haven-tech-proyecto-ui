
/**
 * Servicios HTTP relacionados con usuarios.
 *
 * Esta capa encapsula llamadas a la API REST del backend (Vite: import.meta.env.VITE_API_URL).
 * Proporciona funciones reutilizables para operaciones CRUD y consultas con paginación/filtrado.
 *
 */

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Construye headers para fetch. No añade 'Content-Type' cuando se envía FormData.
 * @param {string|null} token
 * @param {boolean} isFormData
 * @returns {Object<string,string>} Headers planos
 */
const buildHeaders = (token = null, isFormData = false) => {
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

/**
 * Intenta parsear el body de la respuesta como JSON o texto.
 * @param {Response} res
 * @returns {Promise<any>}
 */
const parseResponse = async (res) => {
  const text = await res.text().catch(() => null);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

/**
 * Maneja respuestas de error: intenta extraer detalle del body y lanza Error con mensaje y propiedades útiles.
 * @param {Response} res
 * @param {string} defaultMessage
 * @throws {Error}
 */
const handleErrorResponse = async (res, defaultMessage = 'Error en petición') => {
  const body = await parseResponse(res).catch(() => null);
  const detail =
    body && (body.error || body.message || body.mensaje || body.detalles)
      ? body.error || body.message || body.mensaje || body.detalles
      : `HTTP ${res.status}`;
  const err = new Error(detail || defaultMessage);
  err.status = res.status;
  err.body = body;
  throw err;
};

/* ----------------------------
   API: Usuarios - CRUD y utilidades
   ---------------------------- */

/**
 * Obtiene lista de usuarios paginada y filtrada.
 * @param {string|null} token
 * @param {Object} options
 * @returns {Promise<Object>} { usuarios: [], paginacion: {...} }
 */
export const getUsers = async (
  token,
  {
    pagina = 1,
    limite = 10,
    rol = '',
    activo = '',
    busqueda = '',
    ordenar = '',
  } = {}
) => {
  const qs = new URLSearchParams();
  qs.set('pagina', String(pagina));
  qs.set('limite', String(limite));
  if (rol) qs.set('rol', rol);
  if (activo !== '') qs.set('activo', activo);
  if (busqueda) qs.set('busqueda', busqueda);
  if (ordenar) qs.set('ordenar', ordenar);

  const res = await fetch(`${API_URL}/api/usuarios?${qs.toString()}`, {
    method: 'GET',
    headers: buildHeaders(token),
  });

  if (!res.ok) {
    // Mantener mensaje semántico previo para compatibilidad con consumidores actuales.
    throw new Error('Error al obtener usuarios');
  }

  return res.json();
};

/**
 * Obtiene un usuario por su ID.
 * @param {string|null} token
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const getUserById = async (token, id) => {
  if (!id) throw new Error('ID requerido');
  const res = await fetch(`${API_URL}/api/usuarios/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: buildHeaders(token),
  });

  if (!res.ok) {
    throw new Error('Error al obtener usuario');
  }

  return res.json();
};

/**
 * Crea un nuevo usuario. `data` puede ser JSON o FormData (cuando incluye archivos).
 * @param {string|null} token
 * @param {Object|FormData} data
 * @returns {Promise<Object>}
 */
export const createUser = async (token, data) => {
  const isForm = data instanceof FormData;
  const res = await fetch(`${API_URL}/api/usuarios/registro`, {
    method: 'POST',
    headers: buildHeaders(token, isForm),
    body: isForm ? data : JSON.stringify(data),
  });

  if (!res.ok) {
    const errBody = await parseResponse(res).catch(() => null);
    // Conserva comportamiento previo: lanzar el body (si existe) o Error genérico.
    throw errBody || new Error('Error al crear usuario');
  }

  return res.json();
};

/**
 * Actualiza un usuario. `data` puede ser JSON o FormData.
 * @param {string|null} token
 * @param {string} id
 * @param {Object|FormData} data
 * @returns {Promise<Object>}
 */
export const updateUser = async (token, id, data) => {
  if (!id) throw new Error('ID requerido');
  const isForm = data instanceof FormData;
  const res = await fetch(`${API_URL}/api/usuarios/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: buildHeaders(token, isForm),
    body: isForm ? data : JSON.stringify(data),
  });

  if (!res.ok) {
    const errBody = await parseResponse(res).catch(() => null);
    throw errBody || new Error('Error al actualizar usuario');
  }

  return res.json();
};

/**
 * Cambia el estado (activo/inactivo) de un usuario con motivo opcional.
 * @param {string|null} token
 * @param {string} id
 * @param {string|boolean} estado
 * @param {string} [motivo='']
 * @returns {Promise<Object>}
 */
export const changeUserState = async (token, id, estado, motivo = '') => {
  if (!id) throw new Error('ID requerido');
  const res = await fetch(`${API_URL}/api/usuarios/${encodeURIComponent(id)}/estado`, {
    method: 'PATCH',
    headers: buildHeaders(token),
    body: JSON.stringify({ estado, motivo }),
  });

  if (!res.ok) {
    throw new Error('Error al cambiar estado');
  }

  return res.json();
};

export const activateUser = async (token, id) => {
  if (!id) throw new Error('ID requerido');
  const res = await fetch(`${API_URL}/api/usuarios/${encodeURIComponent(id)}/activar`, {
    method: 'PATCH',
    headers: buildHeaders(token),
  });

  if (!res.ok) throw new Error('Error al activar usuario');
  return res.json();
};

export const deactivateUser = async (token, id, motivo = '') => {
  if (!id) throw new Error('ID requerido');
  const res = await fetch(`${API_URL}/api/usuarios/${encodeURIComponent(id)}/desactivar`, {
    method: 'PATCH',
    headers: buildHeaders(token),
    body: JSON.stringify({ motivo }),
  });

  if (!res.ok) throw new Error('Error al desactivar usuario');
  return res.json();
};

export const deleteUser = async (token, id) => {
  if (!id) throw new Error('ID requerido');
  const res = await fetch(`${API_URL}/api/usuarios/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  });

  if (!res.ok) throw new Error('Error al eliminar usuario');
  return res.json();
};

/* ----------------------------
   Otras operaciones específicas
   ---------------------------- */

/**
 * Denuncia a un usuario identificándolo por ID.
 * Lanza Error si falta id o motivo. En caso de fallo, intenta extraer mensaje del body.
 * @param {string|null} token
 * @param {string} id
 * @param {string} motivo
 * @param {string} [descripcion='']
 * @returns {Promise<Object>}
 */
export const denunciarUsuario = async (token, id, motivo, descripcion = '') => {
  if (!id) throw new Error('ID de usuario requerido');
  if (!motivo) throw new Error('Motivo de denuncia requerido');

  const res = await fetch(`${API_URL}/api/usuarios/${encodeURIComponent(id)}/denunciar`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify({ motivo, descripcion }),
  });

  if (!res.ok) {
    const body = await parseResponse(res).catch(() => null);
    const message = (body && (body.error || body.detalles)) || 'Error al denunciar usuario';
    throw new Error(message);
  }

  return res.json();
};

/**
 * Busca profesionales públicos con filtros y paginación.
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export const fetchProfessionals = async (options = {}) => {
  const {
    especialidad,
    ciudad,
    disponible,
    idiomas,
    modalidad,
    q,
    pagina = 1,
    limite = 12,
    ordenar,
  } = options;

  const qs = new URLSearchParams();
  qs.set('pagina', String(pagina));
  qs.set('limite', String(limite));
  if (especialidad) qs.set('especialidad', especialidad);
  if (ciudad) qs.set('ciudad', ciudad);
  if (disponible !== undefined) qs.set('disponible', String(disponible));
  if (idiomas) qs.set('idiomas', Array.isArray(idiomas) ? idiomas.join(',') : idiomas);
  if (modalidad) qs.set('modalidad', modalidad);
  if (q) qs.set('q', q);
  if (ordenar) qs.set('ordenar', ordenar);

  const res = await fetch(`${API_URL}/api/usuarios/profesionales?${qs.toString()}`, {
    method: 'GET',
    headers: buildHeaders(null),
  });

  if (!res.ok) {
    const txt = await parseResponse(res).catch(() => null);
    throw new Error(`Error al obtener profesionales: ${res.status} ${txt || ''}`.trim());
  }

  return res.json();
};

/**
 * Obtiene perfil público de profesional por nickname.
 * @param {string} nickname
 * @returns {Promise<Object>}
 */
export const getProfessionalPublicByNickname = async (nickname) => {
  if (!nickname) throw new Error('Nickname requerido');
  const res = await fetch(
    `${API_URL}/api/usuarios/public/${encodeURIComponent(nickname)}`,
    {
      method: 'GET',
      headers: buildHeaders(null),
    }
  );

  if (!res.ok) {
    const body = await parseResponse(res).catch(() => null);
    const msg = (body && (body.error || body.message)) || 'Error al obtener perfil público';
    throw new Error(msg);
  }

  return res.json();
};

/**
 * Obtiene profesional por ID. Token opcional (según la ruta backend).
 * @param {string} id
 * @param {string|null} token
 * @returns {Promise<Object>}
 */
export const getProfessionalById = async (id, token = null) => {
  if (!id) throw new Error('ID requerido');
  const res = await fetch(`${API_URL}/api/usuarios/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: buildHeaders(token),
  });

  if (!res.ok) {
    const body = await parseResponse(res).catch(() => null);
    const msg = (body && (body.error || body.message)) || 'Error al obtener profesional';
    throw new Error(msg);
  }

  return res.json();
};

/**
 * Obtiene conexiones (following / followers / both).
 * Devuelve siempre un array (soporta varias formas de respuesta del backend).
 * @param {string} token
 * @param {Object} options { type: 'both'|'following'|'followers', query: string, limit: number }
 * @returns {Promise<Array>}
 */
export const obtenerConexiones = async (token, { type = 'both', query = '', limit = 50 } = {}) => {
  const url = new URL(`${API_URL}/api/usuarios/connections`);
  url.searchParams.set('type', type);
  if (query) url.searchParams.set('query', query);
  url.searchParams.set('limit', String(Math.min(limit, 200)));

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: buildHeaders(token),
  });

  const body = await parseResponse(res);
  if (Array.isArray(body)) return body;
  if (body?.users && Array.isArray(body.users)) return body.users;
  if (body?.data && Array.isArray(body.data)) return body.data;
  return [];
};

