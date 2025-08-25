// src/components/ConfigurarPerfil/DangerZoneSection.jsx
import React from 'react';

const DangerZoneSection = ({
  onOpenChangePassword,
  onOpenDeleteAccount,
  onLogout,
}) => {
  return (
    <>
      {/* Cambiar Contraseña */}
      <button
        className="btn btn-warning w-100 mt-3 fw-semibold"
        onClick={onOpenChangePassword}
        style={{ borderRadius: '14px' }}
      >
        Cambiar contraseña
      </button>

      {/* Cerrar Sesión */}
      <button
        className="btn btn-secondary w-100 mt-3 fw-semibold"
        onClick={onLogout}
        style={{
          borderRadius: '14px',
          boxShadow: '0 6px 18px rgba(108,117,125,0.3)',
        }}
      >
        Cerrar sesión
      </button>

      {/* Eliminar Cuenta */}
      <button
        className="btn btn-danger w-100 mt-3 fw-semibold"
        onClick={onOpenDeleteAccount}
        style={{
          borderRadius: '14px',
          boxShadow: '0 6px 18px rgba(220,53,69,0.3)',
        }}
      >
        Eliminar cuenta
      </button>
    </>
  );
};

export default DangerZoneSection;
