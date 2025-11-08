/**
 * Solicita al backend el PDF asociado a una respuesta de encuesta.
 *
 * Comportamiento:
 * - Devuelve un Blob con el contenido del PDF en caso de éxito.
 * - Lanza Error con mensaje conciso en caso de fallo.
 *
 * @param {{_id:string}} respuesta - Objeto de respuesta (debe contener _id).
 * @param {string|null} token - Token JWT (opcional; si no se suministra se intenta leer desde localStorage).
 * @returns {Promise<Blob>}
 * @throws {Error}
 */
export const generarPDFEncuesta = async (respuesta, token = null) => {
  const API_URL = import.meta.env.VITE_API_URL || '';

  if (!respuesta || !respuesta._id) {
    throw new Error('ID de respuesta requerido');
  }

  const id = encodeURIComponent(String(respuesta._id).trim());
  const authToken = token ?? localStorage.getItem('token');
  const headers = {};

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const res = await fetch(`${API_URL}/api/encuestas/respuestas/${id}/pdf`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      // Intentar extraer detalle del body para mensaje más útil
      let detalle = 'Error generando PDF';
      try {
        const json = await res.json();
        detalle = json?.mensaje || json?.error || detalle;
      } catch {
        // Ignorar parseo si no es JSON
      }
      throw new Error(detalle);
    }

    return await res.blob();
  } catch (error) {
    console.error('generarPDFEncuesta error:', error.message || error);
    throw error;
  }
};
