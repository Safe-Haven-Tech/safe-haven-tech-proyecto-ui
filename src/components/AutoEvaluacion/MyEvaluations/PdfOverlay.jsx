import React from 'react';

const PdfOverlay = () => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      color: 'white',
      fontSize: '1.5rem',
      fontWeight: 'bold',
    }}
  >
    <div
      className="spinner-border text-light"
      role="status"
      style={{ width: '3rem', height: '3rem' }}
    >
      <span className="visually-hidden">Generando PDF...</span>
    </div>
    <span style={{ marginTop: '1rem' }}>Generando PDF...</span>
  </div>
);

export default PdfOverlay;
