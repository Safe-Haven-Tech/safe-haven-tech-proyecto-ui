// src/pages/EditarPerfil/EditarPerfil.jsx
import React, { useCallback } from 'react';
import EditarPerfilForm from '../../components/Profile/EditProfile/EditProfileForm';
import PreviewCard from '../../components/Profile/EditProfile/PreviewCard';
import ModalConfirmation from '../../components/Profile/EditProfile/ModalConfirmation';
import { useEditarPerfil } from '../../hooks/useEditProfile';

export default function EditarPerfil() {
  const {
    state,
    dispatch,
    handleImagenSeleccionada,
    eliminarImagenSeleccionada,
    eliminarFotoActual,
    handleGuardar,
  } = useEditarPerfil();

  const cancelarEliminacion = useCallback(() => {
    dispatch({ type: 'SET_FOTO_ELIMINADA', eliminada: false });
  }, [dispatch]);

  const handleConfirmacion = useCallback(
    (confirmar) => {
      dispatch({ type: 'SET_MOSTRAR_CONFIRMACION', mostrar: false });
      if (confirmar) {
        handleGuardar();
      }
    },
    [handleGuardar, dispatch]
  );

  // Mostrar skeleton mientras carga
  if (state.mostrarSkeleton) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: '100vh' }}
      >
        <div
          className="spinner-border text-success mb-3"
          style={{ width: '3rem', height: '3rem' }}
          role="status"
        >
          <span className="visually-hidden">Cargando perfil...</span>
        </div>
        <p className="text-muted">Cargando tu información...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#f0f2f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px',
        justifyContent: 'flex-start',
        paddingTop: '120px',
        paddingBottom: '50px',
        paddingLeft: '20px',
        paddingRight: '20px',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      <style>
        {`
          .modal {
            backdrop-filter: blur(5px);
          }
          .modal-content {
            border-radius: 16px;
            border: none;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          }
        `}
      </style>

      {/* Formulario de edición */}
      <EditarPerfilForm
        state={state}
        dispatch={dispatch}
        onGuardar={handleGuardar}
        onImagenSeleccionada={handleImagenSeleccionada}
        onEliminarImagen={eliminarImagenSeleccionada}
        onEliminarFoto={eliminarFotoActual}
        onCancelarEliminacion={cancelarEliminacion}
      />

      {/* Vista previa */}
      <PreviewCard
        usuario={state.usuario}
        nombreUsuario={state.nombreUsuario}
        nombreCompleto={state.nombreCompleto}
        pronombres={state.pronombres}
        biografia={state.biografia}
        fotoEliminada={state.fotoEliminada}
        previsualizacionImagen={state.previsualizacionImagen}
      />

      {/* Modal de confirmación */}
      <ModalConfirmation
        mostrar={state.mostrarConfirmacion}
        titulo="Confirmar cambio de nickname"
        mensaje={
          <>
            <p>
              ¿Estás seguro de que quieres cambiar tu nickname de{' '}
              <strong>@{state.usuario?.nombreUsuario}</strong> a{' '}
              <strong>@{state.nombreUsuario}</strong>?
            </p>
            <p className="text-warning">
              <i className="bi bi-exclamation-triangle me-1"></i>
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
