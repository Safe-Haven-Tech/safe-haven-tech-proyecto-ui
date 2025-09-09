import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/Logo.png';
import { useAuth } from '../context/useAuth';

// ----------------- Componente reutilizable -----------------
const NavButton = ({ label, onClick, style, hoverStyle, isLink, to }) => {
  const [hover, setHover] = useState(false);

  const combinedStyle = {
    borderRadius: '6px',
    padding: '10px 18px', // más espacio para los textos
    fontWeight: '600',
    fontSize: '16px', // tamaño de texto aumentado
    cursor: 'pointer',
    transition: 'background-color 0.3s ease', // solo fondo cambia
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...(hover ? hoverStyle : style),
  };

  if (isLink) {
    return (
      <Link
        to={to}
        style={combinedStyle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
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
    >
      {label}
    </button>
  );
};

// ----------------- Navbar principal -----------------
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
    if (usuario && usuario.nombreUsuario)
      navigate(`/perfil/${usuario.nombreUsuario}`);
    else navigate('/perfil');
  };

  const handleSearchClick = () => console.log('Buscar posts...');

  // ---------- Menu principal ----------
  const menuItems = [
    { label: 'Autoevaluación', path: '/autoevaluacion' },
    { label: 'Recursos informativos', path: '/recursosinformativos' },
    { label: 'Contacto de expertos', path: '/contactoexpertos' },
    { label: 'Nuestro foro', path: '/foro' },
  ];

  // ---------- Botones invitado ----------
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

  // ---------- Botones usuario logueado ----------
  const userButtons = [
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
        width: 40, // más grande para icono
        height: 40,
        fontSize: 22, // icono más grande
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      hoverStyle: { backgroundColor: '#2d5016', color: '#ffffff' }, // solo fondo cambia
    },
  ];

  // ---------- Botón de búsqueda ----------
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
    hoverStyle: { backgroundColor: '#2d5016', color: '#ffffff' }, // solo fondo cambia
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

      <div
        className="collapse navbar-collapse justify-content-end"
        id="navbarSupportedContent"
        style={{ position: 'relative', zIndex: 2110 }}
      >
        {/* Menú principal */}
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
                }} // texto más grande
                hoverStyle={{ color: '#fff', backgroundColor: '#2d5016' }}
              />
            </li>
          ))}
        </ul>

        {/* Botones de búsqueda y usuario */}
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
    </nav>
  );
}
