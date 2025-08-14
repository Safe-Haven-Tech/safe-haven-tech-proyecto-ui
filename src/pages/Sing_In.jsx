import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import background from '../assets/FondoLogin.png';
import Logo from '../assets/Logo.png';

// Componente del formulario de login movido fuera para evitar re-renders
const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  error,
  loading,
  handleSubmit,
}) => (
  <div className="w-100 h-100 d-flex flex-column justify-content-center px-4">
    {/* Header del formulario */}
    <div className="text-center mb-5">
      <div className="d-flex justify-content-center align-items-center mb-4">
        <img
          src={Logo}
          alt="SafeHaven Logo"
          style={{
            height: 80,
            width: 'auto',
            borderRadius: 12,
          }}
        />
      </div>
      <h2 className="fw-bold text-dark mb-3" style={{ fontSize: '2.2rem' }}>
        Iniciar Sesión
      </h2>
      <p className="text-muted fs-5" style={{ opacity: 0.8 }}>
        Accede a tu cuenta segura
      </p>
    </div>

    {/* Formulario */}
    <form onSubmit={handleSubmit} className="mb-4">
      {/* Campo de email */}
      <div className="mb-4">
        <label
          htmlFor="email"
          className="form-label fw-semibold text-dark mb-3"
          style={{ fontSize: '1.1rem' }}
        >
          <i className="fas fa-envelope me-2 text-success"></i>
          Correo Electrónico
        </label>
        <input
          type="email"
          id="email"
          className="form-control form-control-lg border-2"
          style={{
            borderRadius: '16px',
            borderColor: '#e5e7eb',
            padding: '16px 20px',
            fontSize: '1.1rem',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          disabled={loading}
          required
        />
      </div>

      {/* Campo de contraseña */}
      <div className="mb-4">
        <label
          htmlFor="password"
          className="form-label fw-semibold text-dark mb-3"
          style={{ fontSize: '1.1rem' }}
        >
          <i className="fas fa-lock me-2 text-success"></i>
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          className="form-control form-control-lg border-2"
          style={{
            borderRadius: '16px',
            borderColor: '#e5e7eb',
            padding: '16px 20px',
            fontSize: '1.1rem',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={loading}
          required
        />
      </div>

      {/* Opciones adicionales */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div className="form-check">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="form-check-input border-2"
            style={{
              borderRadius: '6px',
              width: '20px',
              height: '20px',
            }}
          />
          <label
            htmlFor="remember-me"
            className="form-check-label text-muted ms-2"
            style={{ fontSize: '1rem' }}
          >
            Recordarme
          </label>
        </div>
        <a
          href="#"
          className="text-decoration-none text-success fw-semibold"
          style={{ fontSize: '1rem' }}
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div
          className="alert alert-danger border-0 rounded-4 py-3 mb-4"
          style={{
            fontSize: '1rem',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
          }}
          role="alert"
        >
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Botón de envío */}
      <button
        type="submit"
        className="btn btn-success btn-lg w-100 rounded-4 fw-semibold py-4 mb-4"
        style={{
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          border: 'none',
          boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)',
          fontSize: '1.2rem',
          transition: 'all 0.3s ease',
        }}
        disabled={loading}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 12px 35px rgba(34, 197, 94, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)';
        }}
      >
        {loading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
            ></span>
            Iniciando sesión...
          </>
        ) : (
          <>
            <i className="fas fa-sign-in-alt me-2"></i>
            Iniciar Sesión
          </>
        )}
      </button>
    </form>

    {/* Footer del formulario */}
    <div className="text-center mt-auto">
      <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>
        ¿No tienes una cuenta?{' '}
        <a href="#" className="text-success fw-semibold text-decoration-none">
          Regístrate aquí
        </a>
      </p>
    </div>
  </div>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('Inicio de sesión simulado exitoso');
    } catch {
      setError('Error en inicio de sesión. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Componente del texto de bienvenida
  const WelcomeSection = () => (
    <div
      className="col-md-6 d-none d-md-flex align-items-center justify-content-center"
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        className="text-center px-4 py-5 rounded-4"
        style={{
          background: 'rgba(64, 64, 64, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="mb-4"></div>
        <h1
          className="display-6 fw-bold mb-3 text-white"
          style={{
            textShadow:
              '3px 3px 12px rgba(0, 0, 0, 0.9), 0 0 25px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 0, 0, 0.6)',
            filter:
              'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 16px rgba(255, 255, 255, 0.2))',
          }}
        >
          ¡Bienvenido a SafeHaven!
        </h1>
        <p
          className="lead mb-4 text-white"
          style={{
            opacity: 0.95,
            textShadow:
              '2px 2px 8px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 0, 0, 0.7)',
            filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.2))',
          }}
        >
          Tu espacio seguro para encontrar apoyo, recursos y conexiones que te
          ayuden en tu bienestar mental.
        </p>
        <div className="d-flex justify-content-center gap-4">
          <div className="text-center">
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-2"
              style={{
                width: '60px',
                height: '60px',
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))',
                borderRadius: '50%',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow:
                  '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow =
                  '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow =
                  '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.1)';
              }}
            >
              <i
                className="fas fa-heart text-white"
                style={{ fontSize: '1.5rem' }}
              ></i>
            </div>
            <small
              className="text-white fw-semibold"
              style={{
                textShadow:
                  '2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 15px rgba(0, 0, 0, 0.7)',
                filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.2))',
              }}
            >
              Apoyo
            </small>
          </div>
          <div className="text-center">
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-2"
              style={{
                width: '60px',
                height: '60px',
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))',
                borderRadius: '50%',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow:
                  '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow =
                  '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow =
                  '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.1)';
              }}
            >
              <i
                className="fas fa-users text-white"
                style={{ fontSize: '1.5rem' }}
              ></i>
            </div>
            <small
              className="text-white fw-semibold"
              style={{
                textShadow:
                  '2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 15px rgba(0, 0, 0, 0.7)',
                filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.2))',
              }}
            >
              Comunidad
            </small>
          </div>
          <div className="text-center">
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-2"
              style={{
                width: '60px',
                height: '60px',
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))',
                borderRadius: '50%',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow:
                  '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow =
                  '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow =
                  '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.1)';
              }}
            >
              <i
                className="fas fa-lightbulb text-white"
                style={{ fontSize: '1.5rem' }}
              ></i>
            </div>
            <small
              className="text-white fw-semibold"
              style={{
                textShadow:
                  '2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 15px rgba(0, 0, 0, 0.7)',
                filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.2))',
              }}
            >
              Recursos
            </small>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center w-100 position-relative"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        width: '100vw',
        margin: '0',
        padding: '0',
      }}
    >
      {/* Overlay con difuminado para la imagen de fondo */}
      <div
        className="position-absolute w-100 h-100"
        style={{
          top: 0,
          left: 0,
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(2px)',
          zIndex: 1,
        }}
      ></div>

      {/* Contenedor principal con z-index mayor */}
      <div
        className="container-fluid position-relative p-0"
        style={{ zIndex: 2 }}
      >
        <div className="row justify-content-between align-items-center min-vh-100 g-0">
          {/* Panel izquierdo - Mensaje de bienvenida */}
          <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center">
            <WelcomeSection />
          </div>

          {/* Panel derecho - Formulario de login completamente a la derecha */}
          <div className="col-lg-5 col-xl-4 p-0">
            <div
              className="shadow-2xl p-5"
              style={{
                height: '100vh',
                width: '100%',
                backgroundColor: '#dae1e8    ',
                boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.1)',
                borderRadius: '0 0 0 1rem',
              }}
            >
              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                error={error}
                loading={loading}
                handleSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
