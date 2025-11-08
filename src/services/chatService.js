/**
 * Cliente HTTP para funcionalidades de chat.
 * Entorno: Vite (import.meta.env.VITE_API_URL).
 */

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/**
 * Construye headers para fetch. Si isFormData es true no añade Content-Type.
 * Si no se suministra token, intenta leer de localStorage.
 * @param {string|null} token
 * @param {boolean} isFormData
 * @returns {{[k:string]:string}}
 */
const buildHeaders = (token = null, isFormData = false) => {
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  const t = token || localStorage.getItem('token');
  if (t) headers['Authorization'] = `Bearer ${t}`;
  return headers;
};

/**
 * Parsea la respuesta del servidor.
 * - Intenta JSON, si falla devuelve texto.
 * - Si res.ok === false lanza Error con detalle, status y body adjuntos.
 * @param {Response} res
 * @returns {Promise<any>}
 * @throws {Error}
 */
const parseResponse = async (res) => {
  const text = await res.text().catch(() => null);
  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const detail =
      body && (body.error || body.mensaje || body.detalles || body.message)
        ? body.error || body.mensaje || body.detalles || body.message
        : typeof body === 'string'
          ? body
          : `HTTP ${res.status}`;
    const err = new Error(detail);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
};

/**
 * Crea un chat con otro usuario.
 * @param {string|null} token
 * @param {string} usuarioId
 * @returns {Promise<any>} chat creado o payload completo
 */
export const crearChat = async (token, usuarioId) => {
  if (!usuarioId) throw new Error('usuarioId requerido');

  try {
    const res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: buildHeaders(token, false),
      body: JSON.stringify({ usuarioId }),
    });

    const body = await parseResponse(res);
    return body?.chat ?? body;
  } catch (error) {
    console.error('crearChat error:', error.message || error);
    throw error;
  }
};

/**
 * Obtiene lista de chats paginada.
 * @param {string|null} token
 * @param {number} pagina
 * @param {number} limite
 * @returns {Promise<any>} { chats, paginacion, ... }
 */
export const obtenerChats = async (token, pagina = 1, limite = 20) => {
  try {
    const url = new URL(`${API_URL}/api/chat`);
    url.searchParams.set('pagina', String(pagina));
    url.searchParams.set('limite', String(limite));

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: buildHeaders(token, false),
    });

    return await parseResponse(res);
  } catch (error) {
    console.error('obtenerChats error:', error.message || error);
    throw error;
  }
};

/**
 * Obtiene detalle de un chat por ID.
 * @param {string|null} token
 * @param {string} chatId
 * @returns {Promise<any>} chat
 */
export const obtenerChatPorId = async (token, chatId) => {
  if (!chatId) throw new Error('chatId requerido');

  try {
    const res = await fetch(
      `${API_URL}/api/chat/${encodeURIComponent(chatId)}`,
      {
        method: 'GET',
        headers: buildHeaders(token, false),
      }
    );

    const body = await parseResponse(res);
    return body?.chat ?? body;
  } catch (error) {
    console.error('obtenerChatPorId error:', error.message || error);
    throw error;
  }
};

/**
 * Obtiene mensajes de un chat paginados.
 * @param {string|null} token
 * @param {string} chatId
 * @param {number} pagina
 * @param {number} limite
 * @returns {Promise<any>} { mensajes, paginacion, ... }
 */
export const obtenerMensajes = async (
  token,
  chatId,
  pagina = 1,
  limite = 50
) => {
  if (!chatId) throw new Error('chatId requerido');

  try {
    const url = new URL(
      `${API_URL}/api/chat/${encodeURIComponent(chatId)}/mensajes`
    );
    url.searchParams.set('pagina', String(pagina));
    url.searchParams.set('limite', String(limite));

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: buildHeaders(token, false),
    });

    return await parseResponse(res);
  } catch (error) {
    console.error('obtenerMensajes error:', error.message || error);
    throw error;
  }
};

/**
 * Envía un mensaje a un chat.
 * @param {string|null} token
 * @param {string} chatId
 * @param {string} contenido
 * @param {boolean} esTemporal
 * @param {string|null} expiraEn
 * @returns {Promise<any>} mensaje enviado o payload
 */
export const enviarMensaje = async (
  token,
  chatId,
  contenido,
  esTemporal = false,
  expiraEn = null
) => {
  if (!chatId) throw new Error('chatId requerido');
  if (contenido == null) throw new Error('contenido requerido');

  try {
    const res = await fetch(
      `${API_URL}/api/chat/${encodeURIComponent(chatId)}/mensajes`,
      {
        method: 'POST',
        headers: buildHeaders(token, false),
        body: JSON.stringify({ contenido, esTemporal, expiraEn }),
      }
    );

    const body = await parseResponse(res);
    return body?.mensajeEnviado ?? body?.mensaje ?? body;
  } catch (error) {
    console.error('enviarMensaje error:', error.message || error);
    throw error;
  }
};

/**
 * Sube archivos adjuntos a un mensaje.
 * @param {string|null} token
 * @param {string} chatId
 * @param {string} mensajeId
 * @param {File[]} files
 * @returns {Promise<any>}
 */
export const subirArchivosAMensaje = async (
  token,
  chatId,
  mensajeId,
  files = []
) => {
  if (!chatId) throw new Error('chatId requerido');
  if (!mensajeId) throw new Error('mensajeId requerido');

  const fd = new FormData();
  (files || []).forEach((f) => fd.append('archivosAdjuntos', f));

  try {
    const res = await fetch(
      `${API_URL}/api/chat/${encodeURIComponent(chatId)}/mensajes/${encodeURIComponent(mensajeId)}/archivos`,
      {
        method: 'POST',
        headers: buildHeaders(token, true), // no Content-Type para FormData
        body: fd,
      }
    );

    return await parseResponse(res);
  } catch (error) {
    console.error('subirArchivosAMensaje error:', error.message || error);
    throw error;
  }
};

/**
 * Marca mensajes de un chat como leídos.
 * @param {string|null} token
 * @param {string} chatId
 * @returns {Promise<any>}
 */
export const marcarMensajesLeidos = async (token, chatId) => {
  if (!chatId) throw new Error('chatId requerido');

  try {
    const res = await fetch(
      `${API_URL}/api/chat/${encodeURIComponent(chatId)}/mensajes/leer`,
      {
        method: 'PATCH',
        headers: buildHeaders(token, false),
      }
    );

    return await parseResponse(res);
  } catch (error) {
    console.error('marcarMensajesLeidos error:', error.message || error);
    throw error;
  }
};

/**
 * Elimina un mensaje por su ID.
 * @param {string|null} token
 * @param {string} mensajeId
 * @returns {Promise<any>}
 */
export const eliminarMensaje = async (token, mensajeId) => {
  if (!mensajeId) throw new Error('mensajeId requerido');

  try {
    const res = await fetch(
      `${API_URL}/api/chat/mensajes/${encodeURIComponent(mensajeId)}`,
      {
        method: 'DELETE',
        headers: buildHeaders(token, false),
      }
    );

    return await parseResponse(res);
  } catch (error) {
    console.error('eliminarMensaje error:', error.message || error);
    throw error;
  }
};

/**
 * Elimina un chat por su ID.
 * @param {string|null} token
 * @param {string} chatId
 * @returns {Promise<any>}
 */
export const eliminarChat = async (token, chatId) => {
  if (!chatId) throw new Error('chatId requerido');

  try {
    const res = await fetch(
      `${API_URL}/api/chat/${encodeURIComponent(chatId)}`,
      {
        method: 'DELETE',
        headers: buildHeaders(token, false),
      }
    );

    return await parseResponse(res);
  } catch (error) {
    console.error('eliminarChat error:', error.message || error);
    throw error;
  }
};

/* Default export for convenience (preserves previous API) */
export default {
  crearChat,
  obtenerChats,
  obtenerChatPorId,
  obtenerMensajes,
  enviarMensaje,
  subirArchivosAMensaje,
  marcarMensajesLeidos,
  eliminarMensaje,
  eliminarChat,
};
