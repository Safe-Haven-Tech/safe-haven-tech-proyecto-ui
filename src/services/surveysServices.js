/**
 * Servicios HTTP para encuestas.
 * Entorno: Vite (import.meta.env.VITE_API_URL).
 */

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Construye headers para fetch. No añade 'Content-Type' cuando no procede.
 * @param {string|null} token
 * @param {boolean} asJson - Agrega 'Content-Type: application/json' si true.
 * @returns {Record<string,string>}
 */
const buildHeaders = (token = null, asJson = true) => {
  const headers = {};
  if (asJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

/**
 * Intenta parsear una Response como JSON; si falla devuelve el texto crudo.
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
 * Obtener encuesta por ID (público).
 * Retorna objeto con { encuesta, status, mensaje } (compatible con implementación previa).
 * @param {string} id
 * @returns {Promise<{encuesta: any|null, status: number, mensaje: string}>}
 */
export const fetchEncuestaById = async (id) => {
  try {
    const res = await fetch(
      `${API_URL}/api/encuestas/${encodeURIComponent(id)}`
    );
    const data = await parseResponse(res);

    if (res.status === 404) {
      return {
        encuesta: null,
        status: 404,
        mensaje:
          (data && (data.detalles || data.mensaje)) || 'Encuesta no encontrada',
      };
    }

    if (res.status === 400) {
      return {
        encuesta: null,
        status: 400,
        mensaje:
          (data && (data.detalles || data.mensaje)) ||
          'La encuesta no está activa',
      };
    }

    if (!res.ok) {
      return {
        encuesta: null,
        status: res.status,
        mensaje:
          (data && (data.detalles || data.mensaje)) ||
          'Error al obtener la encuesta',
      };
    }

    return {
      encuesta: data?.encuesta ?? null,
      status: 200,
      mensaje: data?.mensaje ?? '',
    };
  } catch (error) {
    // Registro mínimo para depuración local; no exponer datos sensibles.

    console.error('fetchEncuestaById:', error);
    return {
      encuesta: null,
      status: 500,
      mensaje: 'Error de conexión con el servidor',
    };
  }
};

/* ==================== COMPLETAR ENCUESTA ==================== */

/**
 * Completa una encuesta.
 * Devuelve un Blob (PDF) en caso de éxito.
 * @param {string} encuestaId
 * @param {any} respuestas
 * @param {string|null} token
 * @returns {Promise<Blob>}
 * @throws {Error}
 */
export const completarEncuesta = async (
  encuestaId,
  respuestas,
  token = null
) => {
  try {
    const res = await fetch(
      `${API_URL}/api/encuestas/${encodeURIComponent(encuestaId)}/completar`,
      {
        method: 'POST',
        headers: buildHeaders(token, true),
        body: JSON.stringify({ respuestas }),
      }
    );

    if (!res.ok) {
      const errorData = await parseResponse(res).catch(() => ({}));
      throw new Error(
        (errorData && (errorData.detalles || errorData.mensaje)) ||
          'Error al completar la encuesta'
      );
    }

    return await res.blob();
  } catch (error) {
    console.error('completarEncuesta:', error);
    throw error;
  }
};

/* ==================== ENCUESTAS Y HISTORIAL ==================== */

/**
 * Obtiene la lista de encuestas públicas.
 * @returns {Promise<Array>}
 */
export const fetchEncuestas = async () => {
  try {
    const res = await fetch(`${API_URL}/api/encuestas`);
    if (!res.ok) throw new Error('Error al obtener las encuestas');
    const data = await res.json();
    return data.encuestas || [];
  } catch (error) {
    console.error('fetchEncuestas:', error);
    throw error;
  }
};

/**
 * Obtiene historial de respuestas del usuario (requiere token).
 * Devuelve { success, respuestas?, total?, mensaje? } para compatibilidad.
 * @param {string|null} token
 * @param {Object} filtros
 * @returns {Promise<Object>}
 */
export const obtenerHistorialRespuestas = async (token, filtros = {}) => {
  try {
    const queryParams = new URLSearchParams(filtros).toString();
    const url = `${API_URL}/api/encuestas/respuestas/usuario${queryParams ? `?${queryParams}` : ''}`;

    const res = await fetch(url, {
      headers: buildHeaders(token, false),
    });

    const data = await parseResponse(res);

    if (!res.ok) {
      return {
        success: false,
        mensaje:
          (data && (data.detalles || data.mensaje)) ||
          'Error al obtener historial',
      };
    }

    return {
      success: true,
      respuestas: data?.respuestas ?? [],
      total: data?.total ?? 0,
    };
  } catch (error) {
    console.error('obtenerHistorialRespuestas:', error);
    return {
      success: false,
      mensaje: 'Error de conexión con el servidor',
    };
  }
};

/**
 * Obtener mis respuestas (similar a obtenerHistorialRespuestas).
 * Retorna { success, respuestas, mensaje }.
 * @param {string|null} token
 * @param {Object} filtros
 * @returns {Promise<Object>}
 */
export const getMisRespuestas = async (token, filtros = {}) => {
  try {
    const queryParams = new URLSearchParams(filtros).toString();
    const url = `${API_URL}/api/encuestas/respuestas/usuario${queryParams ? `?${queryParams}` : ''}`;

    const res = await fetch(url, {
      headers: {
        ...buildHeaders(token, false),
        'Content-Type': 'application/json',
      },
    });

    const data = await parseResponse(res);

    if (!res.ok) {
      return {
        success: false,
        mensaje:
          (data && (data.detalles || data.mensaje)) ||
          'Error al obtener respuestas del usuario',
        respuestas: [],
      };
    }

    return { success: true, respuestas: data?.respuestas ?? [] };
  } catch (error) {
    console.error('getMisRespuestas:', error);
    return {
      success: false,
      mensaje: 'Error de conexión con el servidor',
      respuestas: [],
    };
  }
};

/**
 * Genera PDF de una respuesta (sin autenticación).
 * Devuelve Blob (PDF).
 * @param {{ encuestaId: string, respuestas: any }} respuesta
 * @returns {Promise<Blob>}
 */
export const generarPDFEncuesta = async (respuesta) => {
  try {
    const res = await fetch(
      `${API_URL}/api/encuestas/${encodeURIComponent(respuesta.encuestaId)}/completar-sin-auth`,
      {
        method: 'POST',
        headers: buildHeaders(null, true),
        body: JSON.stringify({ respuestas: respuesta.respuestas }),
      }
    );

    if (!res.ok) throw new Error('Error generando PDF');

    return await res.blob();
  } catch (error) {
    console.error('generarPDFEncuesta:', error);
    throw error;
  }
};

/**
 * Crear encuesta (requiere token). Lanza Error en fallo.
 * @param {Object} encuesta
 * @param {string|null} token
 * @returns {Promise<any>}
 */
export const crearEncuesta = async (encuesta, token) => {
  try {
    const res = await fetch(`${API_URL}/api/encuestas`, {
      method: 'POST',
      headers: buildHeaders(token, true),
      body: JSON.stringify(encuesta),
    });
    const data = await parseResponse(res);
    if (!res.ok) {
      throw new Error(
        (data && (data.detalles || data.mensaje)) ||
          'Error al crear la encuesta'
      );
    }
    return data.encuesta;
  } catch (error) {
    console.error('crearEncuesta:', error);
    throw error;
  }
};

/**
 * Desactivar encuesta (requiere token). Retorna { success, encuesta?, mensaje? }.
 * @param {string} encuestaId
 * @param {string|null} token
 * @returns {Promise<Object>}
 */
export const desactivarEncuesta = async (encuestaId, token) => {
  try {
    const res = await fetch(
      `${API_URL}/api/encuestas/${encodeURIComponent(encuestaId)}/desactivar`,
      {
        method: 'PUT',
        headers: buildHeaders(token, true),
      }
    );
    const data = await parseResponse(res);
    if (!res.ok)
      throw new Error((data && data.mensaje) || 'Error al desactivar encuesta');
    return { success: true, encuesta: data.encuesta };
  } catch (error) {
    console.error('desactivarEncuesta:', error);
    return { success: false, mensaje: error.message };
  }
};

/**
 * Eliminar encuesta (requiere token). Retorna { success, mensaje? }.
 * @param {string} encuestaId
 * @param {string|null} token
 * @returns {Promise<Object>}
 */
export const eliminarEncuesta = async (encuestaId, token) => {
  try {
    const res = await fetch(
      `${API_URL}/api/encuestas/${encodeURIComponent(encuestaId)}`,
      {
        method: 'DELETE',
        headers: buildHeaders(token, true),
      }
    );
    const data = await parseResponse(res);
    if (!res.ok)
      throw new Error((data && data.mensaje) || 'Error al eliminar encuesta');
    return { success: true };
  } catch (error) {
    console.error('eliminarEncuesta:', error);
    return { success: false, mensaje: error.message };
  }
};

/**
 * Activar encuesta (requiere token). Retorna { success, encuesta?, mensaje? }.
 * @param {string} encuestaId
 * @param {string|null} token
 * @returns {Promise<Object>}
 */
export const activarEncuesta = async (encuestaId, token) => {
  try {
    const res = await fetch(
      `${API_URL}/api/encuestas/${encodeURIComponent(encuestaId)}/activar`,
      {
        method: 'PUT',
        headers: buildHeaders(token, true),
      }
    );
    const data = await parseResponse(res);
    if (!res.ok)
      throw new Error((data && data.mensaje) || 'Error al activar encuesta');
    return { success: true, encuesta: data.encuesta };
  } catch (error) {
    console.error('activarEncuesta:', error);
    return { success: false, mensaje: error.message };
  }
};

/**
 * Actualizar encuesta (requiere token). Retorna { success, encuesta?, mensaje? }.
 * @param {string} encuestaId
 * @param {Object} datos
 * @param {string|null} token
 * @returns {Promise<Object>}
 */
export const actualizarEncuesta = async (encuestaId, datos, token) => {
  try {
    const res = await fetch(
      `${API_URL}/api/encuestas/${encodeURIComponent(encuestaId)}`,
      {
        method: 'PUT',
        headers: buildHeaders(token, true),
        body: JSON.stringify(datos),
      }
    );
    const data = await parseResponse(res);
    if (!res.ok)
      throw new Error((data && data.mensaje) || 'Error al actualizar encuesta');
    return { success: true, encuesta: data.encuesta };
  } catch (error) {
    console.error('actualizarEncuesta:', error);
    return { success: false, mensaje: error.message };
  }
};
