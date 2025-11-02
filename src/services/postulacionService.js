
/**
 * Cliente HTTP para operaciones sobre postulaciones.
 * Entorno: Vite (import.meta.env.VITE_API_URL).
 *
 */

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Obtiene token almacenado en localStorage.
 * @returns {string|null}
 */
const getStoredToken = () => localStorage.getItem('token') || null;

/**
 * Construye headers para fetch.
 * No añade 'Content-Type' cuando se envía FormData (isFormData = true).
 * @param {string|null} token
 * @param {boolean} isFormData
 * @returns {{[k:string]:string}}
 */
const buildHeaders = (token = null, isFormData = false) => {
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  const t = token ?? getStoredToken();
  if (t) headers['Authorization'] = `Bearer ${t}`;
  return headers;
};

/**
 * Intenta parsear Response como JSON; si falla devuelve texto o null.
 * @param {Response} res
 * @returns {Promise<any|null>}
 */
const parseResponse = async (res) => {
  try {
    return await res.json();
  } catch {
    try {
      const txt = await res.text();
      return txt || null;
    } catch {
      return null;
    }
  }
};

/**
 * Maneja respuestas no OK: extrae mensaje útil y lanza Error con metadatos.
 * @param {Response} res
 * @param {string} [defaultMessage]
 * @throws {Error}
 */
const handleErrorResponse = async (res, defaultMessage = 'Error en la petición') => {
  const body = await parseResponse(res).catch(() => null);
  const message = (body && (body.error || body.mensaje || body.message || body.detalles)) || defaultMessage || `HTTP ${res.status}`;
  const err = new Error(message);
  err.status = res.status;
  err.body = body;
  throw err;
};

/* ======================================================
   Operaciones públicas y admin para postulaciones
   ====================================================== */

/**
 * Crear una nueva postulación (POST /api/postulaciones/profesional)
 * @param {string} token - Token JWT del usuario (requerido)
 * @param {Object} data - Objeto con los campos que espera el backend
 * @returns {Promise<any>}
 */
export const createPostulacion = async (token, data) => {
  const res = await fetch(`${API_URL}/api/postulaciones/profesional`, {
    method: 'POST',
    headers: buildHeaders(token, false),
    body: JSON.stringify(data),
  });

  if (!res.ok) await handleErrorResponse(res, `Error al crear postulación`);
  return await parseResponse(res);
};

/**
 * Obtener mis postulaciones (GET /api/postulaciones/profesional/mis-postulaciones)
 * @param {string} token - Token JWT del usuario (requerido)
 * @returns {Promise<any>}
 */
export const fetchMyPostulaciones = async (token) => {
  const res = await fetch(`${API_URL}/api/postulaciones/profesional/mis-postulaciones`, {
    method: 'GET',
    headers: buildHeaders(token, false),
  });

  if (!res.ok) await handleErrorResponse(res, `Error al obtener postulaciones`);
  return await parseResponse(res);
};

/**
 * Obtener postulación por id (GET /api/postulaciones/profesional/:id)
 * @param {string} token
 * @param {string} id
 * @returns {Promise<any>}
 */
export const getPostulacionById = async (token, id) => {
  if (!id) throw new Error('ID de postulación requerido');
  const res = await fetch(`${API_URL}/api/postulaciones/profesional/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: buildHeaders(token, false),
  });

  if (!res.ok) await handleErrorResponse(res, `Error al obtener postulación`);
  return await parseResponse(res);
};

/**
 * Subir documentos a una postulación existente
 * @param {string} token
 * @param {string} id
 * @param {FormData} formData
 * @returns {Promise<any>}
 */
export const uploadPostulacionDocuments = async (token, id, formData) => {
  if (!id) throw new Error('ID de postulación requerido para subir documentos');
  if (!(formData instanceof FormData)) throw new Error('formData debe ser instancia de FormData');

  const res = await fetch(`${API_URL}/api/postulaciones/profesional/${encodeURIComponent(id)}/documentos`, {
    method: 'POST',
    headers: buildHeaders(token, true),
    body: formData,
  });

  if (!res.ok) await handleErrorResponse(res, `Error al subir documentos`);
  return await parseResponse(res);
};

/* ======================================================
   Funciones admin para gestionar postulaciones
   ====================================================== */

/**
 * Listar postulaciones para admin con filtros y paginación
 * GET /api/postulaciones/admin
 * @param {string} token
 * @param {Object} options - { page=1, limit=15, estado, q }
 * @returns {Promise<any>}
 */
export const adminListPostulaciones = async (token, options = {}) => {
  const { page = 1, limit = 15, estado, q } = options;
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (estado) params.set('estado', estado);
  if (q) params.set('q', q);

  const url = `${API_URL}/api/postulaciones/admin?${params.toString()}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: buildHeaders(token, false),
  });

  if (!res.ok) await handleErrorResponse(res, `Error al listar postulaciones`);
  return await parseResponse(res);
};

/**
 * Obtener detalle de una postulación (admin)
 * GET /api/postulaciones/admin/:id
 * @param {string} token
 * @param {string} id
 * @returns {Promise<any>}
 */
export const adminGetPostulacionById = async (token, id) => {
  if (!id) throw new Error('ID de postulación requerido');
  const res = await fetch(`${API_URL}/api/postulaciones/admin/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: buildHeaders(token, false),
  });

  if (!res.ok) await handleErrorResponse(res, `Error al obtener postulación`);
  return await parseResponse(res);
};

/**
 * Decidir una postulación (aceptar/denegar/rechazar)
 * PATCH /api/postulaciones/admin/:id/decidir
 * body: { accion: 'aceptar'|'denegar'|'rechazar', motivo?: string }
 * @param {string} token
 * @param {string} id
 * @param {string} accion - 'aceptar'|'denegar'|'rechazar'
 * @param {string} motivo - motivo opcional
 * @returns {Promise<any>}
 */
export const adminDecidirPostulacion = async (token, id, accion, motivo = '') => {
  if (!id) throw new Error('ID de postulación requerido');
  const valid = ['aceptar', 'denegar', 'rechazar'];
  if (!accion || !valid.includes(accion)) {
    throw new Error('Acción inválida: usar "aceptar", "denegar" o "rechazar"');
  }

  const body = { accion, motivo };
  const res = await fetch(`${API_URL}/api/postulaciones/admin/${encodeURIComponent(id)}/decidir`, {
    method: 'PATCH',
    headers: buildHeaders(token, false),
    body: JSON.stringify(body),
  });

  if (!res.ok) await handleErrorResponse(res, `Error al decidir postulación`);
  return await parseResponse(res);
};
