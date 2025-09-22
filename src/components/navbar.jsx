/* filepath: f:\SafeHaven\safe-haven-tech-proyecto-ui\src\components\Navbar.jsx */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/Logo.png';
import { useAuth } from '../context/useAuth';
import styles from './Navbar.module.css';

// ----------------- Componente reutilizable ORIGINAL -----------------
const NavButton = ({ label, onClick, style, hoverStyle, isLink, to, className = '' }) => {
  const [hover, setHover] = useState(false);

  const combinedStyle = {
    borderRadius: '6px',
    padding: '10px 18px',
    fontWeight: '600',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    border: 'none',
    ...(hover ? hoverStyle : style),
  };

  if (isLink) {
    return (
      <Link
        to={to}
        style={combinedStyle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={className}
      >
        {label}
      </Link>
    );
  }

  

  return (
    <button
      onClick={onClick}
      style={combinedStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={className}
    >
      {label}
    </button>
  );
};

// ----------------- Navbar principal ORIGINAL + ADMIN -----------------
export default function Navbar() {
  const { usuario } = useAuth();
  const [_version, setVersion] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  

  // Estados para responsive
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ORIGINAL: useEffect para token
  useEffect(() => {
    const handleTokenChange = () => setVersion((v) => v + 1);
    window.addEventListener('tokenChanged', handleTokenChange);
    return () => window.removeEventListener('tokenChanged', handleTokenChange);
  }, []);

  // Hook para detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Cerrar menu móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // 🆕 NUEVO: Verificar si es administrador
  const isUserAdmin = () => {
    if (!usuario) return false;
    return usuario.rol === 'administrador';
  };

  // ORIGINAL: handlers
  const handleProfileClick = () => {
    if (usuario && usuario.nombreUsuario)
      navigate(`/perfil/${usuario.nombreUsuario}`);
    else navigate('/perfil');
  };

  const handleSearchClick = () => console.log('Buscar posts...');

  // 🆕 NUEVO: Handler para panel de administración
  const handleAdminPanelClick = () => {
    navigate('/admin/panel');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // ---------- Menu principal ORIGINAL ----------
  const menuItems = [
    { label: 'Autoevaluación', path: '/autoevaluacion' },
    { label: 'Recursos informativos', path: '/recursosinformativos' },
    { label: 'Contacto de expertos', path: '/contactoexpertos' },
    { label: 'Nuestro foro', path: '/foro' },
  ];

  // ---------- Botones invitado ORIGINAL ----------
  const guestButtons = [
    {
      label: 'Iniciar Sesión',
      onClick: () => navigate('/login'),
      style: {
        backgroundColor: 'transparent',
        color: '#2d5016',
        border: '2px solid #2d5016',
      },
      hoverStyle: { backgroundColor: '#2d5016', color: '#ffffff' },
    },
    {
      label: 'Registrarse',
      onClick: () => navigate('/register'),
      style: { backgroundColor: '#2d5016', color: '#ffffff', border: 'none' },
      hoverStyle: { backgroundColor: '#1f3a0f', color: '#ffffff' },
    },
  ];

  // ---------- Botones usuario logueado + ADMIN ----------
  const userButtons = [
    // 🆕 BOTÓN ADMIN (solo si rol === 'administrador')
    ...(isUserAdmin() ? [{
      label: 'Admin',
      onClick: handleAdminPanelClick,
      style: { 
        backgroundColor: '#dc3545', // Rojo para destacar
        color: '#ffffff', 
        border: 'none',
        fontWeight: '700',
      },
      hoverStyle: { backgroundColor: '#c82333', color: '#ffffff' },
    }] : []),
    
    // Botones originales
    {
      label: 'Mi Perfil',
      onClick: handleProfileClick,
      style: { backgroundColor: '#2d5016', color: '#ffffff', border: 'none' },
      hoverStyle: { backgroundColor: '#1f3a0f', color: '#ffffff' },
    },
    {
      label: '🔔',
      onClick: () => {},
      style: {
        background: 'transparent',
        border: 'none',
        borderRadius: '50%',
        width: 40,
        height: 40,
        fontSize: 22,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      hoverStyle: { backgroundColor: '#2d5016', color: '#ffffff' },
    },
  ];

  // ---------- Botón de búsqueda ORIGINAL ----------
  const searchButton = {
    label: '🔍',
    onClick: handleSearchClick,
    style: {
      background: 'transparent',
      border: 'none',
      borderRadius: '50%',
      width: 40,
      height: 40,
      fontSize: 22,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    hoverStyle: { backgroundColor: '#2d5016', color: '#ffffff' },
  };

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg ${styles.navbar}`}
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
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Logo ORIGINAL */}
        <Link 
          to="/" 
          className="navbar-brand d-flex align-items-center"
          style={{ flexShrink: 0 }}
        >
          <img
            src={logo}
            alt="SafeHaven Logo"
            style={{
              height: isMobile ? 50 : 60,
              width: 'auto',
              marginRight: 12,
              borderRadius: 8,
            }}
          />
        </Link>

        {/* Desktop Menu ORIGINAL */}
        {!isMobile && (
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarSupportedContent"
            style={{ position: 'relative', zIndex: 2110 }}
          >
            {/* Menú principal ORIGINAL */}
            <ul className="navbar-nav mb-2 mb-lg-0" style={{ marginLeft: 'auto' }}>
              {menuItems.map((item, idx) => (
                <li className="nav-item" key={idx}>
                  <NavButton
                    label={item.label}
                    isLink={true}
                    to={item.path}
                    style={{
                      color: '#000',
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: '16px',
                    }}
                    hoverStyle={{ color: '#fff', backgroundColor: '#2d5016' }}
                  />
                </li>
              ))}
            </ul>

            {/* Botones de búsqueda y usuario ORIGINAL + ADMIN */}
            <div
              className="d-flex align-items-center"
              style={{ gap: 24, marginLeft: '1rem' }}
            >
              <NavButton {...searchButton} />
              {(usuario ? userButtons : guestButtons).map((btn, idx) => (
                <NavButton key={idx} {...btn} />
              ))}
            </div>
          </div>
        )}

        {/* Mobile Controls */}
        {isMobile && (
          <div className={styles.mobileControls}>
            {/* Búsqueda móvil */}
            <NavButton {...searchButton} />

            {/* Notificaciones móvil (solo si está autenticado) */}
            {usuario && (
              <NavButton {...userButtons.find(btn => btn.label === '🔔')} />
            )}

            {/* Hamburger Menu */}
            <button
              className={`${styles.hamburgerButton} ${isMobileMenuOpen ? styles.active : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Menú"
            >
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobile && (
        <div className={`${styles.mobileMenuOverlay} ${isMobileMenuOpen ? styles.open : ''}`}>
          <div className={styles.mobileMenuContent}>
            {/* Menu Items */}
            <div className={styles.mobileMenuItems}>
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={styles.mobileMenuItem}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Auth Buttons + ADMIN */}
            <div className={styles.mobileAuthSection}>
              {usuario ? (
                <>
                  {/* 🆕 BOTÓN ADMIN MÓVIL */}
                  {isUserAdmin() && (
                    <button
                      className={styles.mobileAdminButton}
                      onClick={() => {
                        handleAdminPanelClick();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      ⚙️ Panel de Administración
                    </button>
                  )}
                  
                  <button
                    className={styles.mobileProfileButton}
                    onClick={() => {
                      handleProfileClick();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Mi Perfil
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={styles.mobileLoginButton}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className={styles.mobileRegisterButton}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}