// src/components/ConfigurarPerfil/VisibilitySection.jsx
import React from 'react';

const VisibilitySection = ({ visibilidadPerfil, setVisibilidadPerfil }) => {
  return (
    <div
      className="d-flex align-items-start gap-3 mb-4 p-3"
      style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '16px',
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e9ecef')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
    >
      <div style={{ fontSize: '1.8rem', color: '#0d6efd' }}></div>
      <div className="flex-grow-1">
        <label className="form-label fw-semibold">Visibilidad del perfil</label>
        <select
          className="form-select"
          value={visibilidadPerfil}
          onChange={(e) => setVisibilidadPerfil(e.target.value)}
          style={{
            borderRadius: '14px',
            padding: '0.5rem',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
          }}
        >
          <option value="publico">Público</option>
          <option value="privado">Privado</option>
        </select>
        <small className="text-muted d-block">
          Selecciona "Público" para que todos puedan ver tu perfil, o "Privado"
          para limitar la visibilidad a tus seguidores aprobados.
        </small>
      </div>
    </div>
  );
};

export default VisibilitySection;
