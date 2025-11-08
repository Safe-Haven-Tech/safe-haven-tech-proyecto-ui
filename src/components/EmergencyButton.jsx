import React, { useState, useEffect } from 'react';

export default function EmergencyButton(menuOpen) {
  const [topPosition, setTopPosition] = useState(100);

  useEffect(() => {
    const updatePosition = () => {
      const navbar = document.querySelector('.navbar');
      const userMenu = document.querySelector('.user-menu');

      if (navbar) {
        let newTop = navbar.offsetHeight + 20;
        if (menuOpen && userMenu) {
          newTop += userMenu.offsetHeight + 10;
        }
        setTopPosition(newTop);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);

    return () => window.removeEventListener('resize', updatePosition);
  }, [menuOpen]);

  const handleEmergencyClick = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <button
      onClick={handleEmergencyClick}
      style={{
        position: 'fixed',
        top: `${topPosition}px`,
        right: '20px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#d32f2f',
        color: '#fff',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        border: 'none',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        zIndex: 2000,
        transition: 'top 0.3s ease, transform 0.1s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      ⚠️
      <span style={{ fontSize: '0.65rem', lineHeight: '1', marginTop: '2px' }}>
        SALIR
      </span>
    </button>
  );
}
