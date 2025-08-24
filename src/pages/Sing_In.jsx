import React, { useState, useCallback, useRef, useMemo, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import background from '../assets/FondoLogin.png';
import Logo from '../assets/Logo.png';

import { iniciarSesion } from '../services/api';

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

// Estilos optimizados para viewport
const styles = {
  logo: {
    height: 50, // Reducido de 80 a 50
    width: 'auto',
    borderRadius: 8,
  },
  title: {
    fontSize: '1.8rem', // Reducido de 2.5rem
    fontWeight: 700,
    color: colors.primary,
  },
  input: {
    borderRadius: '8px', // Reducido de 12px
    border: `2px solid ${colors.primary}`,
    padding: '10px 14px', // Reducido de 16px 20px
    fontSize: '0.9rem', // Reducido de 1rem
    backgroundColor: colors.white,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
  },
  inputFocus: {
    borderColor: colors.primaryHover,
    boxShadow: '0 3px 8px rgba(34, 197, 94, 0.15)',
  },
  button: {
    backgroundColor: colors.primary,
    border: 'none',
    boxShadow: '0 3px 8px rgba(34, 197, 94, 0.2)',
    fontSize: '0.95rem', // Reducido de 1.1rem
    borderRadius: '8px',
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
    fontSize: '0.85rem', // Reducido de 1rem
    borderRadius: '6px',
    padding: '8px 12px', // Reducido de 12px 16px
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
    padding: '24px', // Reducido de 40px
  },
  welcomeTitle: {
    color: colors.white,
    fontSize: '2rem', // Reducido de 2.5rem
    fontWeight: 700,
  },
  welcomeText: {
    color: colors.white,
    fontSize: '0.95rem', // Reducido de 1.1rem
    lineHeight: 1.5,
  },
  featureIcon: {
    width: '44px', // Reducido de 60px
    height: '44px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    height: '100vh',
    width: '100%',
    backgroundColor: colors.lightGray,
    boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.08)',
    borderRadius: '0 0 0 0.8rem',
    overflow: 'hidden', // Previene scroll interno
  },
};

// Componente del formulario de login
const LoginForm = React.memo(
  ({
    email,
    setEmail,
    password,
    setPassword,
    error,
    success,
    loading,
    handleSubmit,
    attempts,
    maxAttempts,
    lockoutTime,
  }) => {
    const [focusedField, setFocusedField] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleEmailChange = useCallback(
      (e) => {
        const sanitizedValue = sanitizeInput(e.target.value);
        setEmail(sanitizedValue);
      },
      [setEmail]
    );

    const handlePasswordChange = useCallback(
      (e) => {
        const sanitizedValue = sanitizeInput(e.target.value);
        setPassword(sanitizedValue);
      },
      [setPassword]
    );

    const isFormLocked = useMemo(
      () => attempts >= maxAttempts && lockoutTime > Date.now(),
      [attempts, maxAttempts, lockoutTime]
    );

    const emailValidation = useMemo(
      () => email && !validateEmail(email),
      [email]
    );

    const passwordValidation = useMemo(
      () => password && !validatePassword(password),
      [password]
    );

    const handleRecoveryClick = useCallback((e) => {
      e.preventDefault();
      alert('Funcionalidad de recuperación de contraseña en desarrollo');
    }, []);

    const handleRegisterClick = useCallback((e) => {
      e.preventDefault();
      alert('Funcionalidad de registro en desarrollo');
    }, []);

    return (
      <div className="h-100 d-flex flex-column justify-content-center px-3 py-2">
        {/* Header del formulario - Más compacto */}
        <div className="text-center mb-3">
          <div className="d-flex justify-content-center align-items-center mb-2">
            <img src={Logo} alt="SafeHaven Logo" style={styles.logo} />
          </div>
          <h2 className="fw-bold mb-2" style={styles.title}>
            Iniciar Sesión
          </h2>
        </div>

        {/* Formulario con espaciado reducido */}
        <form
          onSubmit={handleSubmit}
          className="flex-grow-1 d-flex flex-column"
        >
          {/* Campo de email */}
          <div className="mb-3">
            <label
              htmlFor="email"
              className="form-label fw-semibold text-dark mb-2 d-flex align-items-center"
              style={{ fontSize: '0.9rem' }}
            >
              <i
                className="fas fa-envelope me-2"
                style={{ color: colors.primary, fontSize: '0.8rem' }}
              ></i>
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              className="form-control border-0"
              style={{
                ...styles.input,
                ...(focusedField === 'email' ? styles.inputFocus : {}),
              }}
              value={email}
              onChange={handleEmailChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="tu@correo.com"
              disabled={loading || isFormLocked}
              required
              maxLength={254}
              autoComplete="email"
            />
            {emailValidation && (
              <div
                className="mt-1 small d-flex align-items-center"
                style={{ color: colors.error, fontSize: '0.75rem' }}
              >
                <i className="fas fa-exclamation-circle me-1"></i>
                Formato de email inválido
              </div>
            )}
          </div>

          {/* Campo de contraseña */}
          <div className="mb-3">
            <label
              htmlFor="password"
              className="form-label fw-semibold text-dark mb-2 d-flex align-items-center"
              style={{ fontSize: '0.9rem' }}
            >
              <i
                className="fas fa-lock me-2"
                style={{ color: colors.primary, fontSize: '0.8rem' }}
              ></i>
              Contraseña
            </label>
            <div className="position-relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-control border-0 pe-5"
                style={{
                  ...styles.input,
                  ...(focusedField === 'password' ? styles.inputFocus : {}),
                }}
                value={password}
                onChange={handlePasswordChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Contraseña"
                disabled={loading || isFormLocked}
                required
                minLength={8}
                maxLength={128}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-2"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: colors.secondary, fontSize: '0.8rem' }}
              >
                <i
                  className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}
                ></i>
              </button>
            </div>
            {passwordValidation && (
              <div
                className="mt-1 small d-flex align-items-center"
                style={{ color: colors.error, fontSize: '0.75rem' }}
              >
                <i className="fas fa-exclamation-circle me-1"></i>
                La contraseña debe tener al menos 8 caracteres, una mayúscula,
                una minúscula y un número
              </div>
            )}
          </div>

          {/* Opciones adicionales - Más compactas */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="form-check">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="form-check-input"
                style={{ borderRadius: '3px' }}
                disabled={isFormLocked}
              />
              <label
                htmlFor="remember-me"
                className="form-check-label text-muted ms-1"
                style={{ fontSize: '0.85rem' }}
              >
                Recordarme
              </label>
            </div>
            <a
              href="#"
              className="text-decoration-none fw-semibold"
              style={{
                fontSize: '0.85rem',
                color: colors.primary,
              }}
              onClick={handleRecoveryClick}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Mensajes de estado */}
          {success && (
            <div
              className="alert border-0 mb-2"
              style={{ ...styles.alert, ...styles.alertSuccess }}
              role="alert"
            >
              <i className="fas fa-check-circle me-1"></i>
              {success}
            </div>
          )}

          {error && (
            <div
              className="alert border-0 mb-2"
              style={{ ...styles.alert, ...styles.alertError }}
              role="alert"
            >
              <i className="fas fa-exclamation-triangle me-1"></i>
              {error}
            </div>
          )}

          {isFormLocked && (
            <div
              className="alert border-0 mb-2"
              style={{ ...styles.alert, ...styles.alertWarning }}
              role="alert"
            >
              <i className="fas fa-lock me-1"></i>
              Demasiados intentos fallidos. Intenta nuevamente en{' '}
              {Math.ceil((lockoutTime - Date.now()) / 1000)} segundos.
            </div>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            className="btn w-100 fw-semibold py-2 mb-3"
            style={{
              ...styles.button,
              ...(loading || isFormLocked ? styles.buttonDisabled : {}),
            }}
            disabled={
              loading ||
              isFormLocked ||
              !email ||
              !password ||
              !validateEmail(email) ||
              !validatePassword(password)
            }
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Iniciando sesión...
              </>
            ) : isFormLocked ? (
              <>
                <i className="fas fa-lock me-2"></i>
                Formulario Bloqueado
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt me-2"></i>
                Iniciar Sesión
              </>
            )}
          </button>

          {/* Footer del formulario */}
          <div className="text-center mt-auto">
            <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
              ¿No tienes una cuenta?{' '}
              <a
                href="#"
                className="fw-semibold text-decoration-none"
                style={{ color: colors.primary }}
                onClick={handleRegisterClick}
              >
                Regístrate aquí
              </a>
            </p>
          </div>
        </form>
      </div>
    );
  }
);

// Componente del texto de bienvenida - Optimizado
const WelcomeSection = React.memo(() => {
  return (
    <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center px-3">
      <div className="text-center" style={styles.welcomeSection}>
        <h1 className="fw-bold mb-3" style={styles.welcomeTitle}>
          ¡Bienvenido a SafeHaven!
        </h1>
        <p className="mb-3" style={styles.welcomeText}>
          Tu espacio seguro para encontrar apoyo, recursos y conexiones que te
          ayuden en tu bienestar mental.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <div className="text-center">
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-1"
              style={styles.featureIcon}
            >
              <i
                className="fas fa-heart text-white"
                style={{ fontSize: '1.1rem' }}
              ></i>
            </div>
            <small
              className="text-white fw-semibold"
              style={{ fontSize: '0.8rem' }}
            >
              Apoyo
            </small>
          </div>
          <div className="text-center">
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-1"
              style={styles.featureIcon}
            >
              <i
                className="fas fa-users text-white"
                style={{ fontSize: '1.1rem' }}
              ></i>
            </div>
            <small
              className="text-white fw-semibold"
              style={{ fontSize: '0.8rem' }}
            >
              Comunidad
            </small>
          </div>
          <div className="text-center">
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-1"
              style={styles.featureIcon}
            >
              <i
                className="fas fa-lightbulb text-white"
                style={{ fontSize: '1.1rem' }}
              ></i>
            </div>
            <small
              className="text-white fw-semibold"
              style={{ fontSize: '0.8rem' }}
            >
              Recursos
            </small>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const maxAttempts = 5;
  const lockoutDuration = 5 * 60 * 1000;

  const cleanupTimeoutRef = useRef(null);

  const isFormValid = useMemo(
    () =>
      email && password && validateEmail(email) && validatePassword(password),
    [email, password]
  );

  React.useEffect(() => {
    if (lockoutTime > 0) {
      cleanupTimeoutRef.current = setTimeout(() => {
        setAttempts(0);
        setLockoutTime(0);
        setError(null);
      }, lockoutTime - Date.now());
    }

    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, [lockoutTime]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!isFormValid) {
        setError('Por favor completa todos los campos correctamente.');
        return;
      }

      if (attempts >= maxAttempts && lockoutTime > Date.now()) {
        setError('Demasiados intentos fallidos. Intenta nuevamente más tarde.');
        return;
      }

      setError(null);
      setSuccess(null);
      setLoading(true);

      try {
        const data = await iniciarSesion({
          correo: sanitizeInput(email),
          contraseña: sanitizeInput(password),
        });

        if (data.accessToken) {
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          setSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
          setAttempts(0);
          setLockoutTime(0);
          setError(null);

          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1500);
        } else {
          console.error('Token no encontrado en la respuesta');
          setError('Error en la respuesta del servidor. Intenta de nuevo.');
        }
      } catch (error) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (
          error.message.includes('Autenticación fallida') ||
          error.message.includes('Credenciales')
        ) {
          if (newAttempts >= maxAttempts) {
            setLockoutTime(Date.now() + lockoutDuration);
            setError(
              'Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente.'
            );
          } else {
            setError(
              `Credenciales incorrectas. Intento ${newAttempts} de ${maxAttempts}.`
            );
          }
        } else {
          setError(
            error.message || 'Error al iniciar sesión. Intenta de nuevo.'
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [
      email,
      password,
      attempts,
      lockoutTime,
      maxAttempts,
      lockoutDuration,
      isFormValid,
      navigate,
    ]
  );

  React.useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  const memoizedLoginForm = useMemo(
    () => (
      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={error}
        success={success}
        loading={loading}
        handleSubmit={handleSubmit}
        attempts={attempts}
        maxAttempts={maxAttempts}
        lockoutTime={lockoutTime}
      />
    ),
    [
      email,
      password,
      error,
      success,
      loading,
      handleSubmit,
      attempts,
      maxAttempts,
      lockoutTime,
    ]
  );

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden', // Previene scroll en el contenedor principal
        margin: 0,
        padding: 0,
      }}
    >
      {/* Overlay */}
      <div
        className="position-absolute w-100 h-100"
        style={{
          top: 0,
          left: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1,
        }}
      ></div>

      {/* Contenedor principal - Sin overflow */}
      <div
        className="container-fluid position-relative p-0 h-100"
        style={{ zIndex: 2, maxHeight: '100vh' }}
      >
        <div className="row justify-content-between align-items-stretch h-100 g-0">
          {/* Panel izquierdo - Mensaje de bienvenida */}
          <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center">
            <WelcomeSection />
          </div>

          {/* Panel derecho - Formulario de login */}
          <div className="col-lg-5 col-xl-4 p-0 h-100">
            <div className="p-3" style={styles.formContainer}>
              <Suspense
                fallback={
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                }
              >
                {memoizedLoginForm}
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
