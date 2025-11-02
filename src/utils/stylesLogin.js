/**
 * Tokens de color y estilos reutilizables para la pantalla de login.
 * - Exporta `colors` y `styles` (retrocompatible).
 * - Provee `getStyles(overrides)` para obtener una versión customizable en runtime.
 */

export const colors = {
  primary: '#22c55e',
  primaryHover: '#16a34a',
  secondary: '#64748b',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#22c55e',
  white: '#ffffff',
  lightGray: '#f8fafc',
  darkGray: '#334155',
  transparent: 'transparent',
};

const DEFAULT_BORDER_RADIUS = '8px';

export const styles = {
  logo: {
    height: 50,
    width: 'auto',
    borderRadius: DEFAULT_BORDER_RADIUS,
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: colors.primary,
  },
  input: {
    borderRadius: DEFAULT_BORDER_RADIUS,
    border: `2px solid ${colors.primary}`,
    padding: '10px 14px',
    fontSize: '0.9rem',
    backgroundColor: colors.white,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
    outline: 'none',
    transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
  },
  inputFocus: {
    borderColor: colors.primaryHover,
    boxShadow: '0 3px 8px rgba(34, 197, 94, 0.15)',
  },
  button: {
    backgroundColor: colors.primary,
    border: 'none',
    boxShadow: '0 3px 8px rgba(34, 197, 94, 0.2)',
    fontSize: '0.95rem',
    borderRadius: DEFAULT_BORDER_RADIUS,
    fontWeight: 600,
    color: colors.white,
    padding: '10px 16px',
    cursor: 'pointer',
  },
  buttonDisabled: {
    backgroundColor: colors.secondary,
    cursor: 'not-allowed',
    opacity: 0.85,
  },
  alert: {
    fontSize: '0.85rem',
    borderRadius: '6px',
    padding: '8px 12px',
  },
  alertError: {
    backgroundColor: '#fef2f2',
    color: colors.error,
    border: `1px solid #fecaca`,
  },
  alertWarning: {
    backgroundColor: '#fffbeb',
    color: colors.warning,
    border: `1px solid #fde68a`,
  },
  alertSuccess: {
    backgroundColor: '#f0fdf4',
    color: colors.success,
    border: `1px solid #bbf7d0`,
  },
  welcomeSection: {
    backgroundColor: 'rgba(64, 64, 64, 0.8)',
    borderRadius: '12px',
    padding: '24px',
  },
  welcomeTitle: {
    color: colors.white,
    fontSize: '2rem',
    fontWeight: 700,
  },
  welcomeText: {
    color: colors.white,
    fontSize: '0.95rem',
    lineHeight: 1.5,
  },
  featureIcon: {
    width: '44px',
    height: '44px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: colors.lightGray,
    boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.08)',
    borderRadius: `0 0 0 ${DEFAULT_BORDER_RADIUS}`,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
};

