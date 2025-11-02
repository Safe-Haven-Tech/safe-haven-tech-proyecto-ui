import { useState, useEffect, useCallback, useRef } from 'react';
import * as validators from '../utils/validators';
import { checkNicknameAvailability } from '../services/validationService';

/**
 * Hook para validación de formularios de registro/edición.
 * - Debounce para validación por campo.
 * - Validación async para nickname con cancelación de peticiones previas.
 * - Provee estado de errores, validación por campo y helpers de interacción (blur).
 */
export const useFormValidation = (initialData = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldValidation, setFieldValidation] = useState({});
  const [validatingNickname, setValidatingNickname] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(true);
  const [touchedFields, setTouchedFields] = useState({});

  const nicknameRequestRef = useRef({ currentToken: 0 });

  const handleFieldBlur = useCallback((fieldName) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  // Helper para validar campos sin bloquear el submit
  const validateFieldSync = useCallback((name, value) => {
    switch (name) {
      case 'nombreUsuario':
        return validators.validateName(value) ? null : 'Nombre inválido';
      case 'email':
        return validators.validateEmail(value) ? null : 'Email inválido';
      case 'password':
        return validators.validatePassword(value) ? null : 'Contraseña inválida';
      case 'confirmPassword':
        return value === formData.password ? null : 'Contraseñas no coinciden';
      case 'nickname':
        return validators.validateNickname(value) ? null : 'Nickname inválido';
      default:
        return null;
    }
  }, [formData.password]);

  // Debounced / incremental validation (including async nickname check)
  useEffect(() => {
    const debounced = setTimeout(() => {
      const updates = {};
      let updateNeeded = false;

      // Validar campos que han sido touchados
      Object.keys(touchedFields).forEach((field) => {
        if (!touchedFields[field]) return;
        const value = formData[field];
        const err = validateFieldSync(field, value);
        updates[field] = err ? 'invalid' : 'valid';
        updateNeeded = true;
      });

      // Nickname async validation (si fue tocado y pasa la validación básica)
      const nick = formData.nickname;
      if (touchedFields.nickname && nick && !validateFieldSync('nickname', nick)) {
        const token = ++nicknameRequestRef.currentToken;
        setValidatingNickname(true);
        // lanzar async check (no await aquí para no bloquear)
        (async () => {
          try {
            const disponible = await checkNicknameAvailability(nick);
            // ignorar si ya vino una petición más reciente
            if (token !== nicknameRequestRef.currentToken) return;
            setNicknameAvailable(Boolean(disponible));
            setFieldValidation((prev) => ({ ...prev, nickname: disponible ? 'valid' : 'invalid' }));
          } catch (err) {
            if (token !== nicknameRequestRef.currentToken) return;
            setNicknameAvailable(false);
            setFieldValidation((prev) => ({ ...prev, nickname: 'invalid' }));
          } finally {
            if (token === nicknameRequestRef.currentToken) setValidatingNickname(false);
          }
        })();
      }

      if (updateNeeded) {
        setFieldValidation((prev) => ({ ...prev, ...updates }));
      }
    }, 300);

    return () => clearTimeout(debounced);
  }, [formData, touchedFields, validateFieldSync]);

  // Validación completa al enviar
  const validateForm = useCallback(() => {
    const errors = {};

    // nombreUsuario
    if (!formData.nombreUsuario || !validators.validateName(formData.nombreUsuario)) {
      errors.nombreUsuario = 'Nombre inválido';
    }

    // nickname
    if (!formData.nickname) {
      errors.nickname = 'Nickname obligatorio';
    } else if (!validators.validateNickname(formData.nickname)) {
      errors.nickname = 'Nickname inválido';
    } else if (!nicknameAvailable) {
      errors.nickname = 'Nickname ya en uso';
    }

    // email
    if (!formData.email || !validators.validateEmail(formData.email)) {
      errors.email = 'Email inválido';
    }

    // password
    if (!formData.password || !validators.validatePassword(formData.password)) {
      errors.password = 'Contraseña inválida';
    }

    // confirmPassword
    if (!formData.confirmPassword || formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Contraseñas no coinciden';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, nicknameAvailable]);

  return {
    formData,
    setFormData,
    validationErrors,
    fieldValidation,
    validatingNickname,
    nicknameAvailable,
    validateForm,
    handleFieldBlur,
    touchedFields,
  };
};

export default useFormValidation;
