import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaExclamationCircle,
} from 'react-icons/fa';

export const getBadgeColor = (nivel) => {
  switch (nivel) {
    case 'crítico':
      return 'bg-danger text-white';
    case 'alto':
      return 'bg-warning text-dark';
    case 'medio':
      return 'bg-info text-dark';
    case 'bajo':
      return 'bg-success text-white';
    default:
      return 'bg-secondary text-white';
  }
};

export const getBackgroundColor = (nivel) => {
  switch (nivel) {
    case 'crítico':
      return '#FFD6D6';
    case 'alto':
      return '#FFE5B4';
    case 'medio':
      return '#FFF4B2';
    case 'bajo':
      return '#D6FFD6';
    default:
      return '#F0F0F0';
  }
};

export const getIconRiesgo = (nivel) => {
  switch (nivel) {
    case 'crítico':
      return FaExclamationTriangle;
    case 'alto':
    case 'medio':
      return FaExclamationCircle;
    case 'bajo':
      return FaCheckCircle;
    default:
      return null;
  }
};

export const getTip = (nivel) => {
  switch (nivel) {
    case 'crítico':
      return 'Recomendación: Busca ayuda profesional cuanto antes.';
    case 'alto':
      return 'Recomendación: Presta atención a tus resultados y considera acciones de mejora.';
    case 'medio':
      return 'Recomendación: Mantente alerta y sigue trabajando en tu desarrollo.';
    case 'bajo':
      return 'Recomendación: ¡Excelente! Mantén tus buenos hábitos.';
    default:
      return '';
  }
};
