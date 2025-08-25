// src/components/EditarPerfil/ModalConfirmacion.jsx
import React from 'react';

const ModalConfirmacion = ({
  mostrar,
  titulo,
  mensaje,
  onConfirmar,
  onCancelar,
}) => {
  if (!mostrar) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{titulo}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancelar}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">{mensaje}</div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancelar}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={onConfirmar}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;
