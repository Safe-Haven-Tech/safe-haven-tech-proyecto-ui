import React from 'react';

export default function EmergencyButton() {
  const handleEmergencyClick = () => {
    // Aquí podrías registrar evento en backend antes de redirigir
    window.location.href = 'https://www.google.com';
  };

  return (
    <button
      onClick={handleEmergencyClick}
      title="Botón de emergencia - Salir inmediatamente"
      style={{
        position: 'fixed',
        top: '100px',
        right: '20px',
        minWidth: '70px',
        minHeight: '70px',
        borderRadius: '50%',
        backgroundColor: '#bd0d0d',
        color: '#fff',
        fontSize: '1rem',
        fontWeight: 'bold',
        border: 'none',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.1s ease, background-color 0.2s ease',
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#bd0d0d')}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#d32f2f')}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      aria-label="Botón de emergencia"
    >
      ⚠️
      <span style={{ fontSize: '0.7rem', marginTop: '2px' }}>SALIR</span>
    </button>
  );
}
