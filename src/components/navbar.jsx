import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/Logo.png';
import { useAuth } from '../hooks/useAuth';
import styles from './Navbar.module.css';
import NotificationsModal from './NotificationsModal';
import { obtenerNotificaciones } from '../services/redSocialServices';

// Reusable NavButton
const NavButton = ({
  label,
  onClick,
  style,
  hoverStyle,
  isLink,
  to,
  className = '',
}) => {
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

export default function Navbar() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [_version, setVersion] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [badge, setBadge] = useState(0);

  useEffect(() => {
    const handleTokenChange = () => setVersion((v) => v + 1);
    window.addEventListener('tokenChanged', handleTokenChange);
    return () => window.removeEventListener('tokenChanged', handleTokenChange);
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setIsMobileMenuOpen(false);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // load badge count
  useEffect(() => {
    let mounted = true;
    const loadBadge = async () => {
      if (!usuario) {
        setBadge(0);
        return;
      }
      try {
        const res = await obtenerNotificaciones(1, 20);
        if (!mounted) return;
        const items = res.notificaciones || [];
        const noLeidas =
          (res.meta && (res.meta.noLeidas ?? res.meta.unreadCount)) ??
          items.filter((i) => !i.leida).length;
        setBadge(noLeidas);
      } catch (e) {
        console.error('Error fetching notifications badge', e);
      }
    };
    loadBadge();
    const iv = setInterval(loadBadge, 30000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, [usuario]);

  const isUserAdmin = () => usuario && usuario.rol === 'administrador';

  const handleProfileClick = () => {
    if (usuario && usuario.nombreUsuario)
      navigate(`/perfil/${usuario.nombreUsuario}`);
    else navigate('/perfil');
  };

  const handleAdminPanelClick = () => navigate('/admin/panel');

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);

  const menuItems = [
    { label: 'Autoevaluación', path: '/autoevaluacion' },
    { label: 'Recursos informativos', path: '/recursosinformativos' },
    { label: 'Contacto de expertos', path: '/profesionales' },
    { label: 'Nuestro foro', path: '/foro' },
    { label: 'Tu Feed', path: '/publicaciones' },
  ];

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

  const userButtons = [
    ...(isUserAdmin()
      ? [
          {
            label: 'Admin',
            onClick: handleAdminPanelClick,
            style: {
              backgroundColor: '#dc3545',
              color: '#ffffff',
              border: 'none',
              fontWeight: '700',
            },
            hoverStyle: { backgroundColor: '#c82333', color: '#ffffff' },
          },
        ]
      : []),
    {
      label: 'Mi Perfil',
      onClick: handleProfileClick,
      style: { backgroundColor: '#2d5016', color: '#ffffff', border: 'none' },
      hoverStyle: { backgroundColor: '#1f3a0f', color: '#ffffff' },
    },
  ];

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

        {!isMobile && (
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarSupportedContent"
            style={{ position: 'relative', zIndex: 2110 }}
          >
            <ul
              className="navbar-nav mb-2 mb-lg-0"
              style={{ marginLeft: 'auto' }}
            >
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

            <div
              className="d-flex align-items-center"
              style={{ gap: 24, marginLeft: '1rem' }}
            >
              {/* Notifications */}
              {usuario && (
                <div style={{ position: 'relative' }}>
                  <button
                    className="btn btn-light"
                    onClick={() => setNotifModalOpen((v) => !v)}
                    aria-label="Notificaciones"
                    title="Notificaciones"
                  >
                    🔔
                  </button>
                  {badge > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        background: '#dc3545',
                        color: '#fff',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </div>
              )}

              {(usuario ? userButtons : guestButtons).map((btn, idx) => (
                <NavButton key={idx} {...btn} />
              ))}
            </div>
          </div>
        )}

        {isMobile && (
          <div className={styles.mobileControls}>
            {usuario && (
              <button
                className="btn btn-light"
                onClick={() => setNotifModalOpen((v) => !v)}
                aria-label="Notificaciones"
                title="Notificaciones"
                style={{ marginRight: 8 }}
              >
                🔔
                {badge > 0 && (
                  <span
                    style={{
                      marginLeft: 6,
                      background: '#dc3545',
                      color: '#fff',
                      borderRadius: '50%',
                      padding: '0 6px',
                      fontSize: 12,
                    }}
                  >
                    {badge}
                  </span>
                )}
              </button>
            )}

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

      {isMobile && isMobileMenuOpen && (
        <div
          className={`${styles.mobileMenuOverlay} ${isMobileMenuOpen ? styles.open : ''}`}
        >
          <div className={styles.mobileMenuContent}>
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

            <div className={styles.mobileAuthSection}>
              {usuario ? (
                <>
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

      <NotificationsModal
        open={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
        onUpdateBadge={(v) => setBadge(v)}
      />
    </>
  );
}
