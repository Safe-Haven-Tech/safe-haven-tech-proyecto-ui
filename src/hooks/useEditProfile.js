import { useReducer, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LIMITES } from '../utils/validators';
import { parseJwt, getToken as getStoredToken } from '../utils/token';
import { useAuth } from '../context/useAuth';
import {
  fetchUsuarioCompleto,
  actualizarPerfil,
  renovarToken,
} from '../services/profileServices';

// Estado inicial
const initialState = {
  usuario: null,
  nombreCompleto: '',
  nombreUsuario: '',
  biografia: '',
  pronombres: '',
  genero: '',
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
  errorNombre: '',
  errorNickname: '',
  errorPronombres: '',
  errorBiografia: '',
};

// Reducer
function perfilReducer(state, action) {
  switch (action.type) {
    case 'SET_CAMPO':
      return { ...state, [action.campo]: action.valor };

    case 'SET_FORM_DATA':
      return {
        ...state,
        nombreCompleto: action.payload.nombreCompleto || '',
        nombreUsuario: action.payload.nombreUsuario || '',
        biografia: action.payload.biografia || '',
        pronombres: action.payload.pronombres || '',
      };

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
      return {
        ...state,
        nicknameDisponible:
          action.disponible !== undefined
            ? action.disponible
            : action.disponible,
      };
    case 'SET_ERROR_NOMBRE':
      return { ...state, errorNombre: action.mensaje };
    case 'SET_ERROR_NICKNAME':
      return { ...state, errorNickname: action.mensaje };
    case 'SET_ERROR_PRONOMBRES':
      return { ...state, errorPronombres: action.mensaje };
    case 'SET_ERROR_BIOGRAFIA':
      return { ...state, errorBiografia: action.mensaje };
    case 'LIMPIAR_ERRORES':
      return {
        ...state,
        errorNombre: '',
        errorNickname: '',
        errorPronombres: '',
        errorBiografia: '',
      };
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

export const useEditarPerfil = () => {
  const [state, dispatch] = useReducer(perfilReducer, initialState);
  const navigate = useNavigate();
  const { actualizarUsuario } = useAuth();

  // Manejar invalidación de token
  const handleTokenInvalidation = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token available');

      const tokens = await renovarToken(refreshToken);
      // tokens puede venir con distintas keys; manejar varios casos
      if (tokens?.accessToken)
        localStorage.setItem('token', tokens.accessToken);
      else if (tokens?.nuevoToken)
        localStorage.setItem('token', tokens.nuevoToken);
      if (tokens?.refreshToken)
        localStorage.setItem('refreshToken', tokens.refreshToken);

      window.dispatchEvent(new Event('tokenChanged'));
      return true;
    } catch (error) {
      console.error('handleTokenInvalidation error:', error?.message || error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/login');
      return false;
    }
  }, [navigate]);

  // Obtener datos del usuario
  const fetchUsuario = useCallback(async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      const decoded = parseJwt(token);
      const userId = decoded?.id ?? decoded?._id ?? decoded?.sub;
      if (!userId) {
        throw new Error('Token inválido');
      }

      const usuario = await fetchUsuarioCompleto(userId, token);
      dispatch({ type: 'SET_USUARIO', usuario });
    } catch (error) {
      console.error('fetchUsuario error:', error?.message || error);

      const msg = String(error?.message || '').toLowerCase();

      if (msg.includes('token') || msg.includes('401') || msg.includes('403')) {
        const success = await handleTokenInvalidation();
        if (success) {
          const newToken = getStoredToken();
          const decoded = parseJwt(newToken);
          const userId = decoded?.id ?? decoded?._id ?? decoded?.sub;
          if (userId) {
            try {
              const usuario = await fetchUsuarioCompleto(userId, newToken);
              dispatch({ type: 'SET_USUARIO', usuario });
              return;
            } catch (err) {
              console.error('fetchUsuario retry error:', err?.message || err);
            }
          }
        }
      }

      dispatch({
        type: 'SET_ERROR',
        error: 'Error al cargar los datos del usuario',
      });
    }
  }, [handleTokenInvalidation, navigate]);

  // Cargar datos del usuario al montar
  useEffect(() => {
    fetchUsuario();
  }, [fetchUsuario]);

  // Handler para seleccionar imagen
  const handleImagenSeleccionada = useCallback(
    (event) => {
      const archivo = event?.target?.files?.[0];
      if (!archivo) return;

      // Validar tipo
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!tiposPermitidos.includes(archivo.type)) {
        dispatch({
          type: 'SET_ERROR',
          error: 'Solo se permiten imágenes JPG o PNG',
        });
        return;
      }

      // Validar tamaño (2MB máximo)
      const maxSize = 2 * 1024 * 1024;
      if (archivo.size > maxSize) {
        dispatch({
          type: 'SET_ERROR',
          error: 'La imagen no puede superar 2MB',
        });
        return;
      }

      dispatch({ type: 'SET_FOTO_ELIMINADA', eliminada: false });

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 300; // ancho/alto máximo para preview
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          } else if (height >= width && height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          dispatch({
            type: 'SET_IMAGEN_SELECCIONADA',
            imagen: archivo,
            previsualizacion: canvas.toDataURL('image/png'),
          });

          // Sincroniza los datos del formulario para el PreviewCard
          dispatch({
            type: 'SET_FORM_DATA',
            payload: {
              nombreCompleto: state.nombreCompleto,
              nombreUsuario: state.nombreUsuario,
              biografia: state.biografia,
              pronombres: state.pronombres,
            },
          });
        };
      };
      reader.readAsDataURL(archivo);
    },
    [
      state.nombreCompleto,
      state.nombreUsuario,
      state.biografia,
      state.pronombres,
    ]
  );

  // Eliminar imagen seleccionada
  const eliminarImagenSeleccionada = useCallback(() => {
    dispatch({ type: 'LIMPIAR_IMAGEN' });
  }, []);

  // Eliminar foto actual
  const eliminarFotoActual = useCallback(() => {
    dispatch({ type: 'SET_FOTO_ELIMINADA', eliminada: true });
  }, []);

  // Cancelar eliminación de foto
  const cancelarEliminacionFoto = useCallback(() => {
    dispatch({ type: 'SET_FOTO_ELIMINADA', eliminada: false });
  }, []);

  // Guardar cambios
  const handleGuardar = useCallback(async () => {
    dispatch({ type: 'SET_CARGANDO', cargando: true });
    dispatch({ type: 'LIMPIAR_ALERTAS' });

    try {
      const token = getStoredToken();
      const decoded = parseJwt(token);
      const userId = decoded?.id ?? decoded?._id ?? decoded?.sub;
      if (!userId) throw new Error('Token inválido');

      let datosActualizacion;
      let esFormData = false;

      if (state.imagenSeleccionada) {
        const formData = new FormData();
        formData.append('nombreCompleto', state.nombreCompleto.trim());
        formData.append('nombreUsuario', state.nombreUsuario.trim());
        formData.append('biografia', state.biografia.trim());
        formData.append('pronombres', state.pronombres.trim());
        formData.append('genero', state.genero.trim());
        formData.append('fotoPerfil', state.imagenSeleccionada);
        datosActualizacion = formData;
        esFormData = true;
      } else {
        datosActualizacion = {
          nombreCompleto: state.nombreCompleto.trim(),
          nombreUsuario: state.nombreUsuario.trim(),
          biografia: state.biografia.trim(),
          pronombres: state.pronombres.trim(),
          genero: state.genero.trim(),
          ...(state.fotoEliminada && { fotoPerfil: null }),
        };
      }

      const resultado = await actualizarPerfil(
        userId,
        datosActualizacion,
        token,
        esFormData
      );

      // Guardar tokens si vienen
      if (resultado?.accessToken)
        localStorage.setItem('token', resultado.accessToken);
      if (resultado?.refreshToken)
        localStorage.setItem('refreshToken', resultado.refreshToken);
      if (resultado?.nuevoToken)
        localStorage.setItem('token', resultado.nuevoToken);

      // Actualizar contexto de auth si es necesario
      const tokenParaDecodificar =
        resultado?.accessToken ?? resultado?.nuevoToken ?? token;
      try {
        const nuevoDecoded = parseJwt(tokenParaDecodificar);
        if (nuevoDecoded && actualizarUsuario) actualizarUsuario(nuevoDecoded);
      } catch (err) {
        console.error(
          'Decodificar token tras actualizar perfil error:',
          err?.message || err
        );
      }

      dispatch({
        type: 'SET_MENSAJE',
        mensaje: 'Perfil actualizado correctamente',
      });

      const usuarioActualizado = {
        ...state.usuario,
        ...(resultado.usuario || {}),
        fotoPerfil: state.fotoEliminada
          ? null
          : (resultado.usuario?.fotoPerfil ?? state.usuario?.fotoPerfil),
      };

      dispatch({
        type: 'SET_USUARIO',
        usuario: usuarioActualizado,
      });

      dispatch({ type: 'LIMPIAR_IMAGEN' });
      dispatch({ type: 'SET_FOTO_ELIMINADA', eliminada: false });

      // Redirigir si cambió el nickname
      const nicknameAnterior = state.usuario?.nombreUsuario;
      if (
        resultado.usuario?.nombreUsuario &&
        resultado.usuario.nombreUsuario !== nicknameAnterior
      ) {
        setTimeout(() => {
          navigate(`/perfil/${resultado.usuario.nombreUsuario}`, {
            replace: true,
          });
        }, 1200);
      }
    } catch (error) {
      console.error('handleGuardar error:', error?.message || error);

      const status = error?.status ?? null;
      const body = error?.body ?? null;
      if (status === 413) {
        dispatch({
          type: 'SET_ERROR',
          error: 'La imagen es demasiado grande, máximo 2MB',
        });
      } else if (body && (body.message || body.mensaje)) {
        dispatch({ type: 'SET_ERROR', error: body.message || body.mensaje });
      } else if (
        String(error?.message || '')
          .toLowerCase()
          .includes('nickname')
      ) {
        dispatch({
          type: 'SET_ERROR',
          error: 'El nickname no está disponible',
        });
      } else {
        dispatch({ type: 'SET_ERROR', error: 'Error al actualizar el perfil' });
      }
    } finally {
      dispatch({ type: 'SET_CARGANDO', cargando: false });
    }
  }, [state, actualizarUsuario, navigate]);

  useEffect(() => {
    if (state.mensaje || state.error) {
      const timer = setTimeout(() => {
        dispatch({ type: 'LIMPIAR_ALERTAS' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state.mensaje, state.error]);

  return {
    state,
    dispatch,
    handleImagenSeleccionada,
    eliminarImagenSeleccionada,
    eliminarFotoActual,
    cancelarEliminacionFoto,
    handleGuardar,
    fetchUsuario,
  };
};
