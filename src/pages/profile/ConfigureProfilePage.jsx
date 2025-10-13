/* filepath: f:\SafeHaven\safe-haven-tech-proyecto-ui\src\pages\profile\ConfigureProfilePage.jsx */
import React from 'react';
import { useAuth } from '../../context/useAuth';
import { useConfigurarPerfil } from '../../hooks/useConfigurarProfile';
import styles from './ConfigureProfilePage.module.css';

import ConfigurarPerfilForm from '../../components/Profile/ConfigureProfile/ConfigureProfileForm';
import ChangePasswordModal from '../../components/Profile/ConfigureProfile/ChangePasswordModal';
import DeleteAccountModal from '../../components/Profile/ConfigureProfile/DeleteAccountModal';

const ConfigurarPerfil = () => {
  const { usuario, cerrarSesion } = useAuth();
  const {
    // Estados principales
    contraseña,
    setContraseña,
    anonimo,
    setAnonimo,
    visibilidadPerfil,
    setVisibilidadPerfil,
    error,
    mensaje,
    cargando,

    // Estados modales
    showChangePasswordModal,
    setShowChangePasswordModal,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    passwordError,
    passwordSuccess,
    changingPassword,

    showDeleteModal,
    setShowDeleteModal,
    passwordConfirm,
    setPasswordConfirm,
    deleteError,
    setDeleteError,
    deleteConfirmation,
    setDeleteConfirmation,
    isDeleting,

    setPasswordError,
    setPasswordSuccess,

    // Handlers
    handleGuardar,
    handleChangePassword,
    handleDeleteAccount,
    validarContraseña,
  } = useConfigurarPerfil();

  if (!usuario) {
    return (
      <div className={`text-center mt-5 pt-5 ${styles.loadingContainer}`}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="text-muted mt-2">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className={styles.configureContainer}>
      {/* Formulario principal */}
      <ConfigurarPerfilForm
        usuario={usuario}
        contraseña={contraseña}
        setContraseña={setContraseña}
        anonimo={anonimo}
        setAnonimo={setAnonimo}
        visibilidadPerfil={visibilidadPerfil}
        setVisibilidadPerfil={setVisibilidadPerfil}
        error={error}
        mensaje={mensaje}
        cargando={cargando}
        onGuardar={handleGuardar}
        onOpenChangePassword={() => setShowChangePasswordModal(true)}
        onOpenDeleteAccount={() => setShowDeleteModal(true)}
        onLogout={cerrarSesion}
        validarContraseña={validarContraseña}
      />

      {/* Modales */}
      <ChangePasswordModal
        show={showChangePasswordModal}
        onHide={() => {
          setShowChangePasswordModal(false);
          setCurrentPassword('');
          setNewPassword('');
          setPasswordError('');
          setPasswordSuccess('');
        }}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        passwordError={passwordError}
        passwordSuccess={passwordSuccess}
        changingPassword={changingPassword}
        onChangePassword={handleChangePassword}
      />

      <DeleteAccountModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setPasswordConfirm('');
          setDeleteConfirmation('');
          setDeleteError('');
        }}
        passwordConfirm={passwordConfirm}
        setPasswordConfirm={setPasswordConfirm}
        deleteConfirmation={deleteConfirmation}
        setDeleteConfirmation={setDeleteConfirmation}
        deleteError={deleteError}
        isDeleting={isDeleting}
        onDeleteAccount={handleDeleteAccount}
      />
    </div>
  );
};

export default ConfigurarPerfil;
