import React, { useState, useCallback, useMemo, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignIn.module.css';
import LoginForm from '../../components/Login/LoginForm';
import WelcomeSection from '../../components/Login/WelcomeSection';
import background from '../../assets/FondoLogin.png';
import { useAuth } from '../../context/useAuth';
import { sanitizeInput } from '../../utils/validators';

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

  const LoadingFallback = () => (
    <div className={styles.loadingFallback}>
      <div className={styles.loadingSpinner}></div>
      Cargando...
    </div>
  );

  return (
    <div
      className={`d-flex align-items-center justify-content-center ${styles.signInContainer}`}
      style={{ backgroundImage: `url(${background})` }}
    >
      {/* Overlay mejorado */}
      <div className={styles.overlay}></div>

      {/* Contenedor principal */}
      <div className={`container-fluid position-relative p-0 h-100 ${styles.contentContainer}`}>
        <div className={`row justify-content-between align-items-stretch h-100 g-0 ${styles.mainRow}`}>
          {/* Panel izquierdo */}
          <div className={`col-lg-6 ${styles.leftPanel}`}>
            <WelcomeSection />
          </div>

          {/* Panel derecho */}
          <div className={`col-lg-5 col-xl-4 ${styles.rightPanel}`}>
            <div className={styles.formContainer}>
              <Suspense fallback={<LoadingFallback />}>
                {memoizedLoginForm}
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}