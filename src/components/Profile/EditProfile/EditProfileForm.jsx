// src/components/EditarPerfil/EditarPerfilForm.jsx
import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarUploader from './AvatarUploader';
import EliminarFotoLink from './DeletePhotoLink';
import Alertas from './Alerts';
import { useEditarPerfilValidation } from '../../../hooks/useEditProfileValidations';


const EditarPerfilForm = React.memo(
  ({
    state,
    dispatch,
    onGuardar,
    onImagenSeleccionada,
    onEliminarImagen,
    onEliminarFoto,
    onCancelarEliminacion,
  }) => {
    const navigate = useNavigate();

    // Inicializar el hook de validación con los datos del usuario
    const {
      formData,
      updateField,
      errors,
      isFormValid,
      validatingNickname,
      nicknameDisponible,
      validateForm,
      hasChanges,
      getBiografiaHelperText,
      isFieldValid,
      isFieldInvalid,
      isFieldValidating,
    } = useEditarPerfilValidation({
      nombreCompleto: state.usuario?.nombreCompleto || '',
      nombreUsuario: state.usuario?.nombreUsuario || '',
      pronombres: state.usuario?.pronombres || '',
      biografia: state.usuario?.biografia || '',
    });

    // Sincronizar datos del hook con el estado externo cuando cambien
    useEffect(() => {
      dispatch({
        type: 'SET_FORM_DATA',
        payload: formData,
      });
    }, [formData, dispatch]);

    // Actualizar disponibilidad de nickname en el estado externo
    useEffect(() => {
      dispatch({
        type: 'SET_NICKNAME_DISPONIBLE',
        disponible: nicknameDisponible,
      });
    }, [nicknameDisponible, dispatch]);

    const confirmarGuardado = useCallback(() => {
      if (validateForm()) {
        if (formData.nombreUsuario !== state.usuario?.nombreUsuario) {
          dispatch({ type: 'SET_MOSTRAR_CONFIRMACION', mostrar: true });
        } else {
          onGuardar();
        }
      }
    }, [
      validateForm,
      formData.nombreUsuario,
      state.usuario?.nombreUsuario,
      onGuardar,
      dispatch,
    ]);

    // Helper para obtener clases CSS de los inputs
    const getInputClasses = useCallback(
      (fieldName) => {
        const baseClasses = 'form-control';

        if (isFieldInvalid(fieldName)) {
          return `${baseClasses} is-invalid`;
        }

        if (isFieldValid(fieldName)) {
          return `${baseClasses} is-valid`;
        }

        return baseClasses;
      },
      [isFieldValid, isFieldInvalid]
    );

    // Helper para renderizar iconos de estado
    const renderFieldIcon = useCallback(
      (fieldName) => {
        if (
          isFieldValidating(fieldName) ||
          (fieldName === 'nombreUsuario' && validatingNickname)
        ) {
          return (
            <div
              className="position-absolute"
              style={{
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              >
                <span className="visually-hidden">Validando...</span>
              </div>
            </div>
          );
        }

        if (isFieldValid(fieldName)) {
          return (
            <div
              className="position-absolute"
              style={{
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <i className="fas fa-check text-success"></i>
            </div>
          );
        }

        return null;
      },
      [isFieldValidating, isFieldValid, validatingNickname]
    );

    return (
      <div
        className="card p-4"
        style={{
          width: '550px',
          borderRadius: '24px',
          boxShadow: '0 14px 30px rgba(0,0,0,0.1)',
          background: '#fff',
        }}
      >
        <h3 className="text-center mb-4">Editar perfil</h3>

        {/* Botón de volver */}
        <div style={{ marginBottom: '10px', alignSelf: 'flex-start' }}>
          <span
            onClick={() => navigate(`/perfil/${state.usuario?.nombreUsuario}`)}
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

        <Alertas
          error={state.error}
          mensaje={state.mensaje}
          onDismiss={() => dispatch({ type: 'LIMPIAR_ALERTAS' })}
        />

        <div className="d-flex justify-content-center mb-4">
          <AvatarUploader
            usuario={state.usuario}
            previsualizacionImagen={state.previsualizacionImagen}
            onImageSelected={onImagenSeleccionada}
            onRemoveImage={onEliminarImagen}
          />
        </div>

        <EliminarFotoLink
          usuario={state.usuario}
          fotoEliminada={state.fotoEliminada}
          onEliminarFoto={onEliminarFoto}
          onCancelarEliminacion={onCancelarEliminacion}
        />

        {/* CAMPO NOMBRE COMPLETO */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Nombre completo *</label>
          <div className="position-relative">
            <input
              type="text"
              className={getInputClasses('nombreCompleto')}
              value={formData.nombreCompleto}
              onChange={(e) => updateField('nombreCompleto', e.target.value)}
              style={{
                borderRadius: '14px',
                padding: '0.6rem 0.75rem',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
              }}
            />
            {renderFieldIcon('nombreCompleto')}
          </div>

          {/* Mensaje de error específico */}
          {errors.nombreCompleto && (
            <div className="text-danger small mt-1">
              <i className="bi bi-exclamation-circle me-1"></i>
              {errors.nombreCompleto}
            </div>
          )}

          {/* Mensaje de ayuda */}
          <div className="form-text">
            Solo letras y espacios (2-100 caracteres)
          </div>
        </div>

        {/* CAMPO NICKNAME */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Nickname *</label>
          <div className="position-relative">
            <input
              type="text"
              className={getInputClasses('nombreUsuario')}
              value={formData.nombreUsuario}
              onChange={(e) => updateField('nombreUsuario', e.target.value)}
              style={{
                borderRadius: '14px',
                padding: '0.6rem 0.75rem',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
              }}
            />
            {renderFieldIcon('nombreUsuario')}
          </div>

          {/* Mensaje de error específico */}
          {errors.nombreUsuario && (
            <div className="text-danger small mt-1">
              <i className="bi bi-exclamation-circle me-1"></i>
              {errors.nombreUsuario}
            </div>
          )}

          {/* Mensaje de validando */}
          {validatingNickname && (
            <div className="text-primary small mt-1">
              <i className="bi bi-hourglass-split me-1"></i>Verificando
              disponibilidad...
            </div>
          )}

          {/* Mensaje de disponible */}
          {isFieldValid('nombreUsuario') && !validatingNickname && (
            <div className="text-success small mt-1">
              <i className="bi bi-check-circle me-1"></i>¡Nickname disponible!
            </div>
          )}

          <div className="form-text">
            5-20 caracteres, solo letras, números y _
          </div>
        </div>

        {/* CAMPO PRONOMBRES */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Pronombres</label>
          <div className="position-relative">
            <input
              type="text"
              className={getInputClasses('pronombres')}
              placeholder="Ej: él/ella/elle"
              value={formData.pronombres}
              onChange={(e) => updateField('pronombres', e.target.value)}
              style={{
                borderRadius: '14px',
                padding: '0.6rem 0.75rem',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
              }}
            />
            {renderFieldIcon('pronombres')}
          </div>

          {/* Mensaje de error específico */}
          {errors.pronombres && (
            <div className="text-danger small mt-1">
              <i className="bi bi-exclamation-circle me-1"></i>
              {errors.pronombres}
            </div>
          )}

          <div className="form-text">
            Máximo 15 caracteres, letras, espacios y /
          </div>
        </div>

        {/* CAMPO BIOGRAFÍA */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Biografía</label>
          <div className="position-relative">
            <textarea
              className={getInputClasses('biografia')}
              placeholder="Cuéntanos algo sobre ti..."
              value={formData.biografia}
              onChange={(e) => updateField('biografia', e.target.value)}
              rows="3"
              style={{
                borderRadius: '14px',
                padding: '0.6rem 0.75rem',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
              }}
            />
            {/* Icono para textarea (posición ajustada) */}
            {isFieldValid('biografia') && (
              <div
                className="position-absolute"
                style={{ right: '12px', top: '12px' }}
              >
                <i className="fas fa-check text-success"></i>
              </div>
            )}
          </div>

          {/* Mensaje de error específico */}
          {errors.biografia && (
            <div className="text-danger small mt-1">
              <i className="bi bi-exclamation-circle me-1"></i>
              {errors.biografia}
            </div>
          )}

          {/* Contador de caracteres dinámico */}
          <div
            className={`text-end small mt-1 ${
              formData.biografia?.length > 80
                ? 'text-warning'
                : formData.biografia?.length > 95
                  ? 'text-danger'
                  : 'text-muted'
            }`}
          >
            {getBiografiaHelperText()}
          </div>
        </div>

        <button
          className="btn btn-success w-100 py-2 fw-semibold"
          onClick={confirmarGuardado}
          disabled={
            state.cargando ||
            validatingNickname ||
            !isFormValid ||
            !hasChanges()
          }
          style={{
            borderRadius: '14px',
            boxShadow: '0 6px 18px rgba(34,197,94,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            opacity:
              state.cargando ||
              validatingNickname ||
              !isFormValid ||
              !hasChanges()
                ? 0.7
                : 1,
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.transform = 'scale(1.03)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {state.cargando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    );
  }
);

export default EditarPerfilForm;
