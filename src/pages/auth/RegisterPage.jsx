// src/pages/Register/Register.jsx
import React, { Suspense, useMemo, useCallback, useState } from 'react';
import RegisterForm from '../../components/Register/RegisterForm';
import background from '../../assets/FondoRegister.png';
import { sanitizeInput } from '../../utils/validators';
import { registrarUsuario } from '../../services/authServices';
import { useFormValidation } from '../../hooks/useFormValidator';

export default function Register() {
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
  } = useFormValidation(initialFormData);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Submit handler
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        setError('Corrige los errores');
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
          genero: formData.genero,
          pronombres: formData.pronombres,
          biografia: formData.biografia,
        };

        await registrarUsuario(payload);
        setSuccess('Cuenta creada, redirigiendo...');
        setTimeout(() => (window.location.href = '/login'), 2000);
      } catch (err) {
        setError(err.message || 'Error al crear la cuenta');
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
    ]
  );

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center w-100 p-3"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#f0f0f0',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          zIndex: 1,
        }}
      />
      <div
        className="position-relative"
        style={{ zIndex: 2, maxWidth: '500px', width: '100%' }}
      >
        <Suspense
          fallback={
            <div className="text-center text-white">Cargando formulario...</div>
          }
        >
          {memoizedForm}
        </Suspense>
      </div>
    </div>
  );
}
