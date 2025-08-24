import React, { useEffect, useRef, useCallback, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import perfilPlaceholder from '../assets/perfil_placeholder.png';

// Constantes para valores repetidos
const LIMITES = {
  NOMBRE: { MIN: 2, MAX: 100 },
  NICKNAME: { MIN: 5, MAX: 20 },
  BIOGRAFIA: { MAX: 100 },
  PRONOMBRES: { MAX: 15 },
  IMAGEN: {
    MAX_SIZE: 5 * 1024 * 1024,
    TIPOS_PERMITIDOS: ['image/jpeg', 'image/jpg', 'image/png'],
  },
};

// Utils - Funciones reutilizables
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const validarNombre = (nombre) => {
  if (!nombre) return null;
  const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
  if (!regex.test(nombre.trim()))
    return 'Tu apodo solo puede contener letras, espacios y acentos';
  if (nombre.trim().length < LIMITES.NOMBRE.MIN)
    return `Tu apodo debe tener al menos ${LIMITES.NOMBRE.MIN} caracteres`;
  if (nombre.trim().length > LIMITES.NOMBRE.MAX)
    return `Tu apodo no puede superar los ${LIMITES.NOMBRE.MAX} caracteres`;
  return null;
};

const validarNickname = (nickname, disponible) => {
  if (!nickname) return 'El nickname es obligatorio';
  if (nickname.length < LIMITES.NICKNAME.MIN)
    return `El nickname debe tener al menos ${LIMITES.NICKNAME.MIN} caracteres`;
  if (nickname.length > LIMITES.NICKNAME.MAX)
    return `El nickname no puede superar los ${LIMITES.NICKNAME.MAX} caracteres`;
  const regex = /^[a-zA-Z0-9_]+$/;
  if (!regex.test(nickname))
    return 'El nickname solo puede contener letras, números y guion bajo';
  if (!disponible) return 'Este nickname ya está en uso';
  return null;
};

const validarPronombres = (pronombres) => {
  if (pronombres && pronombres.length > LIMITES.PRONOMBRES.MAX)
    return `Los pronombres no pueden superar los ${LIMITES.PRONOMBRES.MAX} caracteres`;
  return null;
};

const validarBiografia = (bio) => {
  if (bio && bio.length > LIMITES.BIOGRAFIA.MAX)
    return `La biografía no puede superar los ${LIMITES.BIOGRAFIA.MAX} caracteres`;
  return null;
};

// Componente para mostrar alertas
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

// Componente Modal reusable
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

// Componente para subir avatar
const AvatarUploader = React.memo(
  ({ usuario, previsualizacionImagen, onImageSelected, onRemoveImage }) => {
    const inputFileRef = useRef(null);

    const handleClick = () => {
      inputFileRef.current?.click();
    };

    return (
      <>
        <div
          onClick={handleClick}
          style={{
            position: 'relative',
            width: '120px',
            aspectRatio: '1 / 1',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#ddd',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
          }}
        >
          {previsualizacionImagen ? (
            <img
              src={previsualizacionImagen}
              alt="Nueva imagen"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
          ) : usuario?.fotoPerfil ? (
            <img
              src={usuario.fotoPerfil}
              alt="Avatar"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
              }}
              onError={(e) => {
                e.target.src =
                  'https://static.vecteezy.com/system/resources/thumbnails/003/337/584/small_2x/default-avatar-photo-placeholder-profile-icon-vector.jpg';
              }}
            />
          ) : (
            <img
              src={perfilPlaceholder}
              alt="Avatar por defecto"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
          )}

          {previsualizacionImagen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveImage();
              }}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '25px',
                height: '25px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,0,0,0.8)',
                color: 'white',
                border: 'none',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
          )}

          <div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '4px',
              fontSize: '10px',
              textAlign: 'center',
              opacity: '0',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Cambiar foto
          </div>
        </div>

        <input
          ref={inputFileRef}
          type="file"
          accept={LIMITES.IMAGEN.TIPOS_PERMITIDOS.join(',')}
          onChange={onImageSelected}
          style={{ display: 'none' }}
        />
      </>
    );
  }
);

// Componente para el enlace de eliminar foto
const EliminarFotoLink = ({
  usuario,
  eliminarFoto,
  onEliminarFoto,
  onCancelarEliminacion,
}) => {
  if (!usuario?.fotoPerfil && !eliminarFoto) return null;

  return (
    <div className="text-center mb-2">
      {eliminarFoto ? (
        <div className="d-flex align-items-center justify-content-center gap-2">
          <span className="text-danger small">
            <i className="bi bi-exclamation-triangle me-1"></i>
            Foto marcada para eliminar
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onCancelarEliminacion}
            style={{
              fontSize: '0.7rem',
              padding: '0.1rem 0.4rem',
              borderRadius: '8px',
            }}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-link text-danger p-0"
          onClick={onEliminarFoto}
          style={{
            fontSize: '0.8rem',
            textDecoration: 'none',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          <i className="bi bi-trash me-1"></i>
          Eliminar foto actual
        </button>
      )}
    </div>
  );
};

// Estado inicial para useReducer
const initialState = {
  usuario: null,
  nombreCompleto: '',
  nombreUsuario: '',
  biografia: '',
  pronombres: '',
  error: '',
  mensaje: '',
  cargando: false,
  validandoNickname: false,
  nicknameDisponible: true,
  imagenSeleccionada: null,
  previsualizacionImagen: null,
  mostrarConfirmacion: false,
  fotoEliminada: false,
  mostrarSkeleton: true,
};

// Reducer para manejar el estado
function perfilReducer(state, action) {
  switch (action.type) {
    case 'SET_CAMPO':
      return { ...state, [action.campo]: action.valor };
    case 'SET_USUARIO':
      return {
        ...state,
        usuario: action.usuario,
        nombreCompleto: action.usuario.nombreCompleto || '',
        nombreUsuario: action.usuario.nombreUsuario || '',
        biografia: action.usuario.biografia || '',
        pronombres: action.usuario.pronombres || '',
        genero: action.usuario.genero || '',
        mostrarSkeleton: false,
      };
    case 'SET_ERROR':
      return { ...state, error: action.error, cargando: false };
    case 'SET_MENSAJE':
      return { ...state, mensaje: action.mensaje, cargando: false };
    case 'SET_CARGANDO':
      return { ...state, cargando: action.cargando };
    case 'SET_VALIDANDO_NICKNAME':
      return { ...state, validandoNickname: action.validando };
    case 'SET_NICKNAME_DISPONIBLE':
      return { ...state, nicknameDisponible: action.disponible };
    case 'SET_IMAGEN_SELECCIONADA':
      return {
        ...state,
        imagenSeleccionada: action.imagen,
        previsualizacionImagen: action.previsualizacion,
      };
    case 'SET_MOSTRAR_CONFIRMACION':
      return { ...state, mostrarConfirmacion: action.mostrar };
    case 'LIMPIAR_IMAGEN':
      return {
        ...state,
        imagenSeleccionada: null,
        previsualizacionImagen: null,
      };
    case 'LIMPIAR_ALERTAS':
      return { ...state, error: '', mensaje: '' };
    case 'RESET_ESTADO':
      return { ...initialState, usuario: state.usuario };
    case 'SET_FOTO_ELIMINADA':
      return {
        ...state,
        fotoEliminada: action.eliminada,
        imagenSeleccionada: action.eliminada ? null : state.imagenSeleccionada,
        previsualizacionImagen: action.eliminada
          ? null
          : state.previsualizacionImagen,
      };
    default:
      return state;
  }
}

// Hook personalizado para la lógica de edición de perfil
const useEditarPerfil = () => {
  const [state, dispatch] = useReducer(perfilReducer, initialState);
  const navigate = useNavigate();

  // ✅ MOVER handleTokenInvalidation FUERA del useEffect
  const handleTokenInvalidation = useCallback(async () => {
    try {
      // Intentar renovar el token con refresh token
      const refreshResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken: localStorage.getItem('refreshToken'),
          }),
        }
      );

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        localStorage.setItem('token', refreshData.accessToken);
        window.dispatchEvent(new Event('tokenChanged'));
        return true;
      }
    } catch (error) {
      console.error('Error renovando token:', error);
    }

    // Si no se puede renovar, redirigir a login
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/login');
    return false;
  }, [navigate]);

  // ✅ MOVER fetchUsuario FUERA del useEffect
  const fetchUsuario = useCallback(async () => {
    try {
      let token = localStorage.getItem('token');
      const decoded = parseJwt(token);
      if (!decoded || !decoded.id) {
        throw new Error('Token inválido');
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/usuarios/${decoded.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
        }
      );

      // ✅ Si el token está invalidado, intentar renovarlo
      if (res.status === 401 || res.status === 403) {
        const success = await handleTokenInvalidation();
        if (success) {
          // Reintentar la solicitud con el nuevo token
          token = localStorage.getItem('token');
          const retryRes = await fetch(
            `${import.meta.env.VITE_API_URL}/api/usuarios/${decoded.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache',
              },
            }
          );

          if (retryRes.ok) {
            const retryData = await retryRes.json();
            dispatch({ type: 'SET_USUARIO', usuario: retryData.usuario });
            return;
          }
        }
      }

      if (!res.ok) {
        throw new Error('Error al obtener datos del usuario');
      }

      const data = await res.json();
      dispatch({ type: 'SET_USUARIO', usuario: data.usuario });
    } catch (err) {
      console.error(err);
      dispatch({
        type: 'SET_ERROR',
        error: 'Error al cargar los datos del usuario',
      });

      if (err.message.includes('Token inválido')) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        navigate('/login');
      }
    }
  }, [handleTokenInvalidation, navigate]);

  // Obtener datos del usuario
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login', { replace: true });

    fetchUsuario(); // ✅ Ahora fetchUsuario está definida correctamente
  }, [navigate, fetchUsuario]); // ✅ Añadir fetchUsuario a las dependencias

  // Validar nickname en tiempo real con debounce
  useEffect(() => {
    const validarNickname = async () => {
      if (
        !state.nombreUsuario ||
        state.nombreUsuario === state.usuario?.nombreUsuario
      ) {
        dispatch({ type: 'SET_NICKNAME_DISPONIBLE', disponible: true });
        return;
      }

      if (state.nombreUsuario.length < LIMITES.NICKNAME.MIN) {
        dispatch({ type: 'SET_NICKNAME_DISPONIBLE', disponible: false });
        return;
      }

      dispatch({ type: 'SET_VALIDANDO_NICKNAME', validando: true });
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/usuarios/verificar-nickname/${state.nombreUsuario}`
        );
        const data = await res.json();
        dispatch({
          type: 'SET_NICKNAME_DISPONIBLE',
          disponible: data.disponible,
        });
      } catch (err) {
        console.error('Error validando nickname:', err);
        dispatch({ type: 'SET_NICKNAME_DISPONIBLE', disponible: false });
      } finally {
        dispatch({ type: 'SET_VALIDANDO_NICKNAME', validando: false });
      }
    };

    const timeoutId = setTimeout(validarNickname, 500);
    return () => clearTimeout(timeoutId);
  }, [state.nombreUsuario, state.usuario?.nombreUsuario]);

  // Función para eliminar la foto actual
  const eliminarFotoActual = useCallback(() => {
    dispatch({ type: 'SET_FOTO_ELIMINADA', eliminada: true });
  }, []);

  // Handler para guardar cambios
  const handleGuardar = useCallback(async () => {
    const errores = [
      validarNombre(state.nombreCompleto),
      validarNickname(state.nombreUsuario, state.nicknameDisponible),
      validarPronombres(state.pronombres),
      validarBiografia(state.biografia),
    ].filter((error) => error !== null);

    if (errores.length > 0) {
      dispatch({ type: 'SET_ERROR', error: errores[0] });
      return;
    }

    if (!state.nicknameDisponible) {
      dispatch({ type: 'SET_ERROR', error: 'El nickname no está disponible' });
      return;
    }

    dispatch({ type: 'LIMPIAR_ALERTAS' });
    dispatch({ type: 'SET_CARGANDO', cargando: true });

    try {
      const token = localStorage.getItem('token');
      const decoded = parseJwt(token);
      if (!decoded || !decoded.id) throw new Error('Token inválido');

      let body;
      let headers = { Authorization: `Bearer ${token}` };

      if (state.imagenSeleccionada) {
        // Subir nueva imagen
        const formData = new FormData();
        formData.append('nombreCompleto', state.nombreCompleto.trim());
        formData.append('nombreUsuario', state.nombreUsuario.trim());
        formData.append('biografia', state.biografia.trim());
        formData.append('pronombres', state.pronombres.trim());
        formData.append('genero', state.genero.trim());
        formData.append('fotoPerfil', state.imagenSeleccionada);
        body = formData;
      } else {
        // Enviar JSON, incluyendo eliminación de foto si corresponde
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          nombreCompleto: state.nombreCompleto.trim(),
          nombreUsuario: state.nombreUsuario.trim(),
          biografia: state.biografia.trim(),
          pronombres: state.pronombres.trim(),
          genero: state.genero.trim(),
          ...(state.fotoEliminada && { fotoPerfil: null }),
        });
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/usuarios/${decoded.id}`,
        { method: 'PUT', headers, body }
      );

      const data = await res.json();

      if (!res.ok) {
        if (
          res.status === 409 ||
          data.error?.toLowerCase().includes('nickname')
        ) {
          dispatch({
            type: 'SET_ERROR',
            error: 'El nickname ya está en uso. Por favor elige otro.',
          });
          dispatch({ type: 'SET_NICKNAME_DISPONIBLE', disponible: false });
        } else {
          throw new Error(
            data.detalles?.join?.(', ') ||
              data.error ||
              data.message ||
              'Error al actualizar el perfil'
          );
        }
        return;
      }

      // ✅ MANEJO DEL NUEVO TOKEN SI SE CAMBIÓ EL NICKNAME
      if (data.nuevoToken) {
        localStorage.setItem('token', data.nuevoToken);
        window.dispatchEvent(new Event('tokenChanged'));
        dispatch({
          type: 'SET_MENSAJE',
          mensaje:
            'Perfil actualizado correctamente. Tu sesión ha sido renovada.',
        });
        setTimeout(() => {
          fetchUsuario();
          navigate(`/perfil/${state.nombreUsuario.trim()}`);
        }, 1000);
      } else {
        dispatch({
          type: 'SET_MENSAJE',
          mensaje: 'Perfil actualizado correctamente',
        });
      }

      // Actualizar usuario en estado
      dispatch({
        type: 'SET_USUARIO',
        usuario: {
          ...state.usuario,
          ...data.usuario,
          fotoPerfil: state.fotoEliminada
            ? null
            : data.usuario?.fotoPerfil || state.usuario?.fotoPerfil,
        },
      });

      // Limpiar estados de imagen y flag de eliminación
      dispatch({ type: 'LIMPIAR_IMAGEN' });
      dispatch({ type: 'SET_FOTO_ELIMINADA', eliminada: false });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
      if (
        err.message.includes('Token') ||
        err.message.includes('autenticación')
      ) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      dispatch({ type: 'SET_CARGANDO', cargando: false });
    }
  }, [state, navigate, fetchUsuario]); // ✅ Añadir fetchUsuario a las dependencias

  // Función para confirmar antes de guardar
  const confirmarGuardado = useCallback(() => {
    if (state.nombreUsuario !== state.usuario?.nombreUsuario) {
      dispatch({ type: 'SET_MOSTRAR_CONFIRMACION', mostrar: true });
    } else {
      handleGuardar();
    }
  }, [state.nombreUsuario, state.usuario?.nombreUsuario, handleGuardar]);

  // Función para manejar la confirmación
  const handleConfirmacion = useCallback(
    (confirmar) => {
      dispatch({ type: 'SET_MOSTRAR_CONFIRMACION', mostrar: false });
      if (confirmar) {
        handleGuardar();
      }
    },
    [handleGuardar]
  );

  // Handler para seleccionar imagen
  const handleImagenSeleccionada = useCallback((event) => {
    const archivo = event.target.files[0];
    if (archivo) {
      // Si se selecciona una nueva imagen, cancelar la eliminación
      dispatch({ type: 'SET_FOTO_ELIMINADA', eliminada: false });

      // Validar tipo de archivo
      if (!LIMITES.IMAGEN.TIPOS_PERMITIDOS.includes(archivo.type)) {
        dispatch({
          type: 'SET_ERROR',
          error: 'Solo se permiten imágenes JPEG y PNG',
        });
        return;
      }

      // Validar tamaño
      if (archivo.size > LIMITES.IMAGEN.MAX_SIZE) {
        dispatch({
          type: 'SET_ERROR',
          error: 'La imagen no puede superar los 5MB',
        });
        return;
      }

      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        dispatch({
          type: 'SET_IMAGEN_SELECCIONADA',
          imagen: archivo,
          previsualizacion: e.target.result,
        });
      };
      reader.readAsDataURL(archivo);
    }
  }, []);

  // Función para eliminar imagen seleccionada
  const eliminarImagenSeleccionada = useCallback(() => {
    dispatch({ type: 'LIMPIAR_IMAGEN' });
  }, []);

  // Limpiar alertas después de un tiempo
  useEffect(() => {
    if (state.mensaje || state.error) {
      const timer = setTimeout(() => {
        dispatch({ type: 'LIMPIAR_ALERTAS' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.mensaje, state.error]);

  return {
    state,
    dispatch,
    navigate,
    handleGuardar,
    confirmarGuardado,
    handleConfirmacion,
    handleImagenSeleccionada,
    eliminarImagenSeleccionada,
    eliminarFotoActual,
  };
};

// Componente principal
export default function EditarPerfil() {
  const {
    state,
    dispatch,
    navigate,
    confirmarGuardado,
    handleConfirmacion,
    handleImagenSeleccionada,
    eliminarImagenSeleccionada,
    eliminarFotoActual,
  } = useEditarPerfil();

  // Función para cancelar la eliminación
  const cancelarEliminacion = useCallback(() => {
    dispatch({ type: 'SET_FOTO_ELIMINADA', eliminada: false });
  }, [dispatch]);

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
            border-radius: '16px';
            border: 'none';
            box-shadow: '0 20px 40px rgba(0,0,0,0.2)';
          }
        `}
      </style>

      {/* Card de edición */}
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
            onImageSelected={handleImagenSeleccionada}
            onRemoveImage={eliminarImagenSeleccionada}
          />
        </div>

        {/* Componente para eliminar foto */}
        <EliminarFotoLink
          usuario={state.usuario}
          fotoEliminada={state.fotoEliminada}
          onEliminarFoto={eliminarFotoActual}
          onCancelarEliminacion={cancelarEliminacion}
        />

        {/* Inputs */}
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Nombre completo *
            <span
              className="text-muted"
              style={{ fontSize: '0.8rem', marginLeft: '5px' }}
            >
              (solo letras y espacios)
            </span>
          </label>
          <input
            type="text"
            className="form-control"
            value={state.nombreCompleto}
            onChange={(e) =>
              dispatch({
                type: 'SET_CAMPO',
                campo: 'nombreCompleto',
                valor: e.target.value,
              })
            }
            style={{
              borderRadius: '14px',
              padding: '0.6rem 0.75rem',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
            }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">
            Nickname *
            <span
              className="text-muted"
              style={{ fontSize: '0.8rem', marginLeft: '5px' }}
            >
              (único, {LIMITES.NICKNAME.MIN}-{LIMITES.NICKNAME.MAX} caracteres,
              letras, números y _)
            </span>
          </label>

          <div className="position-relative">
            <input
              type="text"
              className="form-control"
              value={state.nombreUsuario}
              onChange={(e) =>
                dispatch({
                  type: 'SET_CAMPO',
                  campo: 'nombreUsuario',
                  valor: e.target.value,
                })
              }
              style={{
                borderRadius: '14px',
                padding: '0.6rem 0.75rem',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
                borderColor:
                  !state.validandoNickname && state.nombreUsuario
                    ? state.nicknameDisponible
                      ? '#198754'
                      : '#dc3545'
                    : '#ced4da',
                borderWidth: '1px',
                borderStyle: 'solid',
              }}
            />

            {/* Indicador de estado */}
            {state.validandoNickname && (
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
            )}

            {!state.validandoNickname &&
              state.nombreUsuario &&
              state.nicknameDisponible && (
                <div
                  className="position-absolute"
                  style={{
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    className="text-success"
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                  </svg>
                </div>
              )}

            {!state.validandoNickname &&
              state.nombreUsuario &&
              !state.nicknameDisponible && (
                <div
                  className="position-absolute"
                  style={{
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    className="text-danger"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
                  </svg>
                </div>
              )}
          </div>

          {/* Mensajes de ayuda */}
          {state.validandoNickname && (
            <div className="text-primary small mt-2">
              <i className="bi bi-hourglass-split me-1"></i>Verificando
              disponibilidad...
            </div>
          )}
          {!state.validandoNickname &&
            state.nombreUsuario &&
            !state.nicknameDisponible && (
              <div className="text-danger small mt-2">
                <i className="bi bi-exclamation-circle me-1"></i>Este nickname
                ya está en uso. Por favor, elige otro.
              </div>
            )}
          {!state.validandoNickname &&
            state.nombreUsuario &&
            state.nicknameDisponible && (
              <div className="text-success small mt-2">
                <i className="bi bi-check-circle me-1"></i>¡Perfecto! Este
                nickname está disponible.
              </div>
            )}
          {state.nombreUsuario &&
            state.nombreUsuario.length < LIMITES.NICKNAME.MIN && (
              <div className="text-warning small mt-2">
                <i className="bi bi-info-circle me-1"></i>El nickname debe tener
                al menos {LIMITES.NICKNAME.MIN} caracteres.
              </div>
            )}
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">
            Pronombres
            <span
              className="text-muted"
              style={{ fontSize: '0.8rem', marginLeft: '5px' }}
            >
              (ej: él/ella/elle, máx. {LIMITES.PRONOMBRES.MAX} caracteres)
            </span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Ej: él/ella/elle"
            value={state.pronombres}
            onChange={(e) =>
              dispatch({
                type: 'SET_CAMPO',
                campo: 'pronombres',
                valor: e.target.value,
              })
            }
            style={{
              borderRadius: '14px',
              padding: '0.6rem 0.75rem',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
            }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">
            Biografía
            <span
              className="text-muted"
              style={{ fontSize: '0.8rem', marginLeft: '5px' }}
            >
              (máx. {LIMITES.BIOGRAFIA.MAX} caracteres)
            </span>
          </label>
          <textarea
            className="form-control"
            placeholder="Cuéntanos algo sobre ti..."
            value={state.biografia}
            onChange={(e) =>
              dispatch({
                type: 'SET_CAMPO',
                campo: 'biografia',
                valor: e.target.value,
              })
            }
            rows="3"
            style={{
              borderRadius: '14px',
              padding: '0.6rem 0.75rem',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
            }}
          />
          <div className="text-end small text-muted mt-1">
            {state.biografia.length}/{LIMITES.BIOGRAFIA.MAX} caracteres
          </div>
        </div>

        <button
          className="btn btn-success w-100 py-2 fw-semibold"
          onClick={confirmarGuardado}
          disabled={
            state.cargando ||
            state.validandoNickname ||
            !state.nicknameDisponible
          }
          style={{
            borderRadius: '14px',
            boxShadow: '0 6px 18px rgba(34,197,94,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            opacity:
              state.cargando ||
              state.validandoNickname ||
              !state.nicknameDisponible
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

      {/* Card preview */}
      <div
        className="card p-4"
        style={{
          width: '550px',
          borderRadius: '24px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
          backgroundColor: '#fff',
        }}
      >
        <h5 className="text-center mb-3">Vista previa del perfil</h5>

        <div className="d-flex align-items-center gap-3 mb-3">
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#ddd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              color: '#888',
              position: 'relative',
            }}
          >
            {state.fotoEliminada ? (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc3545',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                }}
              >
                <img
                  src={perfilPlaceholder}
                  alt="Avatar por defecto"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%',
                  }}
                />
              </div>
            ) : state.previsualizacionImagen ? (
              <img
                src={state.previsualizacionImagen}
                alt="Nueva imagen"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                }}
              />
            ) : state.usuario?.fotoPerfil ? (
              <img
                src={state.usuario.fotoPerfil}
                alt="Avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                }}
              />
            ) : (
              <img
                src={perfilPlaceholder}
                alt="Avatar por defecto"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                }}
              />
            )}
          </div>
          <div>
            <h5 className="mb-1">
              @{state.nombreUsuario || state.usuario?.nombreUsuario}
            </h5>
            <h6 className="mb-1">
              {state.nombreCompleto || state.usuario?.nombreCompleto}
            </h6>
            <div className="d-flex gap-2">
              {state.pronombres && (
                <span className="badge bg-secondary">{state.pronombres}</span>
              )}
            </div>
          </div>
        </div>

        {state.biografia && (
          <div
            className="mt-3 p-3"
            style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}
          >
            <p className="mb-0" style={{ fontSize: '0.9rem', color: '#333' }}>
              {state.biografia}
            </p>
          </div>
        )}

        <div className="mt-3 text-center text-muted small">
          <i className="bi bi-eye"></i> Esta es una vista previa de cómo se verá
          tu perfil
        </div>
      </div>

      <ModalConfirmacion
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
              <strong>Importante:</strong> Tu sesión se renovará automáticamente
              y serás redirigido a tu nuevo perfil.
            </p>
            <p className="text-muted small">
              Tu antiguo nickname podrá ser usado por otros usuarios y todos tus
              tokens anteriores serán invalidados.
            </p>
          </>
        }
        onConfirmar={() => handleConfirmacion(true)}
        onCancelar={() => handleConfirmacion(false)}
      />
    </div>
  );
}
