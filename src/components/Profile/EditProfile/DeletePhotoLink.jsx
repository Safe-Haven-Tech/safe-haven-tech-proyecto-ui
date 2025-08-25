// src/components/EditarPerfil/EliminarFotoLink.jsx
import React from 'react';

const EliminarFotoLink = ({
  usuario,
  fotoEliminada,
  onEliminarFoto,
  onCancelarEliminacion,
}) => {
  if (!usuario?.fotoPerfil && !fotoEliminada) return null;

  return (
    <div className="text-center mb-2">
      {fotoEliminada ? (
        <div className="d-flex align-items-center justify-content-center gap-2">
          <span className="text-danger small">
            <i className="bi bi-exclamation-triangle me-1"></i>
            Foto marcada para eliminar
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onCancelarEliminacion}
            style={{
              fontSize: '0.7rem',
              padding: '0.1rem 0.4rem',
              borderRadius: '8px',
            }}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-link text-danger p-0"
          onClick={onEliminarFoto}
          style={{
            fontSize: '0.8rem',
            textDecoration: 'none',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          <i className="bi bi-trash me-1"></i>
          Eliminar foto actual
        </button>
      )}
    </div>
  );
};

export default EliminarFotoLink;
