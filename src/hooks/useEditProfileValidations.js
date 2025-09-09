// src/hooks/useEditarPerfilValidation.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { LIMITES } from '../utils/validators';
import { verificarNickname } from '../services/profileServices';

export const useEditarPerfilValidation = (initialData = {}) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombreCompleto: initialData.nombreCompleto || '',
    nombreUsuario: initialData.nombreUsuario || '',
    pronombres: initialData.pronombres || '',
    biografia: initialData.biografia || '',
    ...initialData,
  });

  // Estados de validación
  const [errors, setErrors] = useState({});
  const [fieldStates, setFieldStates] = useState({});
  const [validatingNickname, setValidatingNickname] = useState(false);
  const [nicknameDisponible, setNicknameDisponible] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);

  // Referencias para debounce
  const debounceTimers = useRef({});
  const originalNickname = useRef(initialData.nombreUsuario);

  const originalData = useRef({
    nombreCompleto: initialData.nombreCompleto || '',
    nombreUsuario: initialData.nombreUsuario || '',
    pronombres: initialData.pronombres || '',
    biografia: initialData.biografia || '',
  });

  // Funciones de validación con mensajes específicos
  const validateNombreCompleto = (nombre) => {
    if (!nombre || !nombre.trim()) {
      return 'El nombre completo es obligatorio';
    }

    const trimmedNombre = nombre.trim();
    if (trimmedNombre.length < LIMITES.NOMBRE.MIN) {
      return `El nombre debe tener al menos ${LIMITES.NOMBRE.MIN} caracteres`;
    }

    if (trimmedNombre.length > LIMITES.NOMBRE.MAX) {
      return `El nombre no puede superar los ${LIMITES.NOMBRE.MAX} caracteres`;
    }

    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    if (!regex.test(trimmedNombre)) {
      return 'El nombre solo puede contener letras, espacios y acentos';
    }

    return null;
  };

  const validateNickname = (nickname) => {
    if (!nickname || !nickname.trim()) {
      return 'El nickname es obligatorio';
    }

    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length < LIMITES.NICKNAME.MIN) {
      return `El nickname debe tener al menos ${LIMITES.NICKNAME.MIN} caracteres`;
    }

    if (trimmedNickname.length > LIMITES.NICKNAME.MAX) {
      return `El nickname no puede superar los ${LIMITES.NICKNAME.MAX} caracteres`;
    }

    const regex = /^[a-zA-Z0-9_]+$/;
    if (!regex.test(trimmedNickname)) {
      return 'El nickname solo puede contener letras, números y guiones bajos (_)';
    }

    return null;
  };

  const validatePronombres = (pronombres) => {
    if (!pronombres) return null; // Campo opcional

    if (pronombres.length > LIMITES.PRONOMBRES.MAX) {
      return `Los pronombres no pueden superar los ${LIMITES.PRONOMBRES.MAX} caracteres`;
    }

    // Validación básica de caracteres permitidos
    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ/\s]+$/;
    if (!regex.test(pronombres)) {
      return 'Los pronombres solo pueden contener letras, espacios y barras (/)';
    }

    return null;
  };

  const validateBiografia = (biografia) => {
    if (!biografia) return null; // Campo opcional

    if (biografia.length > LIMITES.BIOGRAFIA.MAX) {
      return `La biografía no puede superar los ${LIMITES.BIOGRAFIA.MAX} caracteres`;
    }

    return null;
  };

  // Validación individual de campos con debounce
  const validateField = useCallback(async (fieldName, value) => {
    // Limpiar timer anterior
    if (debounceTimers.current[fieldName]) {
      clearTimeout(debounceTimers.current[fieldName]);
    }

    // Establecer estado de validación pendiente
    setFieldStates((prev) => ({
      ...prev,
      [fieldName]: 'validating',
    }));

    return new Promise((resolve) => {
      debounceTimers.current[fieldName] = setTimeout(async () => {
        let error = null;
        let isValid = false;

        switch (fieldName) {
          case 'nombreCompleto':
            error = validateNombreCompleto(value);
            isValid = !error;
            break;

          case 'nombreUsuario':
            error = validateNickname(value);
            if (!error) {
              // Solo verificar disponibilidad si el nickname cambió
              if (value !== originalNickname.current) {
                setValidatingNickname(true);
                try {
                  const disponible = await verificarNickname(value);
                  setNicknameDisponible(disponible);
                  if (!disponible) {
                    error = 'Este nickname ya está en uso';
                  }
                  isValid = disponible;
                } catch (err) {
                  console.log(err);
                  error = 'Error al verificar disponibilidad del nickname';
                  isValid = false;
                } finally {
                  setValidatingNickname(false);
                }
              } else {
                setNicknameDisponible(true);
                isValid = true;
              }
            }
            break;

          case 'pronombres':
            error = validatePronombres(value);
            isValid = !error;
            break;

          case 'biografia':
            error = validateBiografia(value);
            isValid = !error;
            break;

          default:
            isValid = true;
        }

        // Actualizar errores
        setErrors((prev) => ({
          ...prev,
          [fieldName]: error,
        }));

        // Actualizar estado del campo
        setFieldStates((prev) => ({
          ...prev,
          [fieldName]: isValid ? 'valid' : 'invalid',
        }));

        resolve({ isValid, error });
      }, 300); // 300ms debounce
    });
  }, []);

  // Actualizar campo del formulario
  const updateField = useCallback(
    (fieldName, value) => {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));

      // Validar el campo
      validateField(fieldName, value);
    },
    [validateField]
  );

  // Validar todo el formulario
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validar todos los campos obligatorios
    const nombreError = validateNombreCompleto(formData.nombreCompleto);
    if (nombreError) newErrors.nombreCompleto = nombreError;

    const nicknameError = validateNickname(formData.nombreUsuario);
    if (nicknameError) newErrors.nombreUsuario = nicknameError;
    else if (
      !nicknameDisponible &&
      formData.nombreUsuario !== originalNickname.current
    ) {
      newErrors.nombreUsuario = 'Este nickname ya está en uso';
    }

    // Validar campos opcionales si tienen contenido
    if (formData.pronombres) {
      const pronombresError = validatePronombres(formData.pronombres);
      if (pronombresError) newErrors.pronombres = pronombresError;
    }

    if (formData.biografia) {
      const biografiaError = validateBiografia(formData.biografia);
      if (biografiaError) newErrors.biografia = biografiaError;
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0 && !validatingNickname;
    setIsFormValid(isValid);

    return isValid;
  }, [formData, nicknameDisponible, validatingNickname]);

  // Resetear validaciones
  const resetValidation = useCallback(() => {
    setErrors({});
    setFieldStates({});
    setIsFormValid(false);
  }, []);

  // Obtener mensaje de ayuda para biografía con contador
  const getBiografiaHelperText = useCallback(() => {
    const length = formData.biografia?.length || 0;
    const remaining = LIMITES.BIOGRAFIA.MAX - length;

    if (remaining < 20) {
      return `${remaining} caracteres restantes`;
    }

    return `${length}/${LIMITES.BIOGRAFIA.MAX} caracteres`;
  }, [formData.biografia]);

  const hasChanges = useCallback(() => {
    return Object.keys(formData).some(
      (key) => formData[key] !== originalData.current[key]
    );
  }, [formData]);

  // Efecto para validar el formulario cuando cambien los errores
  useEffect(() => {
    const hasErrors = Object.values(errors).some((error) => error !== null);
    const hasRequiredFields = formData.nombreCompleto && formData.nombreUsuario;

    setIsFormValid(
      !hasErrors &&
        hasRequiredFields &&
        !validatingNickname &&
        (formData.nombreUsuario === originalNickname.current ||
          nicknameDisponible)
    );
  }, [
    errors,
    formData.nombreCompleto,
    formData.nombreUsuario,
    validatingNickname,
    nicknameDisponible,
  ]);

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  return {
    // Datos del formulario
    formData,
    updateField,

    // Estados de validación
    errors,
    fieldStates,
    isFormValid,

    // Estados específicos del nickname
    validatingNickname,
    nicknameDisponible,

    // Funciones de utilidad
    validateForm,
    resetValidation,
    hasChanges,
    getBiografiaHelperText,

    // Getters para estados específicos
    getFieldState: (fieldName) => fieldStates[fieldName],
    getFieldError: (fieldName) => errors[fieldName],
    isFieldValid: (fieldName) => fieldStates[fieldName] === 'valid',
    isFieldInvalid: (fieldName) => fieldStates[fieldName] === 'invalid',
    isFieldValidating: (fieldName) => fieldStates[fieldName] === 'validating',
  };
};
