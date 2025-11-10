import { useState, useEffect, useCallback, useRef } from 'react';
import * as validators from '../utils/validators';
import { checkNicknameAvailability } from '../services/validationService';

/**
 * useFormValidator
 * - Hook de validación de formularios con debounce y validación async para nickname.
 * - Provee helpers: setField, handleChange, handleBlur, validateForm y resetForm.
 */
export const useFormValidator = (
  initialData = {},
  opts = { debounce: 300 }
) => {
  const { debounce = 300 } = opts;

  const [formData, setFormData] = useState(initialData);
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldValidation, setFieldValidation] = useState({});
  const [validatingNickname, setValidatingNickname] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(true);
  const [touchedFields, setTouchedFields] = useState({});

  const nicknameReqRef = useRef({ token: 0 });

  const handleFieldBlur = useCallback((fieldName) => {
    setTouchedFields((s) => ({ ...s, [fieldName]: true }));
  }, []);

  const setField = useCallback((name, value) => {
    setFormData((f) => ({ ...f, [name]: value }));
    // reset previous error for the field while user types
    setValidationErrors((e) => {
      const next = { ...e };
      delete next[name];
      return next;
    });
    setFieldValidation((fv) => ({ ...fv, [name]: undefined }));
  }, []);

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked, files } = e.target;
      const val = type === 'checkbox' ? checked : files ? files : value;
      setField(name, val);
    },
    [setField]
  );

  const validateFieldSync = useCallback(
    (name, value) => {
      switch (name) {
        case 'nombreUsuario':
          return validators.validateNickname(value)
            ? null
            : `Nickname inválido (entre ${validators.LIMITES.NICKNAME.MIN}-${validators.LIMITES.NICKNAME.MAX} caracteres, solo letras, números y _)`;
        case 'email':
          return validators.validateEmail(value) ? null : 'Email inválido';
        case 'password':
          return validators.validatePassword(value)
            ? null
            : 'Contraseña inválida';
        case 'confirmPassword':
          return value === formData.password
            ? null
            : 'Contraseñas no coinciden';
        case 'nickname':
          return validators.validateNickname(value)
            ? null
            : 'Nickname inválido';
        default:
          return null;
      }
    },
    [formData.password]
  );

  // Debounced validation (sync + async nickname)
  useEffect(() => {
    const timer = setTimeout(() => {
      const updates = {};
      let needsUpdate = false;

      Object.keys(touchedFields).forEach((field) => {
        if (!touchedFields[field]) return;
        const val = formData[field];
        const err = validateFieldSync(field, val);
        updates[field] = err ? 'invalid' : 'valid';
        needsUpdate = true;
      });

      if (needsUpdate) {
        setFieldValidation((prev) => ({ ...prev, ...updates }));
      }

      // Async nickname validation
      const nick = formData.nickname;
      if (
        touchedFields.nickname &&
        nick &&
        !validateFieldSync('nickname', nick)
      ) {
        const token = ++nicknameReqRef.current.token;
        setValidatingNickname(true);
        (async () => {
          try {
            const disponible = await checkNicknameAvailability(nick);
            if (token !== nicknameReqRef.current.token) return;
            setNicknameAvailable(Boolean(disponible));
            setFieldValidation((prev) => ({
              ...prev,
              nickname: disponible ? 'valid' : 'invalid',
            }));
          } catch {
            if (token !== nicknameReqRef.current.token) return;
            setNicknameAvailable(false);
            setFieldValidation((prev) => ({ ...prev, nickname: 'invalid' }));
          } finally {
            if (token === nicknameReqRef.current.token)
              setValidatingNickname(false);
          }
        })();
      }
    }, debounce);

    return () => clearTimeout(timer);
  }, [formData, touchedFields, debounce, validateFieldSync]);

  // Full form validation (synchronous + relies on nicknameAvailable for async)
  const validateForm = useCallback(() => {
    const errors = {};

    // nombreUsuario
    if (!formData.nombreUsuario || !validators.validateNickname(formData.nombreUsuario)) {
      errors.nombreUsuario = `Nickname inválido (entre ${validators.LIMITES.NICKNAME.MIN}-${validators.LIMITES.NICKNAME.MAX} caracteres, solo letras, números y _)`;
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
    if (
      !formData.confirmPassword ||
      formData.password !== formData.confirmPassword
    ) {
      errors.confirmPassword = 'Contraseñas no coinciden';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, nicknameAvailable]);

  const resetForm = useCallback(
    (newData = initialData) => {
      setFormData(newData);
      setValidationErrors({});
      setFieldValidation({});
      setTouchedFields({});
      setNicknameAvailable(true);
      setValidatingNickname(false);
      nicknameReqRef.current.token = 0;
    },
    [initialData]
  );

  return {
    formData,
    setFormData,
    setField,
    handleChange,
    handleFieldBlur,
    validationErrors,
    fieldValidation,
    validatingNickname,
    nicknameAvailable,
    touchedFields,
    validateForm,
    resetForm,
  };
};

export default useFormValidator;
