import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/Logo.png';

export default function Navbar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleUserMenu = () => setUserMenuOpen((prev) => !prev);

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
        zIndex: 1030,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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
      >
        <ul className="navbar-nav mb-2 mb-lg-0" style={{ marginLeft: 'auto' }}>
          {[
            'Autoevaluación',
            'Recursos informativos',
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

          {/* Botón notificaciones */}
          <button
            onClick={() => {
              // TODO: Implementar lógica para abrir panel de notificaciones
              // Aquí se incluirá la funcionalidad para mostrar notificaciones del usuario
              // - Lista de notificaciones no leídas
              // - Contador de notificaciones
              // - Marcar como leídas
              // - Navegación a contenido relacionado
            }}
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
            {/* Indicador de notificaciones no leídas - se implementará dinámicamente */}
            {/* <span style={{
              position: 'absolute',
              top: -2,
              right: -2,
              backgroundColor: '#ff4444',
              color: 'white',
              borderRadius: '50%',
              width: 16,
              height: 16,
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              3
            </span> */}
          </button>

          {/* Menú usuario */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={toggleUserMenu}
              style={{
                background: 'transparent',
                border: 'none',
                borderRadius: '6px',
                width: 40,
                height: 40,
                color: '#000000',
                fontSize: 26,
                cursor: 'pointer',
                transition: 'color 0.3s ease',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              aria-label="Menú usuario"
              onMouseEnter={(e) => (e.currentTarget.style.color = '#2d5016')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#000000')}
            >
              ☰
            </button>

            {userMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  backgroundColor: '#fff',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                  borderRadius: 8,
                  minWidth: 180,
                  zIndex: 1000,
                  userSelect: 'none',
                }}
              >
                <ul
                  style={{ listStyle: 'none', margin: 0, padding: '0.5rem 0' }}
                >
                  {['Perfil', 'Configuración', 'Cerrar sesión'].map(
                    (action, i) => (
                      <li
                        key={i}
                        style={{
                          padding: '0.6rem 1.5rem',
                          cursor: 'pointer',
                          color: '#000000',
                          fontWeight: '600',
                          textAlign: 'center',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = '#2d5016')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            'transparent')
                        }
                      >
                        {action}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
