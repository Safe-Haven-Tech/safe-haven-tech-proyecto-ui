/**
 * Servicios para gestión y normalización de denuncias (moderación).
 * - Entorno: Vite (import.meta.env.VITE_API_URL).
 * - Lectura de token desde parámetro o localStorage si no se recibe.
 * - Uso de encodeURIComponent y URLs normalizadas.
 * - Mensajes de log concisos y manejo consistente de parsing.
 */

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/$/, '');

/**
 * Construye headers para fetch. Si no se suministra token, intenta leer de localStorage.
 * No añade Content-Type cuando se envía FormData (no usado aquí).
 * @param {string|null} token
 * @returns {{[k:string]:string}}
 */
const buildHeaders = (token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  const t = token || localStorage.getItem('token');
  if (t) headers.Authorization = `Bearer ${t}`;
  return headers;
};

/**
 * Parseo robusto de Response a JSON o texto.
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
 * Recupera un recurso objetivo (publicacion, comentario, usuario) según tipo e id.
 * Devuelve null si no existe o si ocurre error.
 * @param {string|null} token
 * @param {'publicacion'|'comentario'|'usuario'} tipo
 * @param {string} id
 * @returns {Promise<any|null>}
 */
const fetchTargetByType = async (token, tipo, id) => {
  if (!id) return null;

  const pathMap = {
    publicacion: `/api/publicaciones/${encodeURIComponent(id)}`,
    comentario: `/api/comentarios/${encodeURIComponent(id)}`,
    usuario: `/api/usuarios/${encodeURIComponent(id)}`,
  };

  const path = pathMap[tipo];
  if (!path) return null;

  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: buildHeaders(token),
    });
    if (!res.ok) return null;
    const body = await parseResponse(res);
    // Normalizar posibles formas de la respuesta
    return (
      body?.publicacion ?? body?.comentario ?? body?.usuario ?? body ?? null
    );
  } catch (err) {
    // Registro mínimo

    console.error('fetchTargetByType error:', err.message || err);
    return null;
  }
};

/**
 * Normaliza un documento de denuncia recibido desde la API a la forma que espera la UI.
 * Si el objetivo viene solo como id, intenta poblarlo consultando los endpoints correspondientes.
 * @param {any} raw - Documento bruto (puede venir como { denuncia: ... } o directamente la denuncia)
 * @param {string|null} token
 * @returns {Promise<any|null>}
 */
export async function normalizeDenuncia(raw, token = null) {
  if (!raw) return null;
  const doc = raw.denuncia ?? raw;

  const tipo = doc.tipoDenuncia ?? doc.tipo ?? null;
  const publicacionId =
    doc.publicacionId ?? doc.objetivo?.publicacionId ?? null;
  const comentarioId = doc.comentarioId ?? doc.objetivo?.comentarioId ?? null;
  const usuarioDenunciadoId =
    doc.usuarioDenunciadoId ??
    doc.objetivo?.usuarioDenunciadoId ??
    doc.objetivo ??
    null;

  let objetivo = null;

  try {
    if (tipo === 'publicacion' && publicacionId) {
      objetivo =
        typeof publicacionId === 'string'
          ? await fetchTargetByType(token, 'publicacion', publicacionId)
          : publicacionId;
    } else if (tipo === 'comentario' && comentarioId) {
      objetivo =
        typeof comentarioId === 'string'
          ? await fetchTargetByType(token, 'comentario', comentarioId)
          : comentarioId;

      // Si el comentario existe y su autor es solo un id, intentar poblar usuario del comentario
      if (objetivo && typeof objetivo === 'object') {
        const uid = objetivo.usuarioId ?? objetivo.autor ?? objetivo.usuario;
        if (uid) {
          if (typeof uid === 'string') {
            const usuario = await fetchTargetByType(token, 'usuario', uid);
            if (usuario) objetivo.usuario = usuario;
          } else if (typeof uid === 'object' && uid._id) {
            objetivo.usuario = uid;
          }
        }
      }
    } else if (tipo === 'usuario' && usuarioDenunciadoId) {
      objetivo =
        typeof usuarioDenunciadoId === 'string'
          ? await fetchTargetByType(token, 'usuario', usuarioDenunciadoId)
          : usuarioDenunciadoId;
    }
  } catch (err) {
    console.error('normalizeDenuncia fetch error:', err.message || err);
    // continuar con lo que se tenga
  }

  const autor = doc.usuarioId ?? doc.autor ?? doc.usuario ?? null;

  return {
    _id: doc._id ?? doc.id ?? null,
    tipoDenuncia: tipo,
    motivo: doc.motivo ?? null,
    fecha: doc.fecha ?? doc.createdAt ?? null,
    descripcion: doc.descripcion ?? '',
    estado: doc.estado ?? 'pendiente',
    objetivo, // objeto poblado si fue posible, o null
    publicacionId: tipo === 'publicacion' ? (objetivo ?? publicacionId) : null,
    comentarioId: tipo === 'comentario' ? (objetivo ?? comentarioId) : null,
    usuarioDenunciadoId:
      tipo === 'usuario' ? (objetivo ?? usuarioDenunciadoId) : null,
    usuarioId: autor,
    evidencia: doc.evidencia ?? doc.archivos ?? [],
    raw: doc,
  };
}

/**
 * Lista denuncias normalizadas.
 * @param {string} tipo - filtro opcional de tipoDenuncia
 * @param {string|null} tokenParam
 * @returns {Promise<Array>}
 */
export async function fetchDenuncias(tipo = '', tokenParam = null) {
  try {
    const params = new URLSearchParams();
    if (tipo) params.append('tipoDenuncia', tipo);
    const url = `${API_URL}/api/moderacion/denuncias${params.toString() ? `?${params.toString()}` : ''}`;
    const token = tokenParam || localStorage.getItem('token');
    const res = await fetch(url, { headers: buildHeaders(token) });

    if (!res.ok) {
      const data = await parseResponse(res).catch(() => ({}));
      throw new Error(
        data?.detalles ?? data?.error ?? 'Error al obtener denuncias'
      );
    }

    const payload = await parseResponse(res);
    let lista = [];

    if (Array.isArray(payload)) lista = payload;
    else if (Array.isArray(payload.data)) lista = payload.data;
    else if (Array.isArray(payload.docs)) lista = payload.docs;
    else if (Array.isArray(payload.denuncias)) lista = payload.denuncias;
    else if (payload && payload.denuncia && !Array.isArray(payload.denuncia))
      lista = [payload.denuncia];
    else {
      const maybe = payload.denuncia ?? payload;
      if (maybe && maybe._id) lista = [maybe];
    }

    const normalized = await Promise.all(
      lista.map((it) => normalizeDenuncia(it, token))
    );
    return normalized.filter(Boolean);
  } catch (error) {
    console.error('fetchDenuncias error:', error.message || error);
    throw error;
  }
}

/**
 * Obtener una denuncia por ID y normalizarla.
 * @param {string} id
 * @param {string|null} tokenParam
 * @returns {Promise<any>}
 */
export async function fetchDenunciaPorId(id, tokenParam = null) {
  try {
    if (!id) throw new Error('ID de denuncia requerido');
    const token = tokenParam || localStorage.getItem('token');
    const url = `${API_URL}/api/moderacion/denuncias/${encodeURIComponent(id)}`;
    const res = await fetch(url, { headers: buildHeaders(token) });

    if (!res.ok) {
      const data = await parseResponse(res).catch(() => ({}));
      throw new Error(
        data?.detalles ?? data?.error ?? 'Error al obtener la denuncia'
      );
    }

    const payload = await parseResponse(res);
    return await normalizeDenuncia(payload, token);
  } catch (error) {
    console.error('fetchDenunciaPorId error:', error.message || error);
    throw error;
  }
}

/**
 * Ejecuta una acción sobre una denuncia (PATCH).
 * @param {string} id
 * @param {Object} body - { accion: string, ... }
 * @param {string|null} tokenParam
 * @returns {Promise<any>}
 */
export async function accionDenuncia(id, body = {}, tokenParam = null) {
  try {
    if (!id) throw new Error('ID de denuncia requerido');
    if (!body || !body.accion) throw new Error('Acción requerida');

    const token = tokenParam || localStorage.getItem('token');
    const url = `${API_URL}/api/moderacion/denuncias/${encodeURIComponent(id)}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: buildHeaders(token),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await parseResponse(res).catch(() => ({}));
      throw new Error(
        data?.detalles ?? data?.error ?? 'Error al ejecutar acción'
      );
    }

    return await parseResponse(res);
  } catch (error) {
    console.error('accionDenuncia error:', error.message || error);
    throw error;
  }
}
