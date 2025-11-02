import { useState, useEffect, useCallback, useRef } from 'react';
import { LIMITES } from '../utils/validators';
import { verificarNickname } from '../services/profileServices';

/**
 * Hook de validación para editar perfil.
 * - Debounce por campo.
 * - Validación asíncrona de nickname con manejo de concurrencia.
 * - Devuelve helpers y estados útiles para el formulario.
 */
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

  // Referencias para debounce y concurrencia
  const debounceTimers = useRef({});
  const originalNickname = useRef(initialData.nombreUsuario);
  const mounted = useRef(true);
  const nicknameRequestCounter = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // limpiar timers
      Object.values(debounceTimers.current).forEach((t) => t && clearTimeout(t));
    };
  }, []);

  const originalData = useRef({
    nombreCompleto: initialData.nombreCompleto || '',
    nombreUsuario: initialData.nombreUsuario || '',
    pronombres: initialData.pronombres || '',
    biografia: initialData.biografia || '',
  });

  /* ---------- validadores por campo ---------- */

  const validateNombreCompleto = (nombre) => {
    if (!nombre || !nombre.trim()) return 'El nombre completo es obligatorio';

    const trimmed = nombre.trim();
    if (trimmed.length < LIMITES.NOMBRE.MIN)
      return `El nombre debe tener al menos ${LIMITES.NOMBRE.MIN} caracteres`;
    if (trimmed.length > LIMITES.NOMBRE.MAX)
      return `El nombre no puede superar los ${LIMITES.NOMBRE.MAX} caracteres`;

    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    if (!regex.test(trimmed)) return 'El nombre solo puede contener letras, espacios y acentos';

    return null;
  };

  const validateNickname = (nickname) => {
    if (!nickname || !nickname.trim()) return 'El nickname es obligatorio';
    const t = nickname.trim();
    if (t.length < LIMITES.NICKNAME.MIN)
      return `El nickname debe tener al menos ${LIMITES.NICKNAME.MIN} caracteres`;
    if (t.length > LIMITES.NICKNAME.MAX)
      return `El nickname no puede superar los ${LIMITES.NICKNAME.MAX} caracteres`;
    const regex = /^[a-zA-Z0-9_]+$/;
    if (!regex.test(t)) return 'El nickname solo puede contener letras, números y guiones bajos (_)';
    return null;
  };

  const validatePronombres = (pronombres) => {
    if (!pronombres) return null;
    if (pronombres.length > LIMITES.PRONOMBRES.MAX)
      return `Los pronombres no pueden superar los ${LIMITES.PRONOMBRES.MAX} caracteres`;
    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ/\s]+$/;
    if (!regex.test(pronombres)) return 'Los pronombres solo pueden contener letras, espacios y barras (/)';
    return null;
  };

  const validateBiografia = (biografia) => {
    if (!biografia) return null;
    if (biografia.length > LIMITES.BIOGRAFIA.MAX)
      return `La biografía no puede superar los ${LIMITES.BIOGRAFIA.MAX} caracteres`;
    return null;
  };

  /* ---------- validación individual con debounce ---------- */

  const validateField = useCallback(
    async (fieldName, value) => {
      // limpiar timer anterior
      if (debounceTimers.current[fieldName]) {
        clearTimeout(debounceTimers.current[fieldName]);
      }

      // marcar validando
      setFieldStates((prev) => ({ ...prev, [fieldName]: 'validating' }));

      return new Promise((resolve) => {
        debounceTimers.current[fieldName] = setTimeout(async () => {
          let error = null;
          let isValid = true;

          try {
            switch (fieldName) {
              case 'nombreCompleto':
                error = validateNombreCompleto(value);
                isValid = !error;
                break;

              case 'nombreUsuario': {
                error = validateNickname(value);
                if (!error) {
                  // verificar disponibilidad solo si cambió respecto al original
                  if (value !== originalNickname.current) {
                    const reqId = ++nicknameRequestCounter.current;
                    setValidatingNickname(true);
                    try {
                      const disponible = await verificarNickname(value);
                      if (!mounted.current) return resolve({ isValid: false, error: 'Interrumpido' });
                      // ignorar respuestas antiguas
                      if (reqId !== nicknameRequestCounter.current) return resolve({ isValid: false, error: null });
                      setNicknameDisponible(Boolean(disponible));
                      if (!disponible) {
                        error = 'Este nickname ya está en uso';
                        isValid = false;
                      } else {
                        isValid = true;
                      }
                    } catch (err) {
                      // eslint-disable-next-line no-console
                      console.error('validateField verificarNickname error:', err?.message || err);
                      error = 'Error al verificar disponibilidad del nickname';
                      isValid = false;
                    } finally {
                      if (reqId === nicknameRequestCounter.current && mounted.current) setValidatingNickname(false);
                    }
                  } else {
                    setNicknameDisponible(true);
                    isValid = true;
                  }
                } else {
                  isValid = false;
                }
                break;
              }

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
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('validateField error:', err?.message || err);
            error = 'Error de validación';
            isValid = false;
          }

          // actualizar errores y estado del campo
          if (mounted.current) {
            setErrors((prev) => ({ ...prev, [fieldName]: error }));
            setFieldStates((prev) => ({ ...prev, [fieldName]: isValid ? 'valid' : 'invalid' }));
          }

          resolve({ isValid, error });
        }, 300);
      });
    },
    []
  );

  /* ---------- helpers para UI ---------- */

  const updateField = useCallback(
    (fieldName, value) => {
      setFormData((prev) => ({ ...prev, [fieldName]: value }));
      validateField(fieldName, value);
    },
    [validateField]
  );

  const validateForm = useCallback(() => {
    const newErrors = {};

    const nErr = validateNombreCompleto(formData.nombreCompleto);
    if (nErr) newErrors.nombreCompleto = nErr;

    const nnErr = validateNickname(formData.nombreUsuario);
    if (nnErr) newErrors.nombreUsuario = nnErr;
    else if (!nicknameDisponible && formData.nombreUsuario !== originalNickname.current)
      newErrors.nombreUsuario = 'Este nickname ya está en uso';

    if (formData.pronombres) {
      const pErr = validatePronombres(formData.pronombres);
      if (pErr) newErrors.pronombres = pErr;
    }

    if (formData.biografia) {
      const bErr = validateBiografia(formData.biografia);
      if (bErr) newErrors.biografia = bErr;
    }

    setErrors(newErrors);
    const ok = Object.keys(newErrors).length === 0 && !validatingNickname;
    setIsFormValid(ok);
    return ok;
  }, [formData, nicknameDisponible, validatingNickname]);

  const resetValidation = useCallback(() => {
    setErrors({});
    setFieldStates({});
    setIsFormValid(false);
  }, []);

  const getBiografiaHelperText = useCallback(() => {
    const length = formData.biografia?.length || 0;
    const remaining = LIMITES.BIOGRAFIA.MAX - length;
    return remaining < 20 ? `${remaining} caracteres restantes` : `${length}/${LIMITES.BIOGRAFIA.MAX} caracteres`;
  }, [formData.biografia]);

  const hasChanges = useCallback(() => {
    return Object.keys(formData).some((key) => formData[key] !== originalData.current[key]);
  }, [formData]);

  /* ---------- efecto para estado general del formulario ---------- */

  useEffect(() => {
    const hasErrors = Object.values(errors).some((e) => e != null);
    const hasRequired = formData.nombreCompleto && formData.nombreUsuario;
    setIsFormValid(!hasErrors && hasRequired && !validatingNickname && (formData.nombreUsuario === originalNickname.current || nicknameDisponible));
  }, [errors, formData.nombreCompleto, formData.nombreUsuario, validatingNickname, nicknameDisponible]);

  return {
    // datos y setters
    formData,
    updateField,

    // validación
    errors,
    fieldStates,
    isFormValid,

    // nickname
    validatingNickname,
    nicknameDisponible,

    // utilidades
    validateForm,
    resetValidation,
    hasChanges,
    getBiografiaHelperText,

    // getters por campo
    getFieldState: (f) => fieldStates[f],
    getFieldError: (f) => errors[f],
    isFieldValid: (f) => fieldStates[f] === 'valid',
    isFieldInvalid: (f) => fieldStates[f] === 'invalid',
    isFieldValidating: (f) => fieldStates[f] === 'validating',
  };
};

export default useEditarPerfilValidation;
