/**
 * Tokens de color y estilos reutilizables para la pantalla de registro.
 * - Exporta `colors` y `styles` (retrocompatible).
 * - Provee `getStyles(overrides)` para obtener una versión customizable en runtime.
 */

export const colors = {
  primary: '#22c55e',
  primaryHover: '#16a34a',
  secondary: '#64748b',
  error: '#ef4444',
  success: '#22c55e',
  white: '#ffffff',
  lightGray: '#f8fafc',
  darkGray: '#334155',
};

const DEFAULT_BORDER_RADIUS = '12px';

export const styles = {
  logo: { height: 80, width: 'auto', borderRadius: DEFAULT_BORDER_RADIUS },
  title: { fontSize: '2.5rem', fontWeight: 800, color: colors.primary },
  input: {
    borderRadius: DEFAULT_BORDER_RADIUS,
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: colors.primary,
    padding: '16px 20px',
    fontSize: '1rem',
    backgroundColor: colors.white,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  inputFocus: {
    borderColor: colors.primaryHover,
    boxShadow: '0 4px 12px rgba(34,197,94,0.2)',
  },
  inputSuccess: {
    borderColor: colors.success,
    boxShadow: '0 4px 12px rgba(34,197,94,0.2)',
  },
  inputError: {
    borderColor: colors.error,
    boxShadow: '0 4px 12px rgba(239,68,68,0.2)',
  },
  button: {
    backgroundColor: colors.primary,
    borderWidth: '0px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
    fontSize: '1.1rem',
    borderRadius: DEFAULT_BORDER_RADIUS,
    fontWeight: 600,
    color: colors.white,
    padding: '12px 20px',
    cursor: 'pointer',
  },
  buttonHover: { backgroundColor: colors.primaryHover },
  buttonDisabled: {
    backgroundColor: colors.secondary,
    cursor: 'not-allowed',
    opacity: 0.9,
  },
  alert: { fontSize: '1rem', borderRadius: '8px', padding: '12px 16px' },
  alertError: {
    backgroundColor: '#fef2f2',
    color: colors.error,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#fecaca',
  },
  alertSuccess: {
    backgroundColor: '#f0fdf4',
    color: colors.success,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#bbf7d0',
  },
  formContainer: {
    backgroundColor: 'rgba(248,250,252,0.95)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    borderRadius: DEFAULT_BORDER_RADIUS,
    padding: '40px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(255,255,255,0.2)',
    maxWidth: '500px',
    width: '100%',
  },
};
