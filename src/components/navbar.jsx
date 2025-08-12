import React from 'react';
import { Link } from 'react-router-dom';

const navStyle = {
  backgroundColor: '#2563eb', // bg-blue-600
  padding: '1rem',            // p-4
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const logoStyle = {
  color: 'white',
  fontWeight: '700',
  fontSize: '1.25rem', // text-xl
  textDecoration: 'none',
};

const linkContainerStyle = {
  display: 'flex',
  gap: '1rem', // space-x-4
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  cursor: 'pointer',
};

const linkHoverStyle = {
  color: '#d1d5db', // gray-300
};

export default function Navbar() {
  // Para manejar hover en estilos inline, necesitamos usar estado React
  const [hoveredIndex, setHoveredIndex] = React.useState(null);

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/about', label: 'Acerca' },
  ];

  return (
    <nav style={navStyle}>
      <div>
        <Link to="/" style={logoStyle}>SafeHaven</Link>
      </div>
      <div style={linkContainerStyle}>
        {links.map((link, index) => (
          <Link
            key={link.to}
            to={link.to}
            style={hoveredIndex === index ? { ...linkStyle, ...linkHoverStyle } : linkStyle}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
