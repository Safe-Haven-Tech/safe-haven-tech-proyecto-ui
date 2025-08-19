import React, { useState, useCallback, useRef, useMemo, Suspense } from 'react';
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

// Estilos estáticos 
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
  alertWarning: {
    backgroundColor: '#fffbeb',
    color: colors.warning,
    border: `1px solid #fde68a`,
  },
  welcomeSection: {
    backgroundColor: 'rgba(64, 64, 64, 0.8)',
    borderRadius: '16px',
    padding: '40px',
  },
  welcomeTitle: {
    color: colors.white,
    fontSize: '2.5rem',
    fontWeight: 800,
  },
  welcomeText: {
    color: colors.white,
    fontSize: '1.1rem',
    lineHeight: 1.6,
  },
  featureIcon: {
    width: '60px',
    height: '60px',
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
    boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.1)',
    borderRadius: '0 0 0 1rem',
  },
};

// Componente del formulario de login 
const LoginForm = React.memo(({
  email,
  setEmail,
  password,
  setPassword,
  error,
  loading,
  handleSubmit,
  attempts,
  maxAttempts,
  lockoutTime,
}) => {
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = useCallback((e) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    setEmail(sanitizedValue);
  }, [setEmail]);

  const handlePasswordChange = useCallback((e) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    setPassword(sanitizedValue);
  }, [setPassword]);

  const isFormLocked = useMemo(() => 
    attempts >= maxAttempts && lockoutTime > Date.now(), 
    [attempts, maxAttempts, lockoutTime]
  );

  const emailValidation = useMemo(() => 
    email && !validateEmail(email), 
    [email]
  );

  const passwordValidation = useMemo(() => 
    password && !validatePassword(password), 
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
    <div className="w-100 h-100 d-flex flex-column justify-content-center px-4">
      {/* Header del formulario */}
      <div className="text-center mb-5">
        <div className="d-flex justify-content-center align-items-center mb-4">
          <img
            src={Logo}
            alt="SafeHaven Logo"
            style={styles.logo}
          />
        </div>
        <h2 className="fw-bold mb-3" style={styles.title}>
          Iniciar Sesión
        </h2>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="mb-4">
        {/* Campo de email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="form-label fw-semibold text-dark mb-3 d-flex align-items-center"
            style={{ fontSize: '1.1rem' }}
          >
            <i className="fas fa-envelope me-2" style={{ color: colors.primary }}></i>
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            className="form-control form-control-lg border-0"
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
              className="mt-2 small d-flex align-items-center"
              style={{ color: colors.error }}
            >
              <i className="fas fa-exclamation-circle me-2"></i>
              Formato de email inválido
            </div>
          )}
        </div>

        {/* Campo de contraseña */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="form-label fw-semibold text-dark mb-3 d-flex align-items-center"
            style={{ fontSize: '1.1rem' }}
          >
            <i className="fas fa-lock me-2" style={{ color: colors.primary }}></i>
            Contraseña
          </label>
          <div className="position-relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="form-control form-control-lg border-0 pe-5"
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
              className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3"
              onClick={() => setShowPassword(!showPassword)}
              style={{ color: colors.secondary }}
            >
              <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
            </button>
          </div>
          {passwordValidation && (
            <div 
              className="mt-2 small d-flex align-items-center"
              style={{ color: colors.error }}
            >
              <i className="fas fa-exclamation-circle me-2"></i>
              La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número
            </div>
          )}
        </div>

        {/* Opciones adicionales */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div className="form-check">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="form-check-input"
              style={{ borderRadius: '4px' }}
              disabled={isFormLocked}
            />
            <label
              htmlFor="remember-me"
              className="form-check-label text-muted ms-2"
              style={{ fontSize: '1rem' }}
            >
              Recordarme
            </label>
          </div>
          <a
            href="#"
            className="text-decoration-none fw-semibold"
            style={{ 
              fontSize: '1rem',
              color: colors.primary,
            }}
            onClick={handleRecoveryClick}
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div
            className="alert border-0 mb-4"
            style={{ ...styles.alert, ...styles.alertError }}
            role="alert"
          >
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Mensaje de bloqueo por intentos fallidos */}
        {isFormLocked && (
          <div
            className="alert border-0 mb-4"
            style={{ ...styles.alert, ...styles.alertWarning }}
            role="alert"
          >
            <i className="fas fa-lock me-2"></i>
            Demasiados intentos fallidos. Intenta nuevamente en {Math.ceil((lockoutTime - Date.now()) / 1000)} segundos.
          </div>
        )}

        {/* Botón de envío */}
        <button
          type="submit"
          className="btn btn-lg w-100 fw-semibold py-3 mb-4"
          style={{
            ...styles.button,
            ...(loading || isFormLocked ? styles.buttonDisabled : {}),
          }}
          disabled={loading || isFormLocked || !email || !password || !validateEmail(email) || !validatePassword(password)}
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
      </form>

      {/* Footer del formulario */}
      <div className="text-center mt-auto">
        <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>
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
    </div>
  );
});

// Componente del texto de bienvenida 
const WelcomeSection = React.memo(() => {
  return (
    <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center">
      <div
        className="text-center px-4 py-5"
        style={styles.welcomeSection}
      >
        <h1
          className="display-6 fw-bold mb-3"
          style={styles.welcomeTitle}
        >
          ¡Bienvenido a SafeHaven!
        </h1>
        <p
          className="lead mb-4"
          style={styles.welcomeText}
        >
          Tu espacio seguro para encontrar apoyo, recursos y conexiones que te
          ayuden en tu bienestar mental.
        </p>
        <div className="d-flex justify-content-center gap-4">
          <div className="text-center">
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-2"
              style={styles.featureIcon}
            >
              <i
                className="fas fa-heart text-white"
                style={{ fontSize: '1.5rem' }}
              ></i>
            </div>
            <small className="text-white fw-semibold">
              Apoyo
            </small>
          </div>
          <div className="text-center">
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-2"
              style={styles.featureIcon}
            >
              <i
                className="fas fa-users text-white"
                style={{ fontSize: '1.5rem' }}
              ></i>
            </div>
            <small className="text-white fw-semibold">
              Comunidad
            </small>
          </div>
          <div className="text-center">
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-2"
              style={styles.featureIcon}
            >
              <i
                className="fas fa-lightbulb text-white"
                style={{ fontSize: '1.5rem' }}
              ></i>
            </div>
            <small className="text-white fw-semibold">
              Recursos
            </small>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const maxAttempts = 5;
  const lockoutDuration = 5 * 60 * 1000;
  
  const cleanupTimeoutRef = useRef(null);

  const isFormValid = useMemo(() => 
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

const handleSubmit = useCallback(async (e) => {
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
  setLoading(true);

  try {
    // Usa la función centralizada
    const data = await iniciarSesion({
      correo: sanitizeInput(email),
      contraseña: sanitizeInput(password),
    });



    // Guardar JWT en localStorage
    if (data.accessToken) {
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      console.log('Token guardado exitosamente');
    } else {
      console.error('Token no encontrado en la respuesta');
    }



    setAttempts(0);
    setLockoutTime(0);
    setError(null);
    //  agregar lógica de redirección y manejo de estado global
  } catch (error) {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (error.message.includes('Autenticación fallida') || error.message.includes('Credenciales')) {
      if (newAttempts >= maxAttempts) {
        setLockoutTime(Date.now() + lockoutDuration);
        setError('Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente.');
      } else {
        setError(`Credenciales incorrectas. Intento ${newAttempts} de ${maxAttempts}.`);
      }
    } else {
      setError(error.message || 'Error al iniciar sesión. Intenta de nuevo.');
    }
  } finally {
    setLoading(false);
  }
}, [email, password, attempts, lockoutTime, maxAttempts, lockoutDuration, isFormValid]);

  React.useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  const memoizedLoginForm = useMemo(() => (
    <LoginForm
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      error={error}
      loading={loading}
      handleSubmit={handleSubmit}
      attempts={attempts}
      maxAttempts={maxAttempts}
      lockoutTime={lockoutTime}
    />
  ), [email, password, error, loading, handleSubmit, attempts, maxAttempts, lockoutTime]);

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center w-100"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        width: '100vw',
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

      {/* Contenedor principal */}
      <div
        className="container-fluid position-relative p-0"
        style={{ zIndex: 2 }}
      >
        <div className="row justify-content-between align-items-center min-vh-100 g-0">
          {/* Panel izquierdo - Mensaje de bienvenida */}
          <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center">
            <WelcomeSection />
          </div>

          {/* Panel derecho - Formulario de login */}
          <div className="col-lg-5 col-xl-4 p-0">
            <div
              className="p-5"
              style={styles.formContainer}
            >
              <Suspense fallback={
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              }>
                {memoizedLoginForm}


              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
