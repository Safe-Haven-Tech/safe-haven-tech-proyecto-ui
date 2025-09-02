// src/components/RegisterForm.jsx
import React, { useState, useCallback, useMemo } from 'react';
import Logo from '../../assets/Logo.png';
import EnhancedDatePicker from './datePicker.jsx';
import { colors, styles } from '../../utils/stylesRegister.js';
import {
  sanitizeInput,
  validateNickname,
  validateEmail,
} from '../../utils/validators.js';

const RegisterForm = React.memo(
  ({
    formData,
    setFormData,
    handleSubmit,
    fieldValidation,
    validationErrors,
    validatingNickname,
    nicknameAvailable,
    error,
    success,
    loading,
    handleFieldBlur,
  }) => {
    const [focusedField, setFocusedField] = useState(null);
    const [hoveredField, setHoveredField] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isButtonHovered, setIsButtonHovered] = useState(false);

    const handleInputChange = useCallback(
      (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
      },
      [setFormData]
    );

    const isFormValid = useMemo(() => {
      return Object.values(fieldValidation).every((v) => v === 'valid');
    }, [fieldValidation]);

    const nicknameFeedback = useMemo(() => {
      if (validationErrors.nickname) {
        return (
          <div className="invalid-feedback d-block mt-2">
            {validationErrors.nickname}
          </div>
        );
      }
      if (!formData.nickname) return null;
      if (!validateNickname(formData.nickname)) {
        return (
          <div className="invalid-feedback d-block mt-2">
            Nickname inválido (solo letras, números y guiones bajos)
          </div>
        );
      }
      if (validatingNickname)
        return (
          <div className="form-text text-info mt-2">
            Verificando disponibilidad...
          </div>
        );
      if (!validatingNickname && nicknameAvailable)
        return (
          <div className="text-success small mt-2">Nickname disponible ✅</div>
        );
      if (!validatingNickname && !nicknameAvailable)
        return (
          <div className="invalid-feedback d-block mt-2">
            Nickname ya en uso
          </div>
        );
      return null;
    }, [
      formData.nickname,
      validationErrors.nickname,
      validatingNickname,
      nicknameAvailable,
    ]);

    const getInputStyle = (fieldName) => {
      let baseStyle = { ...styles.input };

      // Aplicar focus/hover
      if (focusedField === fieldName || hoveredField === fieldName) {
        baseStyle = { ...baseStyle, ...styles.inputFocus };
      }

      // Aplicar estado de validación
      if (fieldValidation[fieldName] === 'valid') {
        baseStyle = { ...baseStyle, ...styles.inputSuccess };
      } else if (fieldValidation[fieldName] === 'invalid') {
        baseStyle = { ...baseStyle, ...styles.inputError };
      }

      return baseStyle;
    };

    const inputs = useMemo(
      () => [
        {
          name: 'nickname',
          label: 'Nickname',
          icon: 'at',
          type: 'text',
          placeholder: 'Tu nickname único',
          feedback: () => nicknameFeedback,
        },
        {
          name: 'email',
          label: 'Correo Electrónico',
          icon: 'envelope',
          type: 'email',
          placeholder: 'tu@correo.com',
          feedback: () => {
            if (validationErrors.email) {
              return (
                <div className="invalid-feedback d-block mt-2">
                  {validationErrors.email}
                </div>
              );
            }
            if (!formData.email) return null;
            if (!validateEmail(formData.email))
              return (
                <div className="invalid-feedback d-block mt-2">
                  Email inválido
                </div>
              );
            return (
              <div className="text-success small mt-2">Correo válido ✅</div>
            );
          },
        },
        {
          name: 'password',
          label: 'Contraseña',
          icon: 'lock',
          type: showPassword ? 'text' : 'password',
          placeholder: 'Contraseña',
          toggleShow: () => setShowPassword((prev) => !prev),
          inputStyle: { paddingRight: '4rem' },
          feedback: () => {
            if (validationErrors.password) {
              return (
                <div className="invalid-feedback d-block mt-2">
                  {validationErrors.password}
                </div>
              );
            }
            if (!formData.password) return null;
            return fieldValidation.password === 'valid' ? (
              <div className="text-success small mt-2">
                Contraseña válida ✅
              </div>
            ) : (
              <div className="invalid-feedback d-block mt-2">
                La contraseña debe tener al menos 8 caracteres
              </div>
            );
          },
          showTick: true,
        },
        {
          name: 'confirmPassword',
          label: 'Confirmar Contraseña',
          icon: 'shield-alt',
          type: showConfirmPassword ? 'text' : 'password',
          placeholder: 'Confirma tu contraseña',
          toggleShow: () => setShowConfirmPassword((prev) => !prev),
          inputStyle: { paddingRight: '4rem' },
          feedback: () => {
            if (validationErrors.confirmPassword) {
              return (
                <div className="invalid-feedback d-block mt-2">
                  {validationErrors.confirmPassword}
                </div>
              );
            }
            if (!formData.confirmPassword) return null;
            return fieldValidation.confirmPassword === 'valid' ? (
              <div className="text-success small mt-2">
                Las contraseñas coinciden ✅
              </div>
            ) : (
              <div className="invalid-feedback d-block mt-2">
                Las contraseñas no coinciden
              </div>
            );
          },
          showTick: true,
        },
        {
          name: 'fechaNacimiento',
          label: 'Fecha de Nacimiento',
          icon: 'calendar-alt',
          type: 'datePicker',
          placeholder: 'Selecciona tu fecha de nacimiento',
          feedback: () =>
            validationErrors.fechaNacimiento && (
              <div className="invalid-feedback d-block mt-2">
                {validationErrors.fechaNacimiento}
              </div>
            ),
        },
      ],
      [
        formData,
        fieldValidation,
        validationErrors,
        showPassword,
        showConfirmPassword,
        nicknameFeedback,
      ]
    );

    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{}}
      >
        <div style={styles.formContainer}>
          <div className="text-center mb-4">
            <img
              src={Logo}
              alt="SafeHaven Logo"
              style={styles.logo}
              className="mb-3"
            />
            <h2 className="fw-bold mb-2" style={styles.title}>
              Crear Cuenta
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>
              Únete a nuestra comunidad de apoyo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mb-3" autoComplete="off">
            <input
              type="text"
              name="fake-username"
              style={{ display: 'none' }}
            />
            <input
              type="password"
              name="fake-password"
              style={{ display: 'none' }}
            />

            {inputs.map((input) => (
              <div className="mb-3" key={input.name}>
                <label className="form-label fw-semibold text-dark mb-2 d-flex align-items-center">
                  <i
                    className={`fas fa-${input.icon} me-2`}
                    style={{ color: colors.primary }}
                  ></i>
                  {input.label}
                </label>

                {input.type === 'datePicker' ? (
                  <EnhancedDatePicker
                    value={formData.fechaNacimiento}
                    onChange={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        fechaNacimiento: date,
                      }))
                    }
                    onBlur={() => handleFieldBlur('fechaNacimiento')}
                    disabled={loading}
                    placeholder={input.placeholder}
                    showAge
                    minAge={13}
                    maxAge={100}
                  />
                ) : (
                  <div className="position-relative">
                    <input
                      type={input.type}
                      name={input.name}
                      value={formData[input.name] || ''}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField(input.name)}
                      onBlur={() => {
                        setFocusedField(null);
                        handleFieldBlur(input.name);
                      }}
                      onMouseEnter={() => setHoveredField(input.name)}
                      onMouseLeave={() => setHoveredField(null)}
                      autoComplete={
                        input.name.includes('password') ? 'new-password' : 'off'
                      }
                      className={`form-control form-control-lg ${input.toggleShow ? 'pe-5' : ''}`}
                      style={{
                        ...getInputStyle(input.name),
                        ...input.inputStyle,
                      }}
                      disabled={loading}
                      required
                      placeholder={input.placeholder}
                    />

                    {/* Tick de validación */}
                    {input.showTick &&
                      fieldValidation[input.name] === 'valid' && (
                        <i
                          className="fas fa-check text-success position-absolute top-50"
                          style={{
                            right: '2.75rem',
                            transform: 'translateY(-50%)',
                            zIndex: 1,
                          }}
                        ></i>
                      )}

                    {/* Botón toggle */}
                    {input.toggleShow && (
                      <button
                        type="button"
                        className="btn btn-link position-absolute top-50 end-0"
                        onClick={input.toggleShow}
                        style={{
                          color: colors.secondary,
                          transform: 'translateY(-50%)',
                          zIndex: 2,
                          padding: '0 0.5rem',
                        }}
                      >
                        <i
                          className={`fas fa-${input.type === 'text' ? 'eye-slash' : 'eye'}`}
                        ></i>
                      </button>
                    )}

                    {input.feedback()}
                  </div>
                )}
              </div>
            ))}

            {error && (
              <div
                style={{ ...styles.alert, ...styles.alertError }}
                className="mb-3"
              >
                {error}
              </div>
            )}
            {success && (
              <div
                style={{ ...styles.alert, ...styles.alertSuccess }}
                className="mb-3"
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-lg w-100 fw-semibold py-3 mb-3"
              disabled={loading || !isFormValid}
              style={
                loading || !isFormValid
                  ? { ...styles.buttonDisabled, cursor: 'not-allowed' }
                  : isButtonHovered
                    ? { ...styles.button, ...styles.buttonHover }
                    : styles.button
              }
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="text-center">
            <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
              ¿Ya tienes una cuenta?{' '}
              <a
                href="/Login"
                className="fw-semibold"
                style={{ color: colors.primary }}
              >
                Inicia sesión aquí
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }
);

export default RegisterForm;
