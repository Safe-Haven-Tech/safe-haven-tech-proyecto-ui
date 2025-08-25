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

    const getInputStyle = (fieldName) => {
      const baseStyle = { ...styles.input };
      if (focusedField === fieldName || hoveredField === fieldName)
        return { ...baseStyle, ...styles.inputFocus };
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
          feedback: () => {
            if (!formData.nickname) return null;
            if (!validateNickname(formData.nickname)) {
              return (
                <div className="invalid-feedback d-block mt-2">
                  Nickname inválido
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
                <div className="text-success small mt-2">
                  Nickname disponible ✅
                </div>
              );
            if (!validatingNickname && !nicknameAvailable)
              return (
                <div className="invalid-feedback d-block mt-2">
                  Nickname ya en uso
                </div>
              );
            return null;
          },
        },
        {
          name: 'email',
          label: 'Correo Electrónico',
          icon: 'envelope',
          type: 'email',
          placeholder: 'tu@correo.com',
          feedback: () => {
            if (!formData.email) return null;
            if (!validateEmail(formData.email))
              return (
                <div className="invalid-feedback d-block mt-2">
                  Email inválido
                </div>
              );
            if (validationErrors.email)
              return (
                <div className="invalid-feedback d-block mt-2">
                  {validationErrors.email}
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
          inputStyle: { paddingRight: '4rem' }, // espacio para tick + ojo
          feedback: () => {
            if (!formData.password) return null;
            return fieldValidation.password === 'valid' ? (
              <div className="text-success small mt-2">
                Contraseña válida ✅
              </div>
            ) : (
              <div className="invalid-feedback d-block mt-2">
                La contraseña debe tener 8-20 caracteres, incluir mayúscula,
                minúscula y un número
              </div>
            );
          },
          showTick: true, // para renderizar tick junto al input
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
        validatingNickname,
        nicknameAvailable,
        showPassword,
        showConfirmPassword,
      ]
    );

    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ backgroundColor: colors.lightGray }}
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

          <form onSubmit={handleSubmit} className="mb-3">
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
                      onBlur={() => setFocusedField(null)}
                      onMouseEnter={() => setHoveredField(input.name)}
                      onMouseLeave={() => setHoveredField(null)}
                      className={`form-control form-control-lg border-0 ${
                        fieldValidation[input.name] === 'valid'
                          ? 'is-valid'
                          : fieldValidation[input.name] === 'invalid'
                            ? 'is-invalid'
                            : ''
                      }${input.toggleShow ? ' pe-5' : ''}`}
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
