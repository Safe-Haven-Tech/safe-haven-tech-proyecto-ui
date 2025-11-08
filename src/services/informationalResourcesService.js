/**
 * Cliente HTTP para Recursos Informativos.
 * Entorno: Vite (import.meta.env.VITE_API_URL).
 */

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Intenta parsear Response a JSON; si falla devuelve texto o null.
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
 * Extrae mensaje útil del body si existe.
 * @param {any} body
 * @returns {string|null}
 */
const extractMessage = (body) => {
  if (!body) return null;
  if (typeof body === 'string') return body;
  return body.mensaje || body.message || body.error || body.detalles || null;
};

/**
 * Obtener recurso por ID (público).
 * Retorna { data, status, mensaje } para compatibilidad con implementación previa.
 * @param {string} id
 * @returns {Promise<{data:any|null, status:number, mensaje:string}>}
 */
export const fetchRecursoById = async (id) => {
  if (!id) throw new Error('ID requerido');

  try {
    const res = await fetch(
      `${API_URL}/api/recursos-informativos/${encodeURIComponent(id)}`
    );
    const body = await parseResponse(res);

    if (res.status === 404) {
      return {
        data: null,
        status: 404,
        mensaje: extractMessage(body) || 'Recurso no encontrado',
      };
    }

    if (res.status === 400) {
      return {
        data: null,
        status: 400,
        mensaje: extractMessage(body) || 'Error en la solicitud',
      };
    }

    if (!res.ok) {
      return {
        data: null,
        status: res.status,
        mensaje: extractMessage(body) || 'Error al obtener el recurso',
      };
    }

    return {
      data: body?.data ?? null,
      status: 200,
      mensaje: extractMessage(body) || 'Recurso obtenido exitosamente',
    };
  } catch (error) {
    console.error('fetchRecursoById error:', error.message || error);
    return {
      data: null,
      status: 500,
      mensaje: 'Error de conexión con el servidor',
    };
  }
};

/* ==================== OBTENER RECURSOS ==================== */

/**
 * Lista recursos con filtros y paginación.
 * @param {Object} filtros
 * @returns {Promise<{recursos:Array, paginacion:Object}>}
 */
export const fetchRecursos = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.pagina) params.append('pagina', String(filtros.pagina));
    if (filtros.limite) params.append('limite', String(filtros.limite));
    if (filtros.topico && filtros.topico !== 'Todos')
      params.append('topico', filtros.topico);
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.destacado !== undefined)
      params.append('destacado', String(filtros.destacado));
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);

    const url = `${API_URL}/api/recursos-informativos${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error('Error al obtener los recursos');

    const body = await parseResponse(res);
    return {
      recursos: body?.data ?? [],
      paginacion: body?.paginacion ?? {},
    };
  } catch (error) {
    console.error('fetchRecursos error:', error.message || error);
    throw error;
  }
};

/**
 * Recursos destacados.
 * @param {number} limite
 * @returns {Promise<Array>}
 */
export const fetchRecursosDestacados = async (limite = 6) => {
  try {
    const url = `${API_URL}/api/recursos-informativos/destacados?limite=${encodeURIComponent(String(limite))}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener recursos destacados');
    const body = await parseResponse(res);
    return body?.data ?? [];
  } catch (error) {
    console.error('fetchRecursosDestacados error:', error.message || error);
    throw error;
  }
};

/**
 * Buscar recursos por término y opciones.
 * @param {string} termino
 * @param {Object} opciones
 * @returns {Promise<Array>}
 */
export const buscarRecursos = async (termino, opciones = {}) => {
  if (!termino) return [];
  try {
    const params = new URLSearchParams();
    params.append('q', termino);
    if (opciones.topico) params.append('topico', opciones.topico);
    if (opciones.limite) params.append('limite', String(opciones.limite));

    const url = `${API_URL}/api/recursos-informativos/buscar?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al buscar recursos');
    const body = await parseResponse(res);
    return body?.data ?? [];
  } catch (error) {
    console.error('buscarRecursos error:', error.message || error);
    throw error;
  }
};

/**
 * Obtener recursos por tópico.
 * @param {string} topico
 * @param {Object} opciones
 * @returns {Promise<Array>}
 */
export const fetchRecursosPorTopico = async (topico, opciones = {}) => {
  if (!topico) return [];
  try {
    const params = new URLSearchParams();
    if (opciones.limite) params.append('limite', String(opciones.limite));
    if (opciones.ordenarPor) params.append('ordenarPor', opciones.ordenarPor);

    const url = `${API_URL}/api/recursos-informativos/buscar/topico/${encodeURIComponent(topico)}${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener recursos por tópico');
    const body = await parseResponse(res);
    return body?.data ?? [];
  } catch (error) {
    console.error('fetchRecursosPorTopico error:', error.message || error);
    throw error;
  }
};

/**
 * Obtener recursos por tipo.
 * @param {string} tipo
 * @param {Object} opciones
 * @returns {Promise<Array>}
 */
export const fetchRecursosPorTipo = async (tipo, opciones = {}) => {
  if (!tipo) return [];
  try {
    const params = new URLSearchParams();
    if (opciones.limite) params.append('limite', String(opciones.limite));
    if (opciones.ordenarPor) params.append('ordenarPor', opciones.ordenarPor);

    const url = `${API_URL}/api/recursos-informativos/tipo/${encodeURIComponent(tipo)}${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener recursos por tipo');
    const body = await parseResponse(res);
    return body?.data ?? [];
  } catch (error) {
    console.error('fetchRecursosPorTipo error:', error.message || error);
    throw error;
  }
};

/* ==================== OBTENER METADATOS ==================== */

/**
 * Tópicos disponibles.
 * @returns {Promise<Array>}
 */
export const fetchTopicosDisponibles = async () => {
  try {
    const res = await fetch(
      `${API_URL}/api/recursos-informativos/topicos/disponibles`
    );
    if (!res.ok) throw new Error('Error al obtener tópicos disponibles');
    const body = await parseResponse(res);
    return body?.data ?? [];
  } catch (error) {
    console.error('fetchTopicosDisponibles error:', error.message || error);
    throw error;
  }
};

/**
 * Tipos disponibles.
 * @returns {Promise<Array>}
 */
export const fetchTiposDisponibles = async () => {
  try {
    const res = await fetch(
      `${API_URL}/api/recursos-informativos/tipos/disponibles`
    );
    if (!res.ok) throw new Error('Error al obtener tipos disponibles');
    const body = await parseResponse(res);
    return body?.data ?? [];
  } catch (error) {
    console.error('fetchTiposDisponibles error:', error.message || error);
    throw error;
  }
};

/**
 * Obtener estadísticas públicas.
 * @returns {Promise<any>}
 */
export const fetchEstadisticas = async () => {
  try {
    const res = await fetch(
      `${API_URL}/api/recursos-informativos/estadisticas`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!res.ok) {
      const body = await parseResponse(res).catch(() => null);
      throw new Error(extractMessage(body) || `Error HTTP: ${res.status}`);
    }

    const body = await parseResponse(res);
    return body?.data ?? null;
  } catch (error) {
    console.error('fetchEstadisticas error:', error.message || error);
    throw error;
  }
};

/* ==================== INTERACCIONES ==================== */

/**
 * Incrementar contador de visitas para un recurso.
 * @param {string} id
 * @returns {Promise<any>}
 */
export const incrementarVisitas = async (id) => {
  if (!id) throw new Error('ID requerido');
  try {
    const res = await fetch(
      `${API_URL}/api/recursos-informativos/${encodeURIComponent(id)}/visitas`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!res.ok) {
      const body = await parseResponse(res).catch(() => null);
      throw new Error(extractMessage(body) || 'Error al incrementar visitas');
    }

    return await parseResponse(res);
  } catch (error) {
    console.error('incrementarVisitas error:', error.message || error);
    throw error;
  }
};

/**
 * Incrementar contador de descargas para un recurso.
 * @param {string} id
 * @returns {Promise<any>}
 */
export const incrementarDescargas = async (id) => {
  if (!id) throw new Error('ID requerido');
  try {
    const res = await fetch(
      `${API_URL}/api/recursos-informativos/${encodeURIComponent(id)}/descargas`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!res.ok) {
      const body = await parseResponse(res).catch(() => null);
      throw new Error(extractMessage(body) || 'Error al incrementar descargas');
    }

    return await parseResponse(res);
  } catch (error) {
    console.error('incrementarDescargas error:', error.message || error);
    throw error;
  }
};

/**
 * Incrementar contador de compartidos para un recurso.
 * @param {string} id
 * @returns {Promise<any>}
 */
export const incrementarCompartidos = async (id) => {
  if (!id) throw new Error('ID requerido');
  try {
    const res = await fetch(
      `${API_URL}/api/recursos-informativos/${encodeURIComponent(id)}/compartidos`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!res.ok) {
      const body = await parseResponse(res).catch(() => null);
      throw new Error(
        extractMessage(body) || 'Error al incrementar compartidos'
      );
    }

    return await parseResponse(res);
  } catch (error) {
    console.error('incrementarCompartidos error:', error.message || error);
    throw error;
  }
};

/* ==================== CALIFICACIONES (requiere token) ==================== */

/**
 * Calificar recurso (requiere token).
 * @param {string} id
 * @param {number} calificacion
 * @param {string} token
 * @returns {Promise<any>}
 */
export const calificarRecurso = async (id, calificacion, token) => {
  if (!id) throw new Error('ID requerido');
  if (calificacion == null) throw new Error('Calificación requerida');
  if (!token) throw new Error('Token requerido');

  try {
    const res = await fetch(
      `${API_URL}/api/recursos-informativos/${encodeURIComponent(id)}/calificar`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ calificacion }),
      }
    );

    if (!res.ok) {
      const body = await parseResponse(res).catch(() => null);
      throw new Error(extractMessage(body) || 'Error al calificar recurso');
    }

    return await parseResponse(res);
  } catch (error) {
    console.error('calificarRecurso error:', error.message || error);
    throw error;
  }
};
