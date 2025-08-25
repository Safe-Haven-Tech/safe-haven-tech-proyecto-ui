// src/components/EditarPerfil/PreviewCard.jsx
import React from 'react';
import perfilPlaceholder from '../../../assets/perfil_placeholder.png';

const PreviewCard = ({
  usuario,
  nombreUsuario,
  nombreCompleto,
  pronombres,
  biografia,
  fotoEliminada,
  previsualizacionImagen,
}) => {
  return (
    <div
      className="card p-4"
      style={{
        width: '550px',
        borderRadius: '24px',
        boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
        backgroundColor: '#fff',
      }}
    >
      <h5 className="text-center mb-3">Vista previa del perfil</h5>

      <div className="d-flex align-items-center gap-3 mb-3">
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#ddd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            color: '#888',
            position: 'relative',
          }}
        >
          {fotoEliminada ? (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc3545',
                fontSize: '0.8rem',
                fontWeight: 'bold',
              }}
            >
              <img
                src={perfilPlaceholder}
                alt="Avatar por defecto"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                }}
              />
            </div>
          ) : previsualizacionImagen ? (
            <img
              src={previsualizacionImagen}
              alt="Nueva imagen"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
          ) : usuario?.fotoPerfil ? (
            <img
              src={usuario.fotoPerfil}
              alt="Avatar"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
          ) : (
            <img
              src={perfilPlaceholder}
              alt="Avatar por defecto"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
          )}
        </div>
        <div>
          <h5 className="mb-1">@{nombreUsuario || usuario?.nombreUsuario}</h5>
          <h6 className="mb-1">{nombreCompleto || usuario?.nombreCompleto}</h6>
          <div className="d-flex gap-2">
            {pronombres && (
              <span className="badge bg-secondary">{pronombres}</span>
            )}
          </div>
        </div>
      </div>

      {biografia && (
        <div
          className="mt-3 p-3"
          style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}
        >
          <p className="mb-0" style={{ fontSize: '0.9rem', color: '#333' }}>
            {biografia}
          </p>
        </div>
      )}

      <div className="mt-3 text-center text-muted small">
        <i className="bi bi-eye"></i> Esta es una vista previa de cómo se verá
        tu perfil
      </div>
    </div>
  );
};

export default PreviewCard;
