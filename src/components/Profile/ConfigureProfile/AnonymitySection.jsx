// src/components/ConfigurarPerfil/AnonymitySection.jsx
import React from 'react';

const AnonymitySection = ({ anonimo, setAnonimo }) => {
  return (
    <div
      className="d-flex align-items-start gap-3 mb-3 p-3"
      style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '16px',
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e9ecef')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
    >
      <div style={{ fontSize: '1.8rem', color: '#6c757d' }}>👤</div>
      <div className="flex-grow-1">
        <label className="form-label fw-semibold">Anonimato</label>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="anonimoSwitch"
            checked={anonimo}
            onChange={() => setAnonimo(!anonimo)}
          />
          <label className="form-check-label" htmlFor="anonimoSwitch">
            Activar anonimato
          </label>
        </div>
        <small className="text-muted d-block">
          Activando esto, tu nombre y detalles personales no serán visibles
          públicamente en tu perfil.
        </small>
      </div>
    </div>
  );
};

export default AnonymitySection;
