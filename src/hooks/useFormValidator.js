// src/hooks/useFormValidation.js
import { useState, useEffect, useCallback } from 'react';
import * as validators from '../utils/validators';
import { checkNicknameAvailability } from '../services/validationService';

export const useFormValidation = (initialData) => {
  const [formData, setFormData] = useState(initialData);
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldValidation, setFieldValidation] = useState({});
  const [validatingNickname, setValidatingNickname] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(true);
  const [touchedFields, setTouchedFields] = useState({});

  // Actualizar touched fields cuando el usuario interactúa con un campo
  const handleFieldBlur = useCallback((fieldName) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  // Debounce para validación de campos individuales
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      let needsUpdate = false;
      const updates = {};

      if (touchedFields.nombreUsuario && formData.nombreUsuario) {
        const isValid = validators.validateName(formData.nombreUsuario);
        updates.nombreUsuario = isValid ? 'valid' : 'invalid';
        needsUpdate = true;
      }

      // Email
      if (touchedFields.email && formData.email) {
        const isValid = validators.validateEmail(formData.email);
        updates.email = isValid ? 'valid' : 'invalid';
        needsUpdate = true;
      }

      // Password
      if (touchedFields.password && formData.password) {
        const isValid = validators.validatePassword(formData.password);
        updates.password = isValid ? 'valid' : 'invalid';
        needsUpdate = true;
      }

      // Confirm Password
      if (touchedFields.confirmPassword && formData.confirmPassword) {
        const isValid =
          formData.password === formData.confirmPassword &&
          formData.confirmPassword !== '';
        updates.confirmPassword = isValid ? 'valid' : 'invalid';
        needsUpdate = true;
      }

      // Nickname - SOLO validar si el nickname ha sido touched
      if (touchedFields.nickname && formData.nickname) {
        if (!validators.validateNickname(formData.nickname)) {
          updates.nickname = 'invalid';
          setNicknameAvailable(false);
          needsUpdate = true;
        } else {
          setValidatingNickname(true);
          const disponible = await checkNicknameAvailability(formData.nickname);
          setNicknameAvailable(disponible);
          updates.nickname = disponible ? 'valid' : 'invalid';
          needsUpdate = true;
          setValidatingNickname(false);
        }
      }

      if (needsUpdate) {
        // Usar callback para evitar dependencia de fieldValidation
        setFieldValidation((prev) => ({ ...prev, ...updates }));
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData, touchedFields]);

  // Validación completa al enviar (valida todos los campos)
  const validateForm = useCallback(() => {
    const errors = {};

    if (
      !formData.nombreUsuario ||
      !validators.validateName(formData.nombreUsuario)
    ) {
      errors.nombreUsuario = 'Nombre inválido';
    }

    if (!formData.nickname) {
      errors.nickname = 'Nickname obligatorio';
    } else if (!validators.validateNickname(formData.nickname)) {
      errors.nickname = 'Nickname inválido';
    } else if (!nicknameAvailable) {
      errors.nickname = 'Nickname ya en uso';
    }

    if (!formData.email || !validators.validateEmail(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.password || !validators.validatePassword(formData.password)) {
      errors.password = 'Contraseña inválida';
    }

    if (
      !formData.confirmPassword ||
      formData.password !== formData.confirmPassword
    ) {
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
    handleFieldBlur, // Nueva función para manejar blur
    touchedFields, // Nuevo estado para tracking
  };
};
