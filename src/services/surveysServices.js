const API_URL = import.meta.env.VITE_API_URL;

/** Obtener encuesta por ID (público) */
export const fetchEncuestaById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/api/encuestas/${id}`);
    const data = await res.json();

    if (res.status === 404) {
      return {
        encuesta: null,
        status: 404,
        mensaje: data.detalles || 'Encuesta no encontrada',
      };
    }
    if (res.status === 400) {
      return {
        encuesta: null,
        status: 400,
        mensaje: data.detalles || 'La encuesta no está activa',
      };
    }
    if (!res.ok) {
      return {
        encuesta: null,
        status: res.status,
        mensaje: data.detalles || 'Error al obtener la encuesta',
      };
    }

    return { encuesta: data.encuesta, status: 200, mensaje: data.mensaje };
  } catch (error) {
    console.error('Error en fetchEncuestaById:', error);
    return {
      encuesta: null,
      status: 500,
      mensaje: 'Error de conexión con el servidor',
    };
  }
};

// ==================== COMPLETAR ENCUESTA ====================

export const completarEncuesta = async (
  encuestaId,
  respuestas,
  token = null
) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(
      `${API_URL}/api/encuestas/${encuestaId}/completar`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ respuestas }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detalles ||
          errorData.mensaje ||
          'Error al completar la encuesta'
      );
    }

    return await res.blob(); // Blob para PDF
  } catch (error) {
    console.error('Error en completarEncuesta unificada:', error);
    throw error;
  }
};

// ==================== ENCUESTAS Y HISTORIAL ====================

export const fetchEncuestas = async () => {
  try {
    const res = await fetch(`${API_URL}/api/encuestas`);
    if (!res.ok) throw new Error('Error al obtener las encuestas');
    const data = await res.json();
    return data.encuestas || [];
  } catch (error) {
    console.error('Error en fetchEncuestas:', error);
    throw error;
  }
};

export const obtenerHistorialRespuestas = async (token, filtros = {}) => {
  try {
    const queryParams = new URLSearchParams(filtros).toString();
    const url = `${API_URL}/api/encuestas/respuestas/usuario${queryParams ? `?${queryParams}` : ''}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        mensaje: data.detalles || 'Error al obtener historial',
      };
    }

    return {
      success: true,
      respuestas: data.respuestas,
      total: data.total,
    };
  } catch (error) {
    console.error('Error en obtenerHistorialRespuestas:', error);
    return {
      success: false,
      mensaje: 'Error de conexión con el servidor',
    };
  }
};

export const getMisRespuestas = async (token, filtros = {}) => {
  try {
    const queryParams = new URLSearchParams(filtros).toString();
    const url = `${API_URL}/api/encuestas/respuestas/usuario${queryParams ? `?${queryParams}` : ''}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        mensaje: data.detalles || 'Error al obtener respuestas del usuario',
        respuestas: [],
      };
    }
    return { success: true, respuestas: data.respuestas || [] };
  } catch (error) {
    console.error('Error en getMisRespuestas:', error);
    return {
      success: false,
      mensaje: 'Error de conexión con el servidor',
      respuestas: [],
    };
  }
};

export const generarPDFEncuesta = async (respuesta) => {
  try {
    const res = await fetch(
      `${API_URL}/api/encuestas/${respuesta.encuestaId}/completar-sin-auth`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuestas: respuesta.respuestas }),
      }
    );

    if (!res.ok) throw new Error('Error generando PDF');

    return await res.blob(); // Devuelve el PDF como blob
  } catch (error) {
    console.error('Error en generarPDFEncuesta:', error);
    throw error;
  }
};

export const crearEncuesta = async (encuesta, token) => {
  try {
    const res = await fetch(`${API_URL}/api/encuestas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(encuesta),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        data.detalles || data.mensaje || 'Error al crear la encuesta'
      );
    }
    return data.encuesta;
  } catch (error) {
    console.error('Error en crearEncuesta:', error);
    throw error;
  }
};

export const desactivarEncuesta = async (encuestaId, token) => {
  try {
    const res = await fetch(
      `${API_URL}/api/encuestas/${encuestaId}/desactivar`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.mensaje || 'Error al desactivar encuesta');
    return { success: true, encuesta: data.encuesta };
  } catch (error) {
    console.error('Error en desactivarEncuesta:', error);
    return { success: false, mensaje: error.message };
  }
};

export const eliminarEncuesta = async (encuestaId, token) => {
  try {
    const res = await fetch(`${API_URL}/api/encuestas/${encuestaId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error al eliminar encuesta');
    return { success: true };
  } catch (error) {
    console.error('Error en eliminarEncuesta:', error);
    return { success: false, mensaje: error.message };
  }
};

export const activarEncuesta = async (encuestaId, token) => {
  try {
    const res = await fetch(`${API_URL}/api/encuestas/${encuestaId}/activar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error al activar encuesta');
    return { success: true, encuesta: data.encuesta };
  } catch (error) {
    console.error('Error en activarEncuesta:', error);
    return { success: false, mensaje: error.message };
  }
};

export const actualizarEncuesta = async (encuestaId, datos, token) => {
  try {
    const res = await fetch(`${API_URL}/api/encuestas/${encuestaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.mensaje || 'Error al actualizar encuesta');
    return { success: true, encuesta: data.encuesta };
  } catch (error) {
    console.error('Error en actualizarEncuesta:', error);
    return { success: false, mensaje: error.message };
  }
};
