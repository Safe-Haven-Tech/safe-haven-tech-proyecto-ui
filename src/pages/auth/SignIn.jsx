import React, { useState, useCallback, useMemo, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';

import LoginForm from '../../components/Login/LoginForm';
import WelcomeSection from '../../components/Login/WelcomeSection';
import background from '../../assets/FondoLogin.png';
import { useAuth } from '../../context/useAuth';
import { sanitizeInput } from '../../utils/validators';
import { styles } from '../../utils/stylesLogin';

export default function SignInPage() {
  const navigate = useNavigate();
  const { setToken, setRefreshToken, actualizarUsuario } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const maxAttempts = 10;
  const lockoutDuration = 5 * 60 * 1000;

  const cleanupTimeoutRef = useRef(null);

  // Validación del formulario
  const isFormValid = useMemo(() => email && password, [email, password]);

  // Manejo de bloqueo temporal
  React.useEffect(() => {
    if (lockoutTime > 0) {
      cleanupTimeoutRef.current = setTimeout(() => {
        setAttempts(0);
        setLockoutTime(0);
        setError(null);
      }, lockoutTime - Date.now());
    }

    return () =>
      cleanupTimeoutRef.current && clearTimeout(cleanupTimeoutRef.current);
  }, [lockoutTime]);

  // Submit
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!isFormValid) {
        setError('Por favor completa todos los campos correctamente.');
        return;
      }

      if (attempts >= maxAttempts && lockoutTime > Date.now()) {
        setError('Demasiados intentos fallidos. Intenta nuevamente más tarde.');
        return;
      }

      setError(null);
      setSuccess(null);
      setLoading(true);

      try {
        const { iniciarSesion } = await import('../../services/authServices');
        const data = await iniciarSesion({
          correo: sanitizeInput(email),
          contraseña: sanitizeInput(password),
        });

        if (data.accessToken) {
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          setToken(data.accessToken);
          setRefreshToken(data.refreshToken);

          const decoded = JSON.parse(atob(data.accessToken.split('.')[1]));
          actualizarUsuario(decoded);

          setSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
          setAttempts(0);
          setLockoutTime(0);

          setTimeout(() => navigate('/', { replace: true }), 1500);
        } else {
          setError('Error en la respuesta del servidor. Intenta de nuevo.');
        }
      } catch (err) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (
          err.message.includes('Autenticación fallida') ||
          err.message.includes('Credenciales')
        ) {
          if (newAttempts >= maxAttempts) {
            setLockoutTime(Date.now() + lockoutDuration);
            setError(
              'Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente.'
            );
          } else {
            setError(
              `Credenciales incorrectas. Intento ${newAttempts} de ${maxAttempts}.`
            );
          }
        } else {
          setError(err.message || 'Error al iniciar sesión. Intenta de nuevo.');
        }
      } finally {
        setLoading(false);
      }
    },
    [
      email,
      password,
      attempts,
      lockoutTime,
      isFormValid,
      navigate,
      setToken,
      setRefreshToken,
      actualizarUsuario,
      lockoutDuration,
    ]
  );

  const memoizedLoginForm = useMemo(
    () => (
      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={error}
        success={success}
        loading={loading}
        handleSubmit={handleSubmit}
        attempts={attempts}
        maxAttempts={maxAttempts}
        lockoutTime={lockoutTime}
      />
    ),
    [
      email,
      password,
      error,
      success,
      loading,
      handleSubmit,
      attempts,
      maxAttempts,
      lockoutTime,
    ]
  );

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Overlay */}
      <div
        className="position-absolute w-100 h-100"
        style={{
          top: 0,
          left: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1,
        }}
      ></div>

      {/* Contenedor principal */}
      <div
        className="container-fluid position-relative p-0 h-100"
        style={{ zIndex: 2, maxHeight: '100vh' }}
      >
        <div className="row justify-content-between align-items-stretch h-100 g-0">
          {/* Panel izquierdo */}
          <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center">
            <WelcomeSection />
          </div>

          {/* Panel derecho */}
          <div className="col-lg-5 col-xl-4 p-0 h-100">
            <div className="p-3" style={styles.formContainer}>
              <Suspense fallback={<div>Cargando...</div>}>
                {memoizedLoginForm}
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
