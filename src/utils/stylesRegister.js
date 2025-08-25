// src/utils/stylesRegister.js
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

export const styles = {
  logo: { height: 80, width: 'auto', borderRadius: 12 },
  title: { fontSize: '2.5rem', fontWeight: 800, color: colors.primary },
  input: {
    borderRadius: '12px',
    border: `2px solid ${colors.primary}`,
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
    border: 'none',
    boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
    fontSize: '1.1rem',
    borderRadius: '12px',
    fontWeight: 600,
    color: colors.white,
  },
  buttonHover: { backgroundColor: colors.primaryHover },
  buttonDisabled: { backgroundColor: colors.secondary, cursor: 'not-allowed' },
  alert: { fontSize: '1rem', borderRadius: '8px', padding: '12px 16px' },
  alertError: {
    backgroundColor: '#fef2f2',
    color: colors.error,
    border: `1px solid #fecaca`,
  },
  alertSuccess: {
    backgroundColor: '#f0fdf4',
    color: colors.success,
    border: `1px solid #bbf7d0`,
  },
  formContainer: {
    backgroundColor: 'rgba(248,250,252,0.95)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    borderRadius: '20px',
    padding: '40px',
    border: '1px solid rgba(255,255,255,0.2)',
    maxWidth: '500px',
    width: '100%',
  },
};
