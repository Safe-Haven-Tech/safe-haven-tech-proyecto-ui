import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import background from '../assets/FondoRegister.png';
import Logo from '../assets/Logo.png';

import { registrarUsuario } from '../services/api';

// Utilidades de seguridad
const sanitizeInput = (input) => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/;
  return passwordRegex.test(password);
};

const validateName = (name) => {
  return name.length >= 2 && name.length <= 50;
};

// Sistema de colores
const colors = {
  primary: '#22c55e',
  primaryHover: '#16a34a',
  secondary: '#64748b',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#22c55e',
  white: '#ffffff',
  lightGray: '#f8fafc',
  darkGray: '#334155',
};

// Estilos estáticos optimizados para registro
const styles = {
  logo: {
    height: 80,
    width: 'auto',
    borderRadius: 12,
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: colors.primary,
  },
  input: {
    borderRadius: '12px',
    border: `2px solid ${colors.primary}`,
    padding: '16px 20px',
    fontSize: '1rem',
    backgroundColor: colors.white,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  inputFocus: {
    borderColor: colors.primaryHover,
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
  },
  button: {
    backgroundColor: colors.primary,
    border: 'none',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
    fontSize: '1.1rem',
    borderRadius: '12px',
    fontWeight: 600,
    color: colors.white,
  },
  buttonHover: {
    backgroundColor: colors.primaryHover,
  },
  buttonDisabled: {
    backgroundColor: colors.secondary,
    cursor: 'not-allowed',
  },
  alert: {
    fontSize: '1rem',
    borderRadius: '8px',
    padding: '12px 16px',
  },
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
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    borderRadius: '20px',
    padding: '40px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    maxWidth: '500px',
    width: '100%',
  },
};

// Componente del formulario de registro optimizado
const RegisterForm = React.memo(
  ({
    formData,
    setFormData,
    error,
    success,
    loading,
    handleSubmit,
    validationErrors,
  }) => {
    const [focusedField, setFocusedField] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleInputChange = useCallback(
      (e) => {
        const { name, value } = e.target;
        const sanitizedValue = sanitizeInput(value);
        setFormData((prev) => ({
          ...prev,
          [name]: sanitizedValue,
        }));
      },
      [setFormData]
    );

    const isFormValid = useMemo(
      () =>
        formData.nombre &&
        formData.email &&
        formData.password &&
        formData.confirmPassword &&
        validateName(formData.nombre) &&
        validateEmail(formData.email) &&
        validatePassword(formData.password) &&
        formData.password === formData.confirmPassword,
      [formData]
    );

    return (
      <div className="w-100">
        {/* Header del formulario */}
        <div className="text-center mb-4">
          <div className="d-flex justify-content-center align-items-center mb-3">
            <img src={Logo} alt="SafeHaven Logo" style={styles.logo} />
          </div>
          <h2 className="fw-bold mb-2" style={styles.title}>
            Crear Cuenta
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>
            Únete a nuestra comunidad de apoyo
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mb-3">
          {/* Campo de nombre */}
          <div className="mb-3">
            <label
              htmlFor="nombre"
              className="form-label fw-semibold text-dark mb-2 d-flex align-items-center"
              style={{ fontSize: '1rem' }}
            >
              <i
                className="fas fa-user me-2"
                style={{ color: colors.primary }}
              ></i>
              Nombre Completo
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              className="form-control form-control-lg border-0"
              style={{
                ...styles.input,
                ...(focusedField === 'nombre' ? styles.inputFocus : {}),
              }}
              value={formData.nombre}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('nombre')}
              onBlur={() => setFocusedField(null)}
              placeholder="Tu nombre completo"
              disabled={loading}
              required
              maxLength={50}
              autoComplete="name"
            />
            {validationErrors.nombre && (
              <div
                className="mt-2 small d-flex align-items-center"
                style={{ color: colors.error }}
              >
                <i className="fas fa-exclamation-circle me-2"></i>
                {validationErrors.nombre}
              </div>
            )}
          </div>

          {/* Campo de email */}
          <div className="mb-3">
            <label
              htmlFor="email"
              className="form-label fw-semibold text-dark mb-2 d-flex align-items-center"
              style={{ fontSize: '1rem' }}
            >
              <i
                className="fas fa-envelope me-2"
                style={{ color: colors.primary }}
              ></i>
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control form-control-lg border-0"
              style={{
                ...styles.input,
                ...(focusedField === 'email' ? styles.inputFocus : {}),
              }}
              value={formData.email}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="tu@correo.com"
              disabled={loading}
              required
              maxLength={254}
              autoComplete="email"
            />
            {validationErrors.email && (
              <div
                className="mt-2 small d-flex align-items-center"
                style={{ color: colors.error }}
              >
                <i className="fas fa-exclamation-circle me-2"></i>
                {validationErrors.email}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label
              htmlFor="fechaNacimiento"
              className="form-label fw-semibold text-dark mb-2 d-flex align-items-center"
              style={{ fontSize: '1rem' }}
            >
              <i
                className="fas fa-calendar-alt me-2"
                style={{ color: colors.primary }}
              ></i>
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              id="fechaNacimiento"
              name="fechaNacimiento"
              className="form-control form-control-lg border-0"
              style={{
                ...styles.input,
                ...(focusedField === 'fechaNacimiento'
                  ? styles.inputFocus
                  : {}),
              }}
              value={formData.fechaNacimiento}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('fechaNacimiento')}
              onBlur={() => setFocusedField(null)}
              disabled={loading}
              required
            />
          </div>

          {/* Campo de contraseña */}
          <div className="mb-3">
            <label
              htmlFor="password"
              className="form-label fw-semibold text-dark mb-2 d-flex align-items-center"
              style={{ fontSize: '1rem' }}
            >
              <i
                className="fas fa-lock me-2"
                style={{ color: colors.primary }}
              ></i>
              Contraseña
            </label>
            <div className="position-relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-control form-control-lg border-0 pe-5"
                style={{
                  ...styles.input,
                  ...(focusedField === 'password' ? styles.inputFocus : {}),
                }}
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Contraseña"
                disabled={loading}
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: colors.secondary }}
              >
                <i
                  className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}
                ></i>
              </button>
            </div>
            {validationErrors.password && (
              <div
                className="mt-2 small d-flex align-items-center"
                style={{ color: colors.error }}
              >
                <i className="fas fa-exclamation-circle me-2"></i>
                {validationErrors.password}
              </div>
            )}
          </div>

          {/* Campo de confirmar contraseña */}
          <div className="mb-3">
            <label
              htmlFor="confirmPassword"
              className="form-label fw-semibold text-dark mb-2 d-flex align-items-center"
              style={{ fontSize: '1rem' }}
            >
              <i
                className="fas fa-shield-alt me-2"
                style={{ color: colors.primary }}
              ></i>
              Confirmar Contraseña
            </label>
            <div className="position-relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className="form-control form-control-lg border-0 pe-5"
                style={{
                  ...styles.input,
                  ...(focusedField === 'confirmPassword'
                    ? styles.inputFocus
                    : {}),
                }}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                placeholder="Confirma tu contraseña"
                disabled={loading}
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ color: colors.secondary }}
              >
                <i
                  className={`fas fa-${showConfirmPassword ? 'eye-slash' : 'eye'}`}
                ></i>
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <div
                className="mt-2 small d-flex align-items-center"
                style={{ color: colors.error }}
              >
                <i className="fas fa-exclamation-circle me-2"></i>
                {validationErrors.confirmPassword}
              </div>
            )}
          </div>

          {/* Mensaje de error */}
          {error && (
            <div
              className="alert border-0 mb-3"
              style={{ ...styles.alert, ...styles.alertError }}
              role="alert"
            >
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Mensaje de éxito */}
          {success && (
            <div
              className="alert border-0 mb-3"
              style={{ ...styles.alert, ...styles.alertSuccess }}
              role="alert"
            >
              <i className="fas fa-check-circle me-2"></i>
              {success}
            </div>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            className="btn btn-lg w-100 fw-semibold py-3 mb-3"
            style={{
              ...styles.button,
              ...(loading || !isFormValid ? styles.buttonDisabled : {}),
            }}
            disabled={loading || !isFormValid}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Creando cuenta...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus me-2"></i>
                Crear Cuenta
              </>
            )}
          </button>
        </form>

        {/* Footer del formulario */}
        <div className="text-center">
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/"
              className="fw-semibold text-decoration-none"
              style={{ color: colors.primary }}
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    );
  }
);

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    fechaNacimiento: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.nombre || !validateName(formData.nombre)) {
      errors.nombre = 'El nombre debe tener entre 2 y 50 caracteres';
    }

    if (!formData.email || !validateEmail(formData.email)) {
      errors.email = 'Formato de email inválido';
    }

    if (!formData.password || !validatePassword(formData.password)) {
      errors.password =
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
    }

    if (
      !formData.confirmPassword ||
      formData.password !== formData.confirmPassword
    ) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        setError('Por favor corrige los errores en el formulario');
        return;
      }

      setError(null);
      setSuccess(null);
      setLoading(true);

      try {
        // Llama a la API real
        await registrarUsuario({
          correo: sanitizeInput(formData.email),
          contraseña: sanitizeInput(formData.password),
          nombreCompleto: sanitizeInput(formData.nombre),
          fechaNacimiento: formData.fechaNacimiento || '2000-01-01', // Ajusta según tu formulario
        });

        setSuccess('¡Cuenta creada exitosamente! Redirigiendo al login...');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } catch (error) {
        console.log(error);
        setError(
          error.message || 'Error al crear la cuenta. Inténtalo nuevamente.'
        );
      } finally {
        setLoading(false);
      }
    },
    [formData, validateForm]
  );

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center w-100 p-3"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#f0f0f0',
        minHeight: '100vh',
        width: '100vw',
        margin: 0,
      }}
    >
      {/* Overlay */}
      <div
        className="position-absolute w-100 h-100"
        style={{
          top: 0,
          left: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1,
        }}
      ></div>

      {/* Contenedor del formulario centrado */}
      <div
        className="position-relative"
        style={{ zIndex: 2, ...styles.formContainer }}
      >
        <RegisterForm
          formData={formData}
          setFormData={setFormData}
          error={error}
          success={success}
          loading={loading}
          handleSubmit={handleSubmit}
          validationErrors={validationErrors}
        />
      </div>
    </div>
  );
}
