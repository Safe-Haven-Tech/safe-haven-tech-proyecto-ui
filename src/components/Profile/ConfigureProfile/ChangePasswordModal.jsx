// src/components/ConfigurarPerfil/ChangePasswordModal.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ChangePasswordModal = ({
  show,
  onHide,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  passwordError,
  passwordSuccess,
  changingPassword,
  onChangePassword,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Cambiar contraseña</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p style={{ color: '#ffc107', fontWeight: '600' }}>
          ⚠️ Esta acción actualizará tu contraseña y requerirá que uses la nueva
          para iniciar sesión.
        </p>

        <div className="mb-3">
          <label>Contraseña actual:</label>
          <input
            type="password"
            className="form-control"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Contraseña actual"
            style={{ borderRadius: '14px', marginTop: '0.5rem' }}
          />
        </div>

        <div className="mb-3">
          <label>Nueva contraseña:</label>
          <input
            type="password"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nueva contraseña"
            style={{ borderRadius: '14px', marginTop: '0.5rem' }}
          />
        </div>

        {passwordError && (
          <div className="alert alert-danger">{passwordError}</div>
        )}
        {passwordSuccess && (
          <div className="alert alert-success">{passwordSuccess}</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button
          variant="warning"
          onClick={onChangePassword}
          disabled={changingPassword}
        >
          {changingPassword ? 'Actualizando...' : 'Cambiar contraseña'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChangePasswordModal;
