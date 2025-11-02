
/**
 * Cliente HTTP para operaciones sobre publicaciones.
 * Entorno: Vite (import.meta.env.VITE_API_URL).
 */

const API_URL = import.meta.env.VITE_API_URL || '';

/** Obtiene token almacenado */
const getToken = () => localStorage.getItem('token');

/**
 * Construye headers para fetch.
 * @param {string|null} token
 * @param {boolean} asJson - agregar Content-Type: application/json cuando se envía JSON
 * @returns {{[k:string]:string}}
 */
const buildHeaders = (token = null, asJson = false) => {
  const headers = {};
  if (asJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

/**
 * Intenta parsear una Response como JSON; si falla devuelve el texto crudo o null.
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
 * Maneja respuestas no OK extrayendo mensaje útil y lanzando Error con metadatos.
 * @param {Response} res
 * @param {string} [defaultMessage]
 * @throws {Error}
 */
const handleErrorResponse = async (res, defaultMessage = 'Error en la petición') => {
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

/* ============================
   Publicaciones - API
   ============================ */

/**
 * Obtiene publicaciones públicas con filtros y paginación.
 * @param {Object} opciones
 * @returns {Promise<Object>} Objeto con publicaciones y metadatos de paginación
 */
export const fetchPublicaciones = async ({
  pagina = 1,
  limite = 10,
  tipo = '',
  busqueda = '',
  topico = ''
} = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('pagina', String(pagina));
    params.append('limite', String(limite));
    if (tipo) params.append('tipo', tipo);
    if (busqueda) params.append('busqueda', busqueda);
    if (topico) params.append('topico', topico);

    const url = `${API_URL}/api/publicaciones?${params.toString()}`;
    const token = getToken();
    const res = await fetch(url, {
      headers: buildHeaders(token, false)
    });

    if (!res.ok) await handleErrorResponse(res, 'Error al obtener publicaciones');

    return (await parseResponse(res)) || {};
  } catch (error) {
    console.error('fetchPublicaciones:', error);
    throw error;
  }
};

/**
 * Obtiene solamente publicaciones de tipo "perfil".
 * @param {Object} opciones
 * @returns {Promise<Object>}
 */
export const fetchPublicacionesPerfil = async (opciones = {}) => {
  const data = await fetchPublicaciones({ ...opciones, tipo: 'perfil' });
  const publicaciones = Array.isArray(data.publicaciones) ? data.publicaciones : [];
  const publicacionesPerfil = publicaciones.filter((p) => p.tipo === 'perfil');
  return { ...data, publicaciones: publicacionesPerfil };
};

/**
 * Obtiene el detalle de una publicación por su ID.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const fetchPublicacionPorId = async (id) => {
  if (!id) throw new Error('ID de publicación requerido');
  try {
    const url = `${API_URL}/api/publicaciones/${encodeURIComponent(id)}`;
    const token = getToken();
    const res = await fetch(url, {
      headers: buildHeaders(token, false)
    });

    if (!res.ok) await handleErrorResponse(res, 'Error al obtener la publicación');

    return (await parseResponse(res)) || {};
  } catch (error) {
    
    console.error('fetchPublicacionPorId:', error);
    throw error;
  }
};

/**
 * Da like a una publicación.
 * @param {string} id
 * @param {string} token
 * @returns {Promise<any>}
 */
export const likePublicacion = async (id, token) => {
  if (!id) throw new Error('ID de publicación requerido');
  try {
    const url = `${API_URL}/api/publicaciones/${encodeURIComponent(id)}/like`;
    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(token, false)
    });

    if (!res.ok) await handleErrorResponse(res, 'Error al dar like');

    return (await parseResponse(res)) || {};
  } catch (error) {
   
    console.error('likePublicacion:', error);
    throw error;
  }
};

/**
 * Quita el like de una publicación.
 * @param {string} id
 * @param {string} token
 * @returns {Promise<any>}
 */
export const unlikePublicacion = async (id, token) => {
  if (!id) throw new Error('ID de publicación requerido');
  try {
    const url = `${API_URL}/api/publicaciones/${encodeURIComponent(id)}/like`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: buildHeaders(token, false)
    });

    if (!res.ok) await handleErrorResponse(res, 'Error al quitar like');

    return (await parseResponse(res)) || {};
  } catch (error) {
    
    console.error('unlikePublicacion:', error);
    throw error;
  }
};

/**
 * Comenta en una publicación.
 * @param {string} id
 * @param {string} contenido
 * @param {string} token
 * @returns {Promise<any>}
 */
export const comentarPublicacion = async (id, contenido, token) => {
  if (!id) throw new Error('ID de publicación requerido');
  try {
    const url = `${API_URL}/api/publicaciones/${encodeURIComponent(id)}/comentarios`;
    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(token, true),
      body: JSON.stringify({ contenido })
    });

    if (!res.ok) await handleErrorResponse(res, 'Error al comentar');

    return (await parseResponse(res)) || {};
  } catch (error) {
    
    console.error('comentarPublicacion:', error);
    throw error;
  }
};

/**
 * Elimina un comentario por su ID.
 * @param {string} publicacionId
 * @param {string} comentarioId
 * @param {string} token
 * @returns {Promise<any>}
 */
export const eliminarComentario = async (publicacionId, comentarioId, token) => {
  if (!publicacionId) throw new Error('ID de publicación requerido');
  if (!comentarioId) throw new Error('ID de comentario requerido');
  try {
    const url = `${API_URL}/api/publicaciones/${encodeURIComponent(publicacionId)}/comentarios/${encodeURIComponent(
      comentarioId
    )}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: buildHeaders(token, false)
    });

    if (!res.ok) await handleErrorResponse(res, 'Error al eliminar el comentario');

    return (await parseResponse(res)) || {};
  } catch (error) {
    
    console.error('eliminarComentario:', error);
    throw error;
  }
};

/**
 * Elimina una publicación por su ID.
 * @param {string} id
 * @param {string} token
 * @returns {Promise<boolean>}
 */
export async function deletePublicacion(id, token) {
  if (!id) throw new Error('ID de publicación requerido');
  try {
    const res = await fetch(`${API_URL}/api/publicaciones/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: buildHeaders(token, false)
    });

    if (!res.ok) await handleErrorResponse(res, 'Error al eliminar publicación');

    return true;
  } catch (error) {
    
    console.error('deletePublicacion:', error);
    throw error;
  }
}

/**
 * Denuncia una publicación inapropiada.
 * @param {string} publicacionId
 * @param {string} motivo
 * @param {string} descripcion
 * @returns {Promise<any>}
 */
export const denunciarPublicacion = async (publicacionId, motivo, descripcion) => {
  if (!publicacionId) throw new Error('ID de publicación requerido');
  try {
    const token = getToken();
    const url = `${API_URL}/api/publicaciones/${encodeURIComponent(publicacionId)}/denunciar`;
    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(token, true),
      body: JSON.stringify({ motivo, descripcion })
    });

    if (!res.ok) await handleErrorResponse(res, 'Error al denunciar publicación');

    return (await parseResponse(res)) || {};
  } catch (error) {
  
    console.error('denunciarPublicacion:', error);
    throw error;
  }
};

/**
 * Denuncia un comentario.
 * @param {string} comentarioId
 * @param {string} motivo
 * @param {string} descripcion
 * @returns {Promise<any>}
 */
export const denunciarComentario = async (comentarioId, motivo, descripcion = '') => {
  if (!comentarioId) throw new Error('ID de comentario requerido');
  try {
    const token = getToken();
    const url = `${API_URL}/api/publicaciones/comentarios/${encodeURIComponent(comentarioId)}/denunciar`;
    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(token, true),
      body: JSON.stringify({ motivo, descripcion })
    });

    if (!res.ok) await handleErrorResponse(res, 'Error al denunciar comentario');

    return (await parseResponse(res)) || {};
  } catch (error) {
   
    console.error('denunciarComentario:', error);
    throw error;
  }
};
