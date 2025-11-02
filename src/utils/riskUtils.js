
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaExclamationCircle,
} from 'react-icons/fa';

/**
 * Normaliza el string de nivel para comparaciones (trim + lowercase).
 * Acepta variantes en inglés/español.
 * @param {string|undefined|null} nivel
 * @returns {'crítico'|'alto'|'medio'|'bajo'|'desconocido'}
 */
const normalizeLevel = (nivel) => {
  if (!nivel || typeof nivel !== 'string') return 'desconocido';
  const n = nivel.trim().toLowerCase();
  if (['crítico', 'critico', 'critical'].includes(n)) return 'crítico';
  if (['alto', 'high'].includes(n)) return 'alto';
  if (['medio', 'medium'].includes(n)) return 'medio';
  if (['bajo', 'low'].includes(n)) return 'bajo';
  return 'desconocido';
};

const BADGE_MAP = {
  'crítico': 'bg-danger text-white',
  'alto': 'bg-warning text-dark',
  'medio': 'bg-info text-dark',
  'bajo': 'bg-success text-white',
  'desconocido': 'bg-secondary text-white',
};

const BACKGROUND_MAP = {
  'crítico': '#FFD6D6',
  'alto': '#FFE5B4',
  'medio': '#FFF4B2',
  'bajo': '#D6FFD6',
  'desconocido': '#F0F0F0',
};

const ICON_MAP = {
  'crítico': FaExclamationTriangle,
  'alto': FaExclamationCircle,
  'medio': FaExclamationCircle,
  'bajo': FaCheckCircle,
  'desconocido': null,
};

const TIP_MAP = {
  'crítico': 'Recomendación: Busca ayuda profesional cuanto antes.',
  'alto': 'Recomendación: Presta atención a tus resultados y considera acciones de mejora.',
  'medio': 'Recomendación: Mantente alerta y sigue trabajando en tu desarrollo.',
  'bajo': 'Recomendación: ¡Excelente! Mantén tus buenos hábitos.',
  'desconocido': '',
};

/**
 * Devuelve la clase de badge CSS según el nivel.
 * @param {string} nivel
 * @returns {string}
 */
export const getBadgeColor = (nivel) => BADGE_MAP[normalizeLevel(nivel)];

/**
 * Devuelve el color de fondo (hex) según el nivel.
 * @param {string} nivel
 * @returns {string}
 */
export const getBackgroundColor = (nivel) => BACKGROUND_MAP[normalizeLevel(nivel)];

/**
 * Devuelve el componente icono correspondiente al nivel (react-icon) o null.
 * @param {string} nivel
 * @returns {React.ComponentType|null}
 */
export const getIconRiesgo = (nivel) => ICON_MAP[normalizeLevel(nivel)];

/**
 * Mensaje de recomendación/tooltip según nivel.
 * @param {string} nivel
 * @returns {string}
 */
export const getTip = (nivel) => TIP_MAP[normalizeLevel(nivel)];
