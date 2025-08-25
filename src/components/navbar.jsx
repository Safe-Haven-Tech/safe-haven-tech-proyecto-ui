import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/Logo.png';
import { useAuth } from '../context/useAuth';

export default function Navbar() {
  const { usuario } = useAuth();
  const [_version, setVersion] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleTokenChange = () => setVersion((v) => v + 1);
    window.addEventListener('tokenChanged', handleTokenChange);
    return () => window.removeEventListener('tokenChanged', handleTokenChange);
  }, []);

  const handleProfileClick = () => {
    if (usuario && usuario.nombreUsuario) {
      navigate(`/perfil/${usuario.nombreUsuario}`);
    } else {
      navigate('/perfil');
    }
  };

  const handleSearchClick = () => {
    // lógica para búsqueda
  };

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        backgroundColor: '#A9C5A0',
        padding: '0.6rem 1.5rem',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 9999,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        height: '80px',
        minHeight: '80px',
        maxHeight: '80px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Logo */}
      <Link to="/" className="navbar-brand d-flex align-items-center">
        <img
          src={logo}
          alt="SafeHaven Logo"
          style={{
            height: 60,
            width: 'auto',
            marginRight: 12,
            borderRadius: 8,
          }}
        />
      </Link>

      {/* Toggle menú para móviles */}
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
        style={{
          border: '2px solid #000000',
          borderRadius: 6,
          padding: '4px 8px',
          color: '#000000',
          fontWeight: '700',
          fontSize: '1.25rem',
          lineHeight: 1,
          background: 'transparent',
          transition: 'background-color 0.3s ease',
        }}
      >
        ☰
      </button>

      <div
        className="collapse navbar-collapse justify-content-end"
        id="navbarSupportedContent"
        style={{ position: 'relative', zIndex: 2110 }}
      >
        <ul className="navbar-nav mb-2 mb-lg-0" style={{ marginLeft: 'auto' }}>
          {[
            'Autoevaluación',
            'Recursos informativas',
            'Contacto de expertos',
            'Nuestro foro',
          ].map((item, idx) => {
            const toPath = item.toLowerCase().replace(/\s+/g, '');
            return (
              <li className="nav-item" key={idx}>
                <Link
                  to={`/${toPath}`}
                  className="nav-link"
                  style={{
                    color: '#000000',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    padding: '1rem 1.2rem',
                    margin: '0 0.25rem',
                    borderRadius: 6,
                    transition: 'background-color 0.3s ease, color 0.3s ease',
                    userSelect: 'none',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    lineHeight: 1.2,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#2d5016';
                    e.target.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#000000';
                  }}
                >
                  {item}
                </Link>
              </li>
            );
          })}
        </ul>

        <div
          className="d-flex align-items-center"
          style={{ gap: 24, marginLeft: '1rem' }}
        >
          {/* Botón búsqueda */}
          <button
            onClick={handleSearchClick}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              color: '#000000',
              fontSize: 20,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'color 0.3s ease',
            }}
            aria-label="Buscar posts"
            onMouseEnter={(e) => (e.currentTarget.style.color = '#2d5016')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#000000')}
          >
            🔍
          </button>

          {/* Botón notificaciones (solo para usuarios logueados) */}
          {usuario && (
            <button
              onClick={() => {}}
              style={{
                background: 'transparent',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                color: '#000000',
                fontSize: 20,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'color 0.3s ease',
                position: 'relative',
              }}
              aria-label="Notificaciones"
              onMouseEnter={(e) => (e.currentTarget.style.color = '#2d5016')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#000000')}
            >
              🔔
            </button>
          )}

          {/* Botones de autenticación o menú de usuario */}
          {usuario ? (
            // Usuario logueado
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleProfileClick}
                style={{
                  backgroundColor: '#2d5016',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = '#1f3a0f')
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = '#2d5016')
                }
              >
                Mi Perfil
              </button>
            </div>
          ) : (
            // Usuario no logueado
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  backgroundColor: 'transparent',
                  color: '#2d5016',
                  border: '2px solid #2d5016',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#2d5016';
                  e.target.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#2d5016';
                }}
              >
                Iniciar Sesión
              </button>

              <button
                onClick={() => navigate('/register')}
                style={{
                  backgroundColor: '#2d5016',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = '#1f3a0f')
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = '#2d5016')
                }
              >
                Registrarse
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
