import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './LoginForm.module.css';
import Logo from '../../assets/Logo.png';
import {
  sanitizeInput,
  validateEmail,
  validatePassword,
} from '../../utils/validators';

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
      <div className={styles.loginFormContainer}>
        {/* Header */}
        <div className={styles.formHeader}>
          <div className={styles.logoContainer}>
            <img src={Logo} alt="SafeHaven Logo" className={styles.logo} />
          </div>
          <h2 className={styles.formTitle}>
            Iniciar Sesión
          </h2>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className={styles.loginForm}
        >
          {/* Email */}
          <div className={styles.inputGroup}>
            <label
              htmlFor="email"
              className={styles.inputLabel}
            >
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              className={styles.formInput}
              value={email}
              onChange={handleEmailChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="tu@correo.com"
              disabled={loading || isFormLocked}
              required
              maxLength={254}
              autoComplete="email"
              aria-describedby={emailValidation ? "email-error" : undefined}
            />
            {emailValidation && (
              <div
                id="email-error"
                className={`${styles.validationMessage} ${styles.errorMessage}`}
                role="alert"
              >
                Formato de email inválido
              </div>
            )}
          </div>

          {/* Contraseña */}
          <div className={styles.inputGroup}>
            <label
              htmlFor="password"
              className={styles.inputLabel}
            >
              Contraseña
            </label>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className={`${styles.formInput} ${styles.inputWithButton}`}
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
                aria-describedby={passwordValidation ? "password-error" : undefined}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                tabIndex={0}
              >
                <i
                  className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}
                  aria-hidden="true"
                ></i>
              </button>
            </div>
            {passwordValidation && (
              <div
                id="password-error"
                className={`${styles.validationMessage} ${styles.errorMessage}`}
                role="alert"
              >
                La contraseña debe tener al menos 8 caracteres, una mayúscula,
                una minúscula y un número
              </div>
            )}
          </div>

          {/* Mensajes de estado */}
          {success && (
            <div
              className={`${styles.alert} ${styles.alertSuccess}`}
              role="alert"
              aria-live="polite"
            >
              {success}
            </div>
          )}
          {error && (
            <div
              className={`${styles.alert} ${styles.alertError}`}
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}
          {isFormLocked && (
            <div
              className={`${styles.alert} ${styles.alertWarning}`}
              role="alert"
              aria-live="assertive"
            >
              Demasiados intentos fallidos. Intenta nuevamente en{' '}
              {Math.ceil((lockoutTime - Date.now()) / 1000)} segundos.
            </div>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={
              loading ||
              isFormLocked ||
              !email ||
              !password ||
              !validateEmail(email) ||
              !validatePassword(password)
            }
            aria-describedby="submit-status"
          >
            <span>
              {loading
                ? 'Iniciando sesión...'
                : isFormLocked
                  ? 'Formulario Bloqueado'
                  : 'Iniciar Sesión'}
            </span>
          </button>

          {/* Footer */}
          <div className={styles.formFooter}>
            <p className={styles.footerText}>
              ¿No tienes una cuenta?{' '}
              <a
                href="/Register"
                className={styles.footerLink}
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