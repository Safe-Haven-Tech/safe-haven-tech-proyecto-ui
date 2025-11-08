/**
 * Servicios relacionados con funcionalidades de red social.
 * Entorno: Vite (import.meta.env.VITE_API_URL).
 *
 */

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Obtiene token desde localStorage (comportamiento existente).
 * @returns {string|null}
 */
const getStoredToken = () => localStorage.getItem('token');

/**
 * Construye headers para fetch.
 * - No añade Content-Type cuando no corresponde (p.ej. FormData).
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
 * Intenta parsear la respuesta como JSON; si falla devuelve texto o null.
 * @param {Response} res
 * @returns {Promise<any|null>}
 */
const parseResponse = async (res) => {
  try {
    // Intentar JSON primero (la mayoría de endpoints devuelven JSON)
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
 * Extrae y lanza Error con detalle del body o mensaje por defecto.
 * @param {Response} res
 * @param {string} defaultMessage
 * @throws {Error}
 */
const throwErrorFromResponse = async (res, defaultMessage) => {
  const body = await parseResponse(res).catch(() => null);
  const detail =
    body && (body.error || body.message || body.mensaje || body.detalles)
      ? body.error || body.message || body.mensaje || body.detalles
      : defaultMessage || `HTTP ${res.status}`;
  const err = new Error(detail);
  err.status = res.status;
  err.body = body;
  throw err;
};

/* ---------------------------
   API: Red social
   --------------------------- */

export async function seguirUsuario(usuarioId) {
  const token = getStoredToken();
  try {
    const res = await fetch(
      `${API_URL}/api/red-social/seguir/${encodeURIComponent(usuarioId)}`,
      {
        method: 'POST',
        headers: buildHeaders(token, false),
      }
    );
    if (!res.ok) await throwErrorFromResponse(res, 'Error al seguir usuario');
    return await parseResponse(res);
  } catch (error) {
    console.error('seguirUsuario:', error);
    throw error;
  }
}

export async function dejarDeSeguirUsuario(usuarioId) {
  const token = getStoredToken();
  try {
    const res = await fetch(
      `${API_URL}/api/red-social/seguir/${encodeURIComponent(usuarioId)}`,
      {
        method: 'DELETE',
        headers: buildHeaders(token, false),
      }
    );
    if (!res.ok)
      await throwErrorFromResponse(res, 'Error al dejar de seguir usuario');
    return await parseResponse(res);
  } catch (error) {
    console.error('dejarDeSeguirUsuario:', error);
    throw error;
  }
}

export async function obtenerSeguidores(usuarioId) {
  const token = getStoredToken();
  try {
    const res = await fetch(
      `${API_URL}/api/red-social/seguidores/${encodeURIComponent(usuarioId)}`,
      {
        headers: buildHeaders(token, false),
      }
    );
    if (!res.ok)
      await throwErrorFromResponse(res, 'Error al obtener seguidores');
    return await parseResponse(res);
  } catch (error) {
    console.error('obtenerSeguidores:', error);
    throw error;
  }
}

export async function cancelarSolicitudSeguimiento(usuarioId) {
  const token = getStoredToken();
  try {
    const res = await fetch(
      `${API_URL}/api/red-social/solicitud/${encodeURIComponent(usuarioId)}`,
      {
        method: 'DELETE',
        headers: buildHeaders(token, false),
      }
    );
    if (!res.ok)
      await throwErrorFromResponse(res, 'Error al cancelar solicitud');
    return await parseResponse(res);
  } catch (error) {
    console.error('cancelarSolicitudSeguimiento:', error);
    throw error;
  }
}

export async function obtenerSolicitudesSeguidores() {
  const token = getStoredToken();
  try {
    const res = await fetch(`${API_URL}/api/red-social/solicitudes`, {
      headers: buildHeaders(token, false),
    });
    if (!res.ok)
      await throwErrorFromResponse(res, 'Error al obtener solicitudes');
    const parsed = await parseResponse(res);
    return parsed?.solicitudes ?? parsed ?? [];
  } catch (error) {
    console.error('obtenerSolicitudesSeguidores:', error);
    throw error;
  }
}

export async function aceptarSolicitudSeguimiento(solicitanteId) {
  const token = getStoredToken();
  try {
    const res = await fetch(
      `${API_URL}/api/red-social/solicitudes/${encodeURIComponent(solicitanteId)}/aceptar`,
      {
        method: 'POST',
        headers: buildHeaders(token, false),
      }
    );
    if (!res.ok)
      await throwErrorFromResponse(res, 'Error al aceptar solicitud');
    return await parseResponse(res);
  } catch (error) {
    console.error('aceptarSolicitudSeguimiento:', error);
    throw error;
  }
}

export async function rechazarSolicitudSeguimiento(solicitanteId) {
  const token = getStoredToken();
  try {
    const res = await fetch(
      `${API_URL}/api/red-social/solicitudes/${encodeURIComponent(solicitanteId)}/rechazar`,
      {
        method: 'POST',
        headers: buildHeaders(token, false),
      }
    );
    if (!res.ok)
      await throwErrorFromResponse(res, 'Error al rechazar solicitud');
    return await parseResponse(res);
  } catch (error) {
    console.error('rechazarSolicitudSeguimiento:', error);
    throw error;
  }
}

export async function obtenerNotificaciones(page = 1, perPage = 20) {
  const token = getStoredToken();
  try {
    const url = `${API_URL}/api/red-social/notificaciones?page=${encodeURIComponent(
      page
    )}&perPage=${encodeURIComponent(perPage)}`;
    const res = await fetch(url, {
      headers: buildHeaders(token, false),
    });
    if (!res.ok)
      await throwErrorFromResponse(res, 'Error al obtener notificaciones');
    const json = await parseResponse(res);
    const items =
      json?.notificaciones ?? json?.data ?? (Array.isArray(json) ? json : []);
    const meta = json?.meta ?? {
      noLeidas: Array.isArray(items) ? items.filter((n) => !n.leida).length : 0,
    };
    return { notificaciones: items, meta };
  } catch (error) {
    console.error('obtenerNotificaciones:', error);
    throw error;
  }
}

export async function marcarNotificacionLeida(notificacionId) {
  const token = getStoredToken();
  try {
    const res = await fetch(
      `${API_URL}/api/red-social/notificaciones/${encodeURIComponent(notificacionId)}/leer`,
      {
        method: 'PATCH',
        headers: buildHeaders(token, true),
      }
    );
    if (!res.ok)
      await throwErrorFromResponse(
        res,
        'Error marcando notificación como leída'
      );
    return await parseResponse(res);
  } catch (error) {
    console.error('marcarNotificacionLeida:', error);
    throw error;
  }
}

export async function marcarTodasNotificacionesLeidas() {
  const token = getStoredToken();
  try {
    const res = await fetch(
      `${API_URL}/api/red-social/notificaciones/leer-todas`,
      {
        method: 'PATCH',
        headers: buildHeaders(token, true),
      }
    );
    if (!res.ok)
      await throwErrorFromResponse(
        res,
        'Error marcando todas las notificaciones como leídas'
      );
    return await parseResponse(res);
  } catch (error) {
    console.error('marcarTodasNotificacionesLeidas:', error);
    throw error;
  }
}
