// src/components/ConfigurarPerfil/DeleteAccountModal.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeleteAccountModal = ({
  show,
  onHide,
  passwordConfirm,
  setPasswordConfirm,
  deleteConfirmation,
  setDeleteConfirmation,
  deleteError,
  isDeleting,
  onDeleteAccount,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Eliminar cuenta permanentemente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p style={{ color: '#dc3545', fontWeight: '600' }}>
          ⚠️ Esta acción es <strong>irreversible</strong>.
        </p>
        <p>
          Todos tus datos, publicaciones y configuraciones se perderán
          permanentemente. ¿Estás absolutamente seguro de que deseas continuar?
        </p>

        <div className="mb-3">
          <label>Para confirmar, ingresa tu contraseña:</label>
          <input
            type="password"
            className="form-control"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            style={{ borderRadius: '14px', marginTop: '0.5rem' }}
            placeholder="Contraseña actual"
          />
        </div>

        <div className="mb-3">
          <label>Escribe "ELIMINAR" para confirmar:</label>
          <input
            type="text"
            className="form-control"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            style={{ borderRadius: '14px', marginTop: '0.5rem' }}
            placeholder="Escribe ELIMINAR aquí"
          />
        </div>

        {deleteError && (
          <div className="alert alert-danger mt-3">{deleteError}</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button
          variant="danger"
          onClick={onDeleteAccount}
          disabled={
            isDeleting ||
            !passwordConfirm ||
            deleteConfirmation.toLowerCase() !== 'eliminar'
          }
        >
          {isDeleting ? 'Eliminando...' : 'Eliminar cuenta permanentemente'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteAccountModal;
