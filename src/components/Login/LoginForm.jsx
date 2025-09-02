// src/components/LoginForm.jsx
import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';

import Logo from '../../assets/Logo.png';
import {
  sanitizeInput,
  validateEmail,
  validatePassword,
} from '../../utils/validators';
import { colors, styles } from '../../utils/stylesLogin';

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

    return (
      <div className="h-100 d-flex flex-column justify-content-center px-3 py-2">
        {/* Header */}
        <div className="text-center mb-3">
          <div className="d-flex justify-content-center align-items-center mb-2">
            <img src={Logo} alt="SafeHaven Logo" style={styles.logo} />
          </div>
          <h2 className="fw-bold mb-2" style={styles.title}>
            Iniciar Sesión
          </h2>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="flex-grow-1 d-flex flex-column"
        >
          {/* Email */}
          <div className="mb-3">
            <label
              htmlFor="email"
              className="form-label fw-semibold text-dark mb-2"
              style={{ fontSize: '0.9rem' }}
            >
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
                className="mt-1 small"
                style={{ color: colors.error, fontSize: '0.75rem' }}
              >
                Formato de email inválido
              </div>
            )}
          </div>

          {/* Contraseña */}
          <div className="mb-3">
            <label
              htmlFor="password"
              className="form-label fw-semibold text-dark mb-2"
              style={{ fontSize: '0.9rem' }}
            >
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
                className="mt-1 small"
                style={{ color: colors.error, fontSize: '0.75rem' }}
              >
                La contraseña debe tener al menos 8 caracteres, una mayúscula,
                una minúscula y un número
              </div>
            )}
          </div>

          {/* Mensajes de estado */}
          {success && (
            <div
              className="alert border-0 mb-2"
              style={{ ...styles.alert, ...styles.alertSuccess }}
            >
              {success}
            </div>
          )}
          {error && (
            <div
              className="alert border-0 mb-2"
              style={{ ...styles.alert, ...styles.alertError }}
            >
              {error}
            </div>
          )}
          {isFormLocked && (
            <div
              className="alert border-0 mb-2"
              style={{ ...styles.alert, ...styles.alertWarning }}
            >
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
            {loading
              ? 'Iniciando sesión...'
              : isFormLocked
                ? 'Formulario Bloqueado'
                : 'Iniciar Sesión'}
          </button>

          {/* Footer */}
          <div className="text-center mt-auto">
            <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
              ¿No tienes una cuenta?{' '}
              <a
                href="/Register"
                className="fw-semibold"
                style={{ color: colors.primary }}
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

LoginForm.propTypes = {
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  error: PropTypes.string,
  success: PropTypes.string,
  loading: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  attempts: PropTypes.number,
  maxAttempts: PropTypes.number,
  lockoutTime: PropTypes.number,
};

export default LoginForm;
