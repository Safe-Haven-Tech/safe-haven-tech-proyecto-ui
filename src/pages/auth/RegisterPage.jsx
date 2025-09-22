import React, { Suspense, useMemo, useCallback, useState } from 'react';
import styles from './RegisterPage.module.css';
import RegisterForm from '../../components/Register/RegisterForm';
import background from '../../assets/FondoRegister.png';
import { sanitizeInput } from '../../utils/validators';
import { registrarUsuario } from '../../services/authServices';
import { useFormValidation } from '../../hooks/useFormValidator';

export default function RegisterPage() {
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

  const {
    formData,
    setFormData,
    validationErrors,
    fieldValidation,
    validatingNickname,
    nicknameAvailable,
    validateForm,
    handleFieldBlur,
  } = useFormValidation(initialFormData);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Submit handler
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
        
        // Usar navigate en lugar de window.location
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } catch (err) {
        console.error('Error en registro:', err);
        setError(err.message || 'Error al crear la cuenta. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    },
    [formData, validateForm, validatingNickname]
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

  const ErrorFallback = ({ error }) => (
    <div className={styles.errorState}>
      <div className={styles.errorTitle}>Error al cargar</div>
      <div className={styles.errorMessage}>
        {error?.message || 'Hubo un problema al cargar el formulario'}
      </div>
    </div>
  );

  return (
    <div
      className={styles.registerContainer}
      style={{ backgroundImage: `url(${background})` }}
    >
      {/* Overlay mejorado */}
      <div className={styles.overlay}></div>

      {/* Contenedor principal */}
      <div className={styles.contentContainer}>
        <div className={styles.formWrapper}>
          <Suspense fallback={<LoadingFallback />}>
            {memoizedForm}
          </Suspense>
        </div>
      </div>
    </div>
  );
}