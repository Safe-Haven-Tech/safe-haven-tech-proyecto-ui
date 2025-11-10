import React, { useState, useCallback, useMemo } from 'react';
import styles from './RegisterForm.module.css';
import Logo from '../../assets/Logo.png';
import EnhancedDatePicker from './datePicker.jsx';
import {
  sanitizeInput,
  validateNickname,
  validateEmail,
  LIMITES,
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

    const handleInputChange = useCallback(
      (e) => {
        const { name, value } = e.target;
        const sanitized = sanitizeInput(value);
        setFormData((prev) => ({
          ...prev,
          [name]: sanitized,
          ...(name === 'nombreUsuario' ? { nickname: sanitized } : {}),
        }));
      },
      [setFormData]
    );

    const isFormValid = useMemo(() => {
      return Object.values(fieldValidation).every((v) => v === 'valid');
    }, [fieldValidation]);

    const getInputClasses = (fieldName) => {
      let classes = styles.formInput;

      if (fieldValidation[fieldName] === 'valid') {
        classes += ` ${styles.inputValid}`;
      } else if (fieldValidation[fieldName] === 'invalid') {
        classes += ` ${styles.inputInvalid}`;
      }

      return classes;
    };

    const nicknameFeedback = useMemo(() => {
      const value = (formData.nombreUsuario || '').trim();

      if (validationErrors.nombreUsuario) {
        return (
          <div className={`${styles.feedbackMessage} ${styles.feedbackError}`}>
            {validationErrors.nombreUsuario}
          </div>
        );
      }
      if (!value) return null;

      if (value.length < LIMITES.NICKNAME.MIN) {
        return (
          <div className={`${styles.feedbackMessage} ${styles.feedbackError}`}>
            El nickname debe tener al menos {LIMITES.NICKNAME.MIN} caracteres
          </div>
        );
      }
      if (value.length > LIMITES.NICKNAME.MAX) {
        return (
          <div className={`${styles.feedbackMessage} ${styles.feedbackError}`}>
            El nickname no puede superar los {LIMITES.NICKNAME.MAX} caracteres
          </div>
        );
      }
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        return (
          <div className={`${styles.feedbackMessage} ${styles.feedbackError}`}>
            El nickname solo puede contener letras, números y guion bajo (_)
          </div>
        );
      }

      if (validatingNickname) {
        return (
          <div className={`${styles.feedbackMessage} ${styles.feedbackInfo}`}>
            Verificando disponibilidad...
          </div>
        );
      }

      if (!validatingNickname && nicknameAvailable) {
        return (
          <div className={`${styles.feedbackMessage} ${styles.feedbackSuccess}`}>
            Nickname disponible
          </div>
        );
      }

      if (!validatingNickname && !nicknameAvailable) {
        return (
          <div className={`${styles.feedbackMessage} ${styles.feedbackError}`}>
            Nickname ya en uso
          </div>
        );
      }

      return null;
    }, [
      formData.nombreUsuario,
      validationErrors.nombreUsuario,
      validatingNickname,
      nicknameAvailable,
    ]);

    const inputs = useMemo(
      () => [
        {
          name: 'nombreUsuario',
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
                <div
                  className={`${styles.feedbackMessage} ${styles.feedbackError}`}
                >
                  {validationErrors.email}
                </div>
              );
            }
            if (!formData.email) return null;
            if (!validateEmail(formData.email))
              return (
                <div
                  className={`${styles.feedbackMessage} ${styles.feedbackError}`}
                >
                  Email inválido
                </div>
              );
            return (
              <div
                className={`${styles.feedbackMessage} ${styles.feedbackSuccess}`}
              >
                Correo válido 
              </div>
            );
          },
        },
        {
          name: 'password',
          label: 'Contraseña',
          icon: 'lock',
          type: showPassword ? 'text' : 'password',
          placeholder: 'Contraseña segura',
          toggleShow: () => setShowPassword((prev) => !prev),
          hasToggle: true,
          feedback: () => {
            if (validationErrors.password) {
              return (
                <div
                  className={`${styles.feedbackMessage} ${styles.feedbackError}`}
                >
                  {validationErrors.password}
                </div>
              );
            }
            if (!formData.password) return null;
            return fieldValidation.password === 'valid' ? (
              <div
                className={`${styles.feedbackMessage} ${styles.feedbackSuccess}`}
              >
                Contraseña válida 
              </div>
            ) : (
              <div
                className={`${styles.feedbackMessage} ${styles.feedbackError}`}
              >
                La contraseña debe tener al menos 8 caracteres, una mayúscula,
                una minúscula y un número
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
          hasToggle: true,
          feedback: () => {
            if (validationErrors.confirmPassword) {
              return (
                <div
                  className={`${styles.feedbackMessage} ${styles.feedbackError}`}
                >
                  {validationErrors.confirmPassword}
                </div>
              );
            }
            if (!formData.confirmPassword) return null;
            return fieldValidation.confirmPassword === 'valid' ? (
              <div
                className={`${styles.feedbackMessage} ${styles.feedbackSuccess}`}
              >
                Las contraseñas coinciden 
              </div>
            ) : (
              <div
                className={`${styles.feedbackMessage} ${styles.feedbackError}`}
              >
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
              <div
                className={`${styles.feedbackMessage} ${styles.feedbackError}`}
              >
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
      <div className={styles.registerFormContainer}>
        <div className={styles.formHeader}>
          <img src={Logo} alt="SafeHaven Logo" className={styles.logo} />
          <h2 className={styles.formTitle}>Crear Cuenta</h2>
          <p className={styles.formSubtitle}>
            Únete a nuestra comunidad de apoyo
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={styles.registerForm}
          autoComplete="off"
        >
          <input
            type="text"
            name="fake-username"
            className={styles.hiddenField}
            tabIndex="-1"
          />
          <input
            type="password"
            name="fake-password"
            className={styles.hiddenField}
            tabIndex="-1"
          />

          {inputs.map((input) => (
            <div className={styles.inputGroup} key={input.name}>
              <label htmlFor={input.name} className={styles.inputLabel}>
                <i className={`fas fa-${input.icon} ${styles.inputIcon}`}></i>
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
                <div className={styles.inputContainer}>
                  <input
                    type={input.type}
                    id={input.name}
                    name={input.name}
                    value={formData[input.name] || ''}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField(input.name)}
                    onBlur={() => {
                      setFocusedField(null);
                      handleFieldBlur(input.name);
                      if (input.name === 'nombreUsuario') {
                        handleFieldBlur('nickname');
                      }
                    }}
                    onMouseEnter={() => setHoveredField(input.name)}
                    onMouseLeave={() => setHoveredField(null)}
                    autoComplete={
                      input.name.includes('password') ? 'new-password' : 'off'
                    }
                    className={`${getInputClasses(input.name)} ${input.hasToggle ? styles.inputWithButton : ''}`}
                    disabled={loading}
                    required
                    placeholder={input.placeholder}
                    maxLength={
                      input.name === 'email'
                        ? 254
                        : input.name.includes('password')
                          ? 128
                          : input.name === 'nombreUsuario'
                            ? LIMITES.NICKNAME.MAX
                            : 50
                    }
                    aria-describedby={`${input.name}-feedback`}
                  />

                  {input.showTick &&
                    fieldValidation[input.name] === 'valid' && (
                      <i
                        className={`fas fa-check ${styles.validationTick}`}
                      ></i>
                    )}

                  {input.hasToggle && (
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={input.toggleShow}
                      aria-label={
                        input.type === 'text'
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                    >
                      <i
                        className={`fas fa-${input.type === 'text' ? 'eye-slash' : 'eye'}`}
                      ></i>
                    </button>
                  )}
                </div>
              )}

              <div
                id={`${input.name}-feedback`}
                role="region"
                aria-live="polite"
              >
                {input.feedback()}
              </div>
            </div>
          ))}

          {error && (
            <div
              className={`${styles.alert} ${styles.alertError}`}
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className={`${styles.alert} ${styles.alertSuccess}`}
              role="alert"
              aria-live="polite"
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !isFormValid}
            aria-describedby="submit-status"
          >
            <span>{loading ? 'Creando cuenta...' : 'Crear Cuenta'}</span>
          </button>
        </form>

        <div className={styles.formFooter}>
          <p className={styles.footerText}>
            ¿Ya tienes una cuenta?{' '}
            <a href="/Login" className={styles.footerLink}>
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </div>
    );
  }
);

RegisterForm.displayName = 'RegisterForm';

export default RegisterForm;