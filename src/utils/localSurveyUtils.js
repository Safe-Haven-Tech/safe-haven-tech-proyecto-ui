/**
 * Utilidades para guardar/recuperar progreso de encuestas en localStorage.
 * - Mantiene compatibilidad con la API anterior (getResponseFromLocalStorage devuelve sólo `answers`).
 * - Validaciones tempranas y manejo robusto de errores.
 * - Logs concisos para depuración local.
 */

const STORAGE_PREFIX = 'survey_';
const CURRENT_VERSION = '1.0';

const buildKey = (surveyId) => `${STORAGE_PREFIX}${surveyId}`;

const isLocalStorageAvailable = () => {
  try {
    const key = '__lh_test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

/**
 * Guardar respuestas en localStorage para usuarios no autenticados.
 * @param {string} surveyId
 * @param {any} answers
 * @returns {boolean} true si se guardó correctamente
 */
export const saveResponseToLocalStorage = (surveyId, answers) => {
  if (!surveyId) return false;
  if (!isLocalStorageAvailable()) {
    // eslint-disable-next-line no-console
    console.error('localStorage no disponible');
    return false;
  }

  try {
    const data = {
      answers,
      timestamp: new Date().toISOString(),
      surveyId,
      version: CURRENT_VERSION,
    };
    localStorage.setItem(buildKey(surveyId), JSON.stringify(data));
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error saving survey:', error?.message || error);
    return false;
  }
};

/**
 * Obtener respuestas desde localStorage.
 * Devuelve sólo el objeto `answers` (compatibilidad con implementación previa).
 * @param {string} surveyId
 * @returns {any|null}
 */
export const getResponseFromLocalStorage = (surveyId) => {
  if (!surveyId) return null;
  if (!isLocalStorageAvailable()) return null;

  try {
    const raw = localStorage.getItem(buildKey(surveyId));
    if (!raw) return null;

    const data = JSON.parse(raw);
    // Validar compatibilidad de versión y id
    if (data?.surveyId === surveyId && data?.version === CURRENT_VERSION) {
      return data.answers ?? null;
    }

    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error reading survey from localStorage:', error?.message || error);
    return null;
  }
};

/**
 * Limpiar respuestas de localStorage
 * @param {string} surveyId
 */
export const clearLocalSurvey = (surveyId) => {
  if (!surveyId) return;
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.removeItem(buildKey(surveyId));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error clearing survey from localStorage:', error?.message || error);
  }
};

/**
 * Verificar si hay respuestas guardadas localmente
 * @param {string} surveyId
 * @returns {boolean}
 */
export const hasLocalProgress = (surveyId) => {
  return Boolean(getResponseFromLocalStorage(surveyId));
};
