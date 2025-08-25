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

  // Debounce para validación de todos los campos

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const newFieldValidation = {};

      // Nombre de usuario
      if (formData.nombreUsuario) {
        newFieldValidation.nombreUsuario = validators.validateName(
          formData.nombreUsuario
        )
          ? 'valid'
          : 'invalid';
      }

      // Email
      if (formData.email) {
        newFieldValidation.email = validators.validateEmail(formData.email)
          ? 'valid'
          : 'invalid';
      }

      // Password
      if (formData.password) {
        newFieldValidation.password = validators.validatePassword(
          formData.password
        )
          ? 'valid'
          : 'invalid';
      }

      // Confirm Password
      if (formData.confirmPassword) {
        newFieldValidation.confirmPassword =
          formData.password === formData.confirmPassword &&
          formData.confirmPassword !== ''
            ? 'valid'
            : 'invalid';
      }

      // Nickname
      if (formData.nickname) {
        if (!validators.validateNickname(formData.nickname)) {
          newFieldValidation.nickname = 'invalid';
          setNicknameAvailable(false);
        } else {
          // Verificar disponibilidad
          setValidatingNickname(true);
          const disponible = await checkNicknameAvailability(formData.nickname);
          setNicknameAvailable(disponible);
          newFieldValidation.nickname = disponible ? 'valid' : 'invalid';
          setValidatingNickname(false);
        }
      }

      setFieldValidation((prev) => ({ ...prev, ...newFieldValidation }));
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData]);

  // Validación completa al enviar
  const validateForm = useCallback(() => {
    const errors = {};

    if (
      !formData.nombreUsuario ||
      !validators.validateName(formData.nombreUsuario)
    ) {
      errors.nombreUsuario = 'Nombre inválido';
    }

    if (!formData.nickname) errors.nickname = 'Nickname obligatorio';
    else if (!validators.validateNickname(formData.nickname))
      errors.nickname = 'Nickname inválido';
    else if (!nicknameAvailable) errors.nickname = 'Nickname ya en uso';

    if (!formData.email || !validators.validateEmail(formData.email))
      errors.email = 'Email inválido';

    if (!formData.password || !validators.validatePassword(formData.password))
      errors.password = 'Contraseña inválida';

    if (
      !formData.confirmPassword ||
      formData.password !== formData.confirmPassword
    )
      errors.confirmPassword = 'Contraseñas no coinciden';

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
  };
};
