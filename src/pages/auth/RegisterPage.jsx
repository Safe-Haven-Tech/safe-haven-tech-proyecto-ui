import React, { Suspense, useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RegisterPage.module.css';
import RegisterForm from '../../components/Register/RegisterForm';
import background from '../../assets/FondoRegister.png';
import { sanitizeInput } from '../../utils/validators';
import { registrarUsuario } from '../../services/authServices';
import useFormValidator from '../../hooks/useFormValidator'; 

/**
 * Página de registro.
 * Usa el hook de validación de formularios (useFormValidator) y navega al login
 * tras el registro exitoso. Los mensajes de error/éxito se muestran aquí,
 * el formulario queda a cargo del componente RegisterForm.
 */
export default function RegisterPage() {
  const navigate = useNavigate();

  const initialFormData = {
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
  };

  // Usar el hook correcto (importado por defecto)
  const {
    formData,
    setFormData,
    validationErrors,
    fieldValidation,
    validatingNickname,
    nicknameAvailable,
    validateForm,
    handleFieldBlur,
  } = useFormValidator(initialFormData);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handler de envío del formulario
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        setError('Por favor corrige los errores en el formulario');
        return;
      }

      if (validatingNickname) {
        setError('Esperando validación del nickname');
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
          genero: formData.genero || '',
          pronombres: formData.pronombres || '',
          biografia: formData.biografia || '',
        };

        await registrarUsuario(payload);

        setSuccess('¡Cuenta creada exitosamente! Redirigiendo al login...');
        // Navegar con react-router en lugar de reasignar location
        setTimeout(() => {
          navigate('/login');
        }, 1400);
      } catch (err) {
        console.error('Error en registro:', err);
        setError(
          err?.message || 'Error al crear la cuenta. Intenta nuevamente.'
        );
      } finally {
        setLoading(false);
      }
    },
    [formData, validateForm, validatingNickname, navigate]
  );

  const memoizedForm = useMemo(
    () => (
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
        handleFieldBlur={handleFieldBlur}
      />
    ),
    [
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
      handleFieldBlur,
    ]
  );

  const LoadingFallback = () => (
    <div className={styles.loadingFallback}>
      <div className={styles.loadingSpinner}></div>
      Cargando formulario de registro...
    </div>
  );

  const ErrorFallback = ({ error: err }) => (
    <div className={styles.errorState}>
      <div className={styles.errorTitle}>Error al cargar</div>
      <div className={styles.errorMessage}>
        {err?.message || 'Hubo un problema al cargar el formulario'}
      </div>
    </div>
  );

  return (
    <div
      className={styles.registerContainer}
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className={styles.overlay}></div>

      <div className={styles.contentContainer}>
        <div className={styles.formWrapper}>
          <Suspense fallback={<LoadingFallback />}>{memoizedForm}</Suspense>
        </div>
      </div>
    </div>
  );
}
