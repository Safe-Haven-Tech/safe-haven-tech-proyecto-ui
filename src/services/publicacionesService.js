const API_URL = import.meta.env.VITE_API_URL;

/**
 * Obtiene publicaciones públicas (usuarios públicos y no bloqueados)
 * @param {Object} opciones - Opciones de consulta (paginación, tipo, búsqueda)
 * @param {number} opciones.pagina
 * @param {number} opciones.limite
 * @param {string} opciones.tipo
 * @param {string} opciones.busqueda
 * @returns {Promise<Object>} Publicaciones y paginación
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
    if (pagina) params.append('pagina', pagina);
    if (limite) params.append('limite', limite);
    if (tipo) params.append('tipo', tipo);
    if (busqueda) params.append('busqueda', busqueda);
    if (topico) params.append('topico', topico); 

    const url = `${API_URL}/api/publicaciones?${params.toString()}`;

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detalles || errorData.error || 'Error al obtener publicaciones'
      );
    }

    return await res.json();
  } catch (error) {
    console.error('❌ Error en fetchPublicaciones:', error);
    throw error;
  }
};

/**
 * Obtiene solo publicaciones de tipo "perfil"
 * @param {Object} opciones - Opciones de consulta (paginación, búsqueda)
 * @returns {Promise<Object>} Publicaciones de perfil y paginación
 */
export const fetchPublicacionesPerfil = async (opciones = {}) => {
  const data = await fetchPublicaciones({ ...opciones, tipo: 'perfil' });
  const publicacionesPerfil = (data.publicaciones || []).filter(pub => pub.tipo === 'perfil');
  return { ...data, publicaciones: publicacionesPerfil };
};


/**
 * Obtiene el detalle de una publicación por su ID
 * @param {string} id - ID de la publicación
 * @returns {Promise<Object>} Detalle de la publicación
 */
export const fetchPublicacionPorId = async (id) => {
  try {
    const url = `${API_URL}/api/publicaciones/${id}`;
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detalles || errorData.error || 'Error al obtener la publicación'
      );
    }

    return await res.json();
  } catch (error) {
    console.error('❌ Error en fetchPublicacionPorId:', error);
    throw error;
  }
};


/**
 * Da like a una publicación
 * @param {string} id - ID de la publicación
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Estado actualizado de likes
 */
export const likePublicacion = async (id, token) => {
  try {
    const url = `${API_URL}/api/publicaciones/${id}/like`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detalles || errorData.error || 'Error al dar like'
      );
    }

    return await res.json();
  } catch (error) {
    console.error('❌ Error en likePublicacion:', error);
    throw error;
  }
};

/**
 * Quita el like de una publicación
 * @param {string} id - ID de la publicación
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Estado actualizado de likes
 */
export const unlikePublicacion = async (id, token) => {
  try {
    const url = `${API_URL}/api/publicaciones/${id}/like`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detalles || errorData.error || 'Error al quitar like'
      );
    }

    return await res.json();
  } catch (error) {
    console.error('❌ Error en unlikePublicacion:', error);
    throw error;
  }
};

/**
 * Comenta en una publicación
 * @param {string} id - ID de la publicación
 * @param {string} contenido - Contenido del comentario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Comentario creado
 */ 


export const comentarPublicacion = async (id, contenido, token) => {
  try {
    const url = `${API_URL}/api/publicaciones/${id}/comentarios`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contenido }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detalles || errorData.error || 'Error al comentar'
      );
    }

    return await res.json();
  } catch (error) {
    console.error('❌ Error en comentarPublicacion:', error);
    throw error;
  }
}


/**
 * Elimina un comentario por su ID
 * @param {string} comentarioId - ID del comentario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export const eliminarComentario = async (publicacionId, comentarioId, token) => {
  try {
    const url = `${API_URL}/api/publicaciones/${publicacionId}/comentarios/${comentarioId}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detalles || errorData.error || 'Error al eliminar el comentario'
      );
    }

    return await res.json();
  } catch (error) {
    console.error('❌ Error en eliminarComentario:', error);
    throw error;
  }
}

/** Elimina una publicación por su ID
 * @param {string} id - ID de la publicación
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} Resultado de la eliminación
 */

export async function deletePublicacion(id, token) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/publicaciones/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Error al eliminar publicación');
  }
  return true;
}