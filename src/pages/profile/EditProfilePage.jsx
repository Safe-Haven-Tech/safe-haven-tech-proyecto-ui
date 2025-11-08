import React, { useCallback, useState } from 'react';
import EditarPerfilForm from '../../components/Profile/EditProfile/EditProfileForm';
import ModalConfirmation from '../../components/Profile/EditProfile/modalConfirmation';
import { useEditarPerfil } from '../../hooks/useEditProfile';
import styles from './EditProfilePage.module.css';

export default function EditProfilePage() {
  const {
    state,
    dispatch,
    handleImagenSeleccionada,
    eliminarImagenSeleccionada,
    eliminarFotoActual,
    handleGuardar,
  } = useEditarPerfil();

  // Estado local para previsualización del formulario sin mutar inmediatamente el reducer.
  const [previewData, setPreviewData] = useState({
    nombreCompleto: state.nombreCompleto,
    nombreUsuario: state.nombreUsuario,
    pronombres: state.pronombres,
    biografia: state.biografia,
    previsualizacionImagen: state.previsualizacionImagen,
    fotoEliminada: state.fotoEliminada,
  });

  // Actualiza la previsualización del formulario. useCallback mantiene la referencia estable.
  const handleFormPreviewChange = useCallback((data) => {
    setPreviewData(data);
  }, []);

  // Cancela la acción de eliminar la foto actual en el reducer.
  const cancelarEliminacion = useCallback(() => {
    dispatch({ type: 'SET_FOTO_ELIMINADA', eliminada: false });
  }, [dispatch]);

  /*
    handleConfirmacion
    - Cierra el modal de confirmación.
    - Si el usuario confirma, delega en handleGuardar (acción proporcionada por el hook).
    - El dispatch para ocultar el modal se realiza siempre; guardar sólo si confirmar === true.
  */
  const handleConfirmacion = useCallback(
    (confirmar) => {
      dispatch({ type: 'SET_MOSTRAR_CONFIRMACION', mostrar: false });
      if (confirmar) {
        // handleGuardar puede realizar side-effects (navegación / peticiones).
        handleGuardar();
      }
    },
    [handleGuardar, dispatch]
  );

  // Mostrar skeleton/loading mientras el hook prepara datos
  if (state.mostrarSkeleton) {
    return (
      <div
        className={`d-flex flex-column justify-content-center align-items-center ${styles.skeletonContainer}`}
      >
        <div
          className={`spinner-border text-success mb-3 ${styles.skeletonSpinner}`}
          role="status"
        >
          <span className="visually-hidden">Cargando perfil...</span>
        </div>
        <p className="text-muted">Cargando tu información...</p>
      </div>
    );
  }

  return (
    <div className={styles.editProfileContainer}>
      <EditarPerfilForm
        state={state}
        dispatch={dispatch}
        onGuardar={handleGuardar}
        onImagenSeleccionada={handleImagenSeleccionada}
        onEliminarImagen={eliminarImagenSeleccionada}
        onEliminarFoto={eliminarFotoActual}
        onCancelarEliminacion={cancelarEliminacion}
        onFormPreviewChange={handleFormPreviewChange}
        previewData={previewData}
      />

      <ModalConfirmation
        mostrar={state.mostrarConfirmacion}
        titulo="Confirmar cambio de nickname"
        mensaje={
          <>
            <p>
              ¿Estás seguro de que quieres cambiar tu nickname de{' '}
              <strong>@{state.usuario?.nombreUsuario}</strong> a{' '}
              <strong>@{state.formData?.nombreUsuario}</strong>?
            </p>
            <p className="text-warning">
              <i className="bi bi-exclamation-triangle me-1" />
              <strong>Importante:</strong> Tu sesión se renovará
              automáticamente.
            </p>
            <p className="text-muted small">
              Tu antiguo nickname podrá ser usado por otros usuarios.
            </p>
          </>
        }
        onConfirmar={() => handleConfirmacion(true)}
        onCancelar={() => handleConfirmacion(false)}
      />
    </div>
  );
}
