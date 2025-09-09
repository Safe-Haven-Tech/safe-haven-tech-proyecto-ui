// src/services/pdfService.js

/**
 * Generar PDF de la encuesta usando Puppeteer (desde backend)
 * Aquí se hace la petición al backend para obtener el PDF
 */
export const generarPDFEncuesta = async (respuesta, token) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/encuestas/respuestas/${respuesta._id}/pdf`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error('Error generando PDF');

    const blob = await res.blob();
    return blob;
  } catch (error) {
    console.error('Error en generarPDFEncuesta:', error);
    throw error;
  }
};
