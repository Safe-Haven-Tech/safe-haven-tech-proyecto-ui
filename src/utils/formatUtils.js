/**
 * Utilidades para formatear datos del sistema
 */

/**
 * Mapeo de categorías a nombres amigables
 */
export const categoriasMap = {
  'salud_mental': 'Salud Mental',
  'bienestar': 'Bienestar',
  'estres': 'Estrés',
  'ansiedad': 'Ansiedad',
  'depresion': 'Depresión',
  'otro': 'Otro'
};

/**
 * Formatea una categoría para mostrar al usuario
 * @param {string} categoria - Categoría en formato técnico (ej: "salud_mental")
 * @returns {string} Categoría formateada (ej: "Salud Mental")
 */
export const formatearCategoria = (categoria) => {
  if (!categoria) return 'Sin categoría';
  return categoriasMap[categoria] || categoria.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

/**
 * Mapeo de niveles de riesgo a nombres amigables
 */
export const nivelesRiesgoMap = {
  'bajo': 'Bajo Riesgo',
  'medio': 'Riesgo Medio',
  'alto': 'Alto Riesgo',
  'crítico': 'Riesgo Crítico',
  'critico': 'Riesgo Crítico'
};

/**
 * Formatea un nivel de riesgo para mostrar al usuario
 * @param {string} nivel - Nivel en formato técnico (ej: "bajo")
 * @returns {string} Nivel formateado (ej: "Bajo Riesgo")
 */
export const formatearNivelRiesgo = (nivel) => {
  if (!nivel) return 'N/A';
  return nivelesRiesgoMap[nivel.toLowerCase()] || nivel.toUpperCase();
};

