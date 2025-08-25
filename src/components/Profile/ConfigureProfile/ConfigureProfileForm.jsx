// src/components/ConfigurarPerfil/ConfigurarPerfilForm.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnonymitySection from './AnonymitySection';
import VisibilitySection from './VisibilitySection';
import DangerZoneSection from './DangerZoneSection';

const ConfigurarPerfilForm = ({
  usuario,
  anonimo,
  setAnonimo,
  visibilidadPerfil,
  setVisibilidadPerfil,
  error,
  mensaje,
  cargando,
  onGuardar,
  onOpenChangePassword,
  onOpenDeleteAccount,
  onLogout,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="card p-4"
      style={{
        width: '100%',
        maxWidth: '620px',
        borderRadius: '24px',
        boxShadow: '0 14px 30px rgba(0,0,0,0.1)',
        background: '#fff',
      }}
    >
      {/* Header y navegación */}
      <div style={{ marginBottom: '10px', alignSelf: 'flex-start' }}>
        <span
          onClick={() => navigate(`/perfil/${usuario?.nombreUsuario}`)}
          style={{
            cursor: 'pointer',
            color: '#555',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#22c55e')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
        >
          ← Volver a mi perfil
        </span>
      </div>

      <h3 className="text-center mb-4">Configurar perfil</h3>

      {/* Alertas */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {mensaje && (
        <div className="alert alert-success" role="alert">
          {mensaje}
        </div>
      )}

      {/* Secciones de configuración */}
      <AnonymitySection anonimo={anonimo} setAnonimo={setAnonimo} />
      <VisibilitySection
        visibilidadPerfil={visibilidadPerfil}
        setVisibilidadPerfil={setVisibilidadPerfil}
      />

      {/* Botón Guardar */}
      <button
        className="btn btn-success w-100 py-2 fw-semibold"
        onClick={onGuardar}
        disabled={cargando}
        style={{
          borderRadius: '14px',
          boxShadow: '0 6px 18px rgba(34,197,94,0.3)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          marginTop: '20px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {cargando ? 'Guardando...' : 'Guardar cambios'}
      </button>

      {/* Zona de peligro */}
      <DangerZoneSection
        onOpenChangePassword={onOpenChangePassword}
        onOpenDeleteAccount={onOpenDeleteAccount}
        onLogout={onLogout}
      />
    </div>
  );
};

export default ConfigurarPerfilForm;
