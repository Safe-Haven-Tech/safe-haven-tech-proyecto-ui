const API_URL = import.meta.env.VITE_API_URL;

/** Obtener recurso por ID (público) */
export const fetchRecursoById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/api/recursos-informativos/${id}`);
    const data = await res.json();

    if (res.status === 404) {
      return {
        data: null,
        status: 404,
        mensaje: data.message || 'Recurso no encontrado',
      };
    }
    if (res.status === 400) {
      return {
        data: null,
        status: 400,
        mensaje: data.message || 'Error en la solicitud',
      };
    }
    if (!res.ok) {
      return {
        data: null,
        status: res.status,
        mensaje: data.message || 'Error al obtener el recurso',
      };
    }

    return {
      data: data.data,
      status: 200,
      mensaje: data.mensaje || 'Recurso obtenido exitosamente',
    };
  } catch (error) {
    console.error('Error en fetchRecursoById:', error);
    return {
      data: null,
      status: 500,
      mensaje: 'Error de conexión con el servidor',
    };
  }
};

// ==================== OBTENER RECURSOS ====================

export const fetchRecursos = async (filtros = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (filtros.pagina) queryParams.append('pagina', filtros.pagina);
    if (filtros.limite) queryParams.append('limite', filtros.limite);
    if (filtros.topico && filtros.topico !== 'Todos')
      queryParams.append('topico', filtros.topico);
    if (filtros.tipo) queryParams.append('tipo', filtros.tipo);
    if (filtros.destacado !== undefined)
      queryParams.append('destacado', filtros.destacado);
    if (filtros.busqueda) queryParams.append('busqueda', filtros.busqueda);

    const url = `${API_URL}/api/recursos-informativos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error('Error al obtener los recursos');

    const data = await res.json();
    return {
      recursos: data.data || [],
      paginacion: data.paginacion || {},
    };
  } catch (error) {
    console.error('Error en fetchRecursos:', error);
    throw error;
  }
};

export const fetchRecursosDestacados = async (limite = 6) => {
  try {
    const res = await fetch(
      `${API_URL}/api/recursos-informativos/destacados?limite=${limite}`
    );
    if (!res.ok) throw new Error('Error al obtener recursos destacados');
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error en fetchRecursosDestacados:', error);
    throw error;
  }
};

export const buscarRecursos = async (termino, opciones = {}) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('q', termino);

    if (opciones.topico) queryParams.append('topico', opciones.topico);
    if (opciones.limite) queryParams.append('limite', opciones.limite);

    const res = await fetch(
      `${API_URL}/api/recursos-informativos/buscar?${queryParams.toString()}`
    );
    if (!res.ok) throw new Error('Error al buscar recursos');
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error en buscarRecursos:', error);
    throw error;
  }
};

export const fetchRecursosPorTopico = async (topico, opciones = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (opciones.limite) queryParams.append('limite', opciones.limite);
    if (opciones.ordenarPor)
      queryParams.append('ordenarPor', opciones.ordenarPor);

    const url = `${API_URL}/api/recursos-informativos/buscar/topico/${encodeURIComponent(topico)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener recursos por tópico');
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error en fetchRecursosPorTopico:', error);
    throw error;
  }
};

export const fetchRecursosPorTipo = async (tipo, opciones = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (opciones.limite) queryParams.append('limite', opciones.limite);
    if (opciones.ordenarPor)
      queryParams.append('ordenarPor', opciones.ordenarPor);

    const url = `${API_URL}/api/recursos-informativos/tipo/${tipo}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener recursos por tipo');
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error en fetchRecursosPorTipo:', error);
    throw error;
  }
};

// ==================== OBTENER METADATOS ====================

export const fetchTopicosDisponibles = async () => {
  try {
    const res = await fetch(
      `${API_URL}/api/recursos-informativos/topicos/disponibles`
    );
    if (!res.ok) throw new Error('Error al obtener tópicos disponibles');
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error en fetchTopicosDisponibles:', error);
    throw error;
  }
};

export const fetchTiposDisponibles = async () => {
  try {
    const res = await fetch(
      `${API_URL}/api/recursos-informativos/tipos/disponibles`
    );
    if (!res.ok) throw new Error('Error al obtener tipos disponibles');
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error en fetchTiposDisponibles:', error);
    throw error;
  }
};

export const fetchEstadisticas = async () => {
  try {
    console.log('📊 Solicitando estadísticas al servidor...');

    // Hacer la petición SIN token ya que es público
    const response = await fetch(
      `${API_URL}/api/recursos-informativos/estadisticas`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(
      '📡 Respuesta del servidor:',
      response.status,
      response.statusText
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error del servidor:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });

      throw new Error(errorData.mensaje || `Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Estadísticas recibidas correctamente');

    return data.data;
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    throw error;
  }
};

// ==================== INTERACCIONES ====================

export const incrementarVisitas = async (id) => {
  try {
    const res = await fetch(
      `${API_URL}/api/recursos-informativos/${id}/visitas`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Error response:', errorData);
      throw new Error(
        errorData.message || errorData.error || 'Error al incrementar visitas'
      );
    }

    return await res.json();
  } catch (error) {
    console.error('Error en incrementarVisitas:', error);
    throw error;
  }
};

export const incrementarDescargas = async (id) => {
  try {
    const res = await fetch(
      `${API_URL}/api/recursos-informativos/${id}/descargas`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detalles ||
          errorData.mensaje ||
          'Error al incrementar descargas'
      );
    }

    return await res.json();
  } catch (error) {
    console.error('Error en incrementarDescargas:', error);
    throw error;
  }
};

export const incrementarCompartidos = async (id) => {
  try {
    const res = await fetch(
      `${API_URL}/api/recursos-informativos/${id}/compartidos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detalles ||
          errorData.mensaje ||
          'Error al incrementar compartidos'
      );
    }

    return await res.json();
  } catch (error) {
    console.error('Error en incrementarCompartidos:', error);
    throw error;
  }
};

// ==================== CALIFICACIONES (requiere token) ====================

export const calificarRecurso = async (id, calificacion, token) => {
  try {
    const res = await fetch(
      `${API_URL}/api/recursos-informativos/${id}/calificar`,
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
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detalles || errorData.mensaje || 'Error al calificar recurso'
      );
    }

    return await res.json();
  } catch (error) {
    console.error('Error en calificarRecurso:', error);
    throw error;
  }
};
