// src/utils/localSurveyUtils.js
/**
 * Guardar respuestas en localStorage para usuarios no autenticados
 */
export const saveResponseToLocalStorage = (surveyId, answers) => {
  try {
    const data = {
      answers,
      timestamp: new Date().toISOString(),
      surveyId,
      version: '1.0',
    };
    localStorage.setItem(`survey_${surveyId}`, JSON.stringify(data));
    console.log('Respuestas guardadas en localStorage');
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

/**
 * Obtener respuestas desde localStorage
 */
export const getResponseFromLocalStorage = (surveyId) => {
  try {
    const saved = localStorage.getItem(`survey_${surveyId}`);
    if (!saved) return null;

    const data = JSON.parse(saved);
    // Verificar que sea la misma encuesta y versión compatible
    if (data.surveyId === surveyId && data.version === '1.0') {
      console.log('Respuestas recuperadas de localStorage');
      return data.answers;
    }
    return null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

/**
 * Limpiar respuestas de localStorage
 */
export const clearLocalSurvey = (surveyId) => {
  try {
    localStorage.removeItem(`survey_${surveyId}`);
    console.log('Respuestas locales eliminadas');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Verificar si hay respuestas guardadas localmente
 */
export const hasLocalProgress = (surveyId) => {
  return !!getResponseFromLocalStorage(surveyId);
};
