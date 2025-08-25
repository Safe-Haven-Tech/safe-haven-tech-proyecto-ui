// src/components/EditarPerfil/Alertas.jsx
import React, { useEffect } from 'react';

const Alertas = ({ error, mensaje, onDismiss }) => {
  useEffect(() => {
    if (error || mensaje) {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, mensaje, onDismiss]);

  if (!error && !mensaje) return null;

  return (
    <>
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={onDismiss}
            aria-label="Close"
          ></button>
        </div>
      )}
      {mensaje && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {mensaje}
          <button
            type="button"
            className="btn-close"
            onClick={onDismiss}
            aria-label="Close"
          ></button>
        </div>
      )}
    </>
  );
};

export default Alertas;
