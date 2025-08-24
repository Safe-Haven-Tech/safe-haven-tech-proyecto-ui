import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import background from '../assets/FondoRegister.png';
import Logo from '../assets/Logo.png';
import EnhancedDatePicker from '../components/datePicker';

import { registrarUsuario } from '../services/api';

// Constantes para límites
const LIMITES = {
  NICKNAME: { MIN: 5, MAX: 20 },
  NOMBRE: { MIN: 2, MAX: 50 },
  PASSWORD: { MIN: 8, MAX: 128 },
  EMAIL: { MAX: 254 },
};

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
  return emailRegex.test(email) && email.length <= LIMITES.EMAIL.MAX;
};

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/;
  return passwordRegex.test(password);
};

const validateName = (name) => {
  return name.length >= LIMITES.NOMBRE.MIN && name.length <= LIMITES.NOMBRE.MAX;
};

const validateNickname = (nickname) => {
  if (nickname.length < LIMITES.NICKNAME.MIN) return false;
  if (nickname.length > LIMITES.NICKNAME.MAX) return false;
  const regex = /^[a-zA-Z0-9_]+$/;
  return regex.test(nickname);
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
  inputSuccess: {
    borderColor: colors.success,
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
  },
  inputError: {
    borderColor: colors.error,
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
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
    fieldValidation,
    validatingNickname,
    nicknameAvailable,
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

    const isFormValid = useMemo(() => {
      return (
        formData.nombreUsuario &&
        formData.email &&
        formData.password &&
        formData.confirmPassword &&
        validateName(formData.nombreUsuario) &&
        validateEmail(formData.email) &&
        validatePassword(formData.password) &&
        formData.password === formData.confirmPassword &&
        nicknameAvailable
      );
    }, [formData, nicknameAvailable]);

    // Función para obtener el estilo del input según su estado
    const getInputStyle = (fieldName) => {
      const baseStyle = { ...styles.input };

      if (focusedField === fieldName) {
        return { ...baseStyle, ...styles.inputFocus };
      }

      if (fieldValidation[fieldName] === 'valid') {
        return { ...baseStyle, ...styles.inputSuccess };
      }

      if (fieldValidation[fieldName] === 'invalid') {
        return { ...baseStyle, ...styles.inputError };
      }

      return baseStyle;
    };

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
          {/* Campo de nickname */}
          <div className="mb-3">
            <label
              htmlFor="nickname"
              className="form-label fw-semibold text-dark mb-2 d-flex align-items-center"
              style={{ fontSize: '1rem' }}
            >
              <i
                className="fas fa-at me-2"
                style={{ color: colors.primary }}
              ></i>
              Nickname
              <span
                className="text-muted"
                style={{ fontSize: '0.8rem', marginLeft: '5px' }}
              >
                ({LIMITES.NICKNAME.MIN}-{LIMITES.NICKNAME.MAX} caracteres,
                letras, números y _)
              </span>
            </label>

            <div className="position-relative">
              <input
                type="text"
                id="nickname"
                name="nickname"
                className="form-control form-control-lg border-0"
                style={getInputStyle('nickname')}
                value={formData.nickname || ''}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('nickname')}
                onBlur={() => setFocusedField(null)}
                placeholder="Tu nickname único"
                disabled={loading}
                required
                maxLength={LIMITES.NICKNAME.MAX}
                autoComplete="username"
              />

              {/* Indicador de estado del nickname */}
              {validatingNickname && (
                <div
                  className="position-absolute"
                  style={{
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">Validando...</span>
                  </div>
                </div>
              )}

              {!validatingNickname &&
                formData.nickname &&
                validateNickname(formData.nickname) &&
                nicknameAvailable && (
                  <div
                    className="position-absolute"
                    style={{
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  >
                    <i
                      className="fas fa-check-circle text-success"
                      style={{ fontSize: '18px' }}
                    ></i>
                  </div>
                )}

              {!validatingNickname &&
                formData.nickname &&
                (!validateNickname(formData.nickname) ||
                  !nicknameAvailable) && (
                  <div
                    className="position-absolute"
                    style={{
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  >
                    <i
                      className="fas fa-times-circle text-danger"
                      style={{ fontSize: '18px' }}
                    ></i>
                  </div>
                )}
            </div>

            {/* Mensajes de ayuda para nickname */}
            {validatingNickname && (
              <div className="text-primary small mt-2">
                <i className="fas fa-clock me-1"></i>Verificando
                disponibilidad...
              </div>
            )}

            {!validatingNickname &&
              formData.nickname &&
              formData.nickname.length > 0 &&
              formData.nickname.length < LIMITES.NICKNAME.MIN && (
                <div className="text-warning small mt-2">
                  <i className="fas fa-info-circle me-1"></i>
                  El nickname debe tener al menos {LIMITES.NICKNAME.MIN}{' '}
                  caracteres.
                </div>
              )}

            {!validatingNickname &&
              formData.nickname &&
              !validateNickname(formData.nickname) &&
              formData.nickname.length >= LIMITES.NICKNAME.MIN && (
                <div className="text-danger small mt-2">
                  <i className="fas fa-exclamation-circle me-1"></i>
                  Solo se permiten letras, números y guión bajo (_).
                </div>
              )}

            {!validatingNickname &&
              formData.nickname &&
              validateNickname(formData.nickname) &&
              !nicknameAvailable && (
                <div className="text-danger small mt-2">
                  <i className="fas fa-exclamation-circle me-1"></i>
                  Este nickname ya está en uso. Por favor, elige otro.
                </div>
              )}

            {!validatingNickname &&
              formData.nickname &&
              validateNickname(formData.nickname) &&
              nicknameAvailable && (
                <div className="text-success small mt-2">
                  <i className="fas fa-check-circle me-1"></i>
                  ¡Perfecto! Este nickname está disponible.
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
              style={getInputStyle('email')}
              value={formData.email}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="tu@correo.com"
              disabled={loading}
              required
              maxLength={LIMITES.EMAIL.MAX}
              autoComplete="email"
            />

            {/* Indicadores de validación para email */}
            {formData.email && fieldValidation.email === 'valid' && (
              <div className="text-success small mt-2 d-flex align-items-center">
                <i className="fas fa-check-circle me-2"></i>
                Email válido
              </div>
            )}

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

          {/* Campo de fecha de nacimiento */}
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

            <EnhancedDatePicker
              value={formData.fechaNacimiento}
              onChange={(date) =>
                setFormData((prev) => ({ ...prev, fechaNacimiento: date }))
              }
              disabled={loading}
              placeholder="Selecciona tu fecha de nacimiento"
              showAge={true}
              minAge={13}
              maxAge={100}
            />

            {/* Mantener las validaciones existentes */}
            {validationErrors.fechaNacimiento && (
              <div
                className="mt-2 small d-flex align-items-center"
                style={{ color: colors.error }}
              >
                <i className="fas fa-exclamation-circle me-2"></i>
                {validationErrors.fechaNacimiento}
              </div>
            )}
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
              <span
                className="text-muted"
                style={{ fontSize: '0.8rem', marginLeft: '5px' }}
              >
                (min. 8 caracteres, 1 mayúscula, 1 minúscula, 1 número)
              </span>
            </label>
            <div className="position-relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-control form-control-lg border-0 pe-5"
                style={getInputStyle('password')}
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Contraseña"
                disabled={loading}
                required
                minLength={LIMITES.PASSWORD.MIN}
                maxLength={LIMITES.PASSWORD.MAX}
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

            {/* Indicadores de validación para contraseña */}
            {formData.password && fieldValidation.password === 'valid' && (
              <div className="text-success small mt-2 d-flex align-items-center">
                <i className="fas fa-check-circle me-2"></i>
                Contraseña segura
              </div>
            )}

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
                style={getInputStyle('confirmPassword')}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                placeholder="Confirma tu contraseña"
                disabled={loading}
                required
                minLength={LIMITES.PASSWORD.MIN}
                maxLength={LIMITES.PASSWORD.MAX}
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

            {/* Indicadores de validación para confirmar contraseña */}
            {formData.confirmPassword &&
              fieldValidation.confirmPassword === 'valid' && (
                <div className="text-success small mt-2 d-flex align-items-center">
                  <i className="fas fa-check-circle me-2"></i>
                  Las contraseñas coinciden
                </div>
              )}

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
              to="/Login"
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
    email: '',
    password: '',
    confirmPassword: '',
    fechaNacimiento: '',
    nombreUsuario: '',
    nickname: '',
    rol: 'usuario',
    anonimo: false,
    visibilidadPerfil: 'publico',
    genero: '',
    pronombres: '',
    biografia: '',
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldValidation, setFieldValidation] = useState({});

  // Estados para validación de nickname
  const [validatingNickname, setValidatingNickname] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(true);

  // Validar nickname en tiempo real con debounce
  useEffect(() => {
    const validateNicknameAvailability = async () => {
      if (
        !formData.nickname ||
        formData.nickname.length < LIMITES.NICKNAME.MIN
      ) {
        setNicknameAvailable(true);
        return;
      }

      if (!validateNickname(formData.nickname)) {
        setNicknameAvailable(false);
        return;
      }

      setValidatingNickname(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/usuarios/verificar-nickname/${formData.nickname}`
        );
        const data = await res.json();
        setNicknameAvailable(data.disponible);
      } catch (err) {
        console.error('Error validando nickname:', err);
        setNicknameAvailable(false);
      } finally {
        setValidatingNickname(false);
      }
    };

    const timeoutId = setTimeout(validateNicknameAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.nickname]);

  // Validar campos en tiempo real
  useEffect(() => {
    const newFieldValidation = {};
    const newValidationErrors = {};

    // Validar nombre completo
    if (formData.nombreUsuario) {
      if (validateName(formData.nombreUsuario)) {
        newFieldValidation.nombreUsuario = 'valid';
      } else {
        newFieldValidation.nombreUsuario = 'invalid';
        newValidationErrors.nombreUsuario = `El nombre debe tener entre ${LIMITES.NOMBRE.MIN} y ${LIMITES.NOMBRE.MAX} caracteres y solo contener letras`;
      }
    }

    // Validar email
    if (formData.email) {
      if (validateEmail(formData.email)) {
        newFieldValidation.email = 'valid';
      } else {
        newFieldValidation.email = 'invalid';
        newValidationErrors.email = 'Formato de email inválido';
      }
    }

    // Validar contraseña
    if (formData.password) {
      if (validatePassword(formData.password)) {
        newFieldValidation.password = 'valid';
      } else {
        newFieldValidation.password = 'invalid';
        newValidationErrors.password =
          'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
      }
    }

    // Validar confirmación de contraseña
    if (formData.confirmPassword) {
      if (formData.password === formData.confirmPassword && formData.password) {
        newFieldValidation.confirmPassword = 'valid';
      } else {
        newFieldValidation.confirmPassword = 'invalid';
        newValidationErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    // Validar nickname
    if (formData.nickname) {
      if (
        validateNickname(formData.nickname) &&
        nicknameAvailable &&
        !validatingNickname
      ) {
        newFieldValidation.nickname = 'valid';
      } else {
        newFieldValidation.nickname = 'invalid';
      }
    }

    setFieldValidation(newFieldValidation);
    setValidationErrors(newValidationErrors);
  }, [formData, nicknameAvailable, validatingNickname]);

  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.nombreUsuario || !validateName(formData.nombreUsuario)) {
      errors.nombreUsuario = `El nombre debe tener entre ${LIMITES.NOMBRE.MIN} y ${LIMITES.NOMBRE.MAX} caracteres y solo contener letras`;
    }

    if (!formData.nickname) {
      errors.nickname = 'El nickname es obligatorio';
    } else if (!validateNickname(formData.nickname)) {
      errors.nickname = `El nickname debe tener entre ${LIMITES.NICKNAME.MIN} y ${LIMITES.NICKNAME.MAX} caracteres y solo contener letras, números y guión bajo`;
    } else if (!nicknameAvailable) {
      errors.nickname = 'Este nickname ya está en uso';
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

    if (!formData.fechaNacimiento) {
      errors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, nicknameAvailable]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        setError('Por favor corrige los errores en el formulario');
        return;
      }

      if (validatingNickname) {
        setError('Esperando validación del nickname...');
        return;
      }

      setError(null);
      setSuccess(null);
      setLoading(true);

      try {
        const payload = {
          correo: sanitizeInput(formData.email),
          contraseña: sanitizeInput(formData.password),
          nombreUsuario: sanitizeInput(formData.nombreUsuario),
          nickname: sanitizeInput(formData.nickname),
          fechaNacimiento: formData.fechaNacimiento || '2000-01-01',
          rol: formData.rol,
          anonimo: formData.anonimo,
          visibilidadPerfil: formData.visibilidadPerfil,
          genero: formData.genero,
          pronombres: formData.pronombres,
          biografia: formData.biografia,
        };

        await registrarUsuario(payload);

        setSuccess('¡Cuenta creada exitosamente! Redirigiendo al login...');
        setTimeout(() => {
          window.location.href = '/login';
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
    [formData, validateForm, validatingNickname]
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
          fieldValidation={fieldValidation}
          validatingNickname={validatingNickname}
          nicknameAvailable={nicknameAvailable}
        />
      </div>
    </div>
  );
}
