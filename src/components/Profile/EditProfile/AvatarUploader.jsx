// src/components/EditarPerfil/AvatarUploader.jsx
import React, { useRef } from 'react';
import perfilPlaceholder from '../../../assets/perfil_placeholder.png';

const AvatarUploader = React.memo(
  ({ usuario, previsualizacionImagen, onImageSelected, onRemoveImage }) => {
    const inputFileRef = useRef(null);

    const handleClick = () => {
      inputFileRef.current?.click();
    };

    return (
      <>
        <div
          onClick={handleClick}
          style={{
            position: 'relative',
            width: '120px',
            aspectRatio: '1 / 1',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#ddd',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
          }}
        >
          {previsualizacionImagen ? (
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
              onError={(e) => {
                e.target.src = perfilPlaceholder;
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

          {previsualizacionImagen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveImage();
              }}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '25px',
                height: '25px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,0,0,0.8)',
                color: 'white',
                border: 'none',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
          )}

          <div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '4px',
              fontSize: '10px',
              textAlign: 'center',
              opacity: '0',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Cambiar foto
          </div>
        </div>

        <input
          ref={inputFileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={onImageSelected}
          style={{ display: 'none' }}
        />
      </>
    );
  }
);

export default AvatarUploader;
