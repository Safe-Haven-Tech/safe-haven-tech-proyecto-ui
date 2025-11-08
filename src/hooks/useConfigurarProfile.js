import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
  actualizarConfiguracion,
  cambiarContraseña,
  eliminarCuenta,
  fetchUsuarioCompleto,
} from '../services/profileServices';
import { parseJwt } from '../utils/token';

/**
 * Hook para manejar la pantalla de "Configurar perfil".
 * Provee estado y handlers para:
 *  - actualizar configuración general (anonimato, visibilidad, contraseña opcional)
 *  - cambiar contraseña con modal
 *  - eliminar cuenta con confirmación
 *
 * Usa tokens desde localStorage y actualiza el contexto de auth cuando procede.
 */
export const useConfigurarPerfil = () => {
  const [contraseña, setContraseña] = useState('');
  const [anonimo, setAnonimo] = useState(false);
  const [visibilidadPerfil, setVisibilidadPerfil] = useState('publico');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const { usuario, actualizarUsuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  // Cargar configuración inicial desde contexto o backend si falta
  useEffect(() => {
    let mounted = true;
    const cargar = async () => {
      if (usuario) {
        setAnonimo(Boolean(usuario.anonimo));
        setVisibilidadPerfil(usuario.visibilidadPerfil || 'publico');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) return navigate('/', { replace: true });

      try {
        const decoded = parseJwt(token);
        const userId = decoded?.id ?? decoded?._id ?? decoded?.sub;
        if (!userId) return;

        const usuarioData = await fetchUsuarioCompleto(userId, token);
        if (!mounted) return;
        if (usuarioData) {
          if (actualizarUsuario) actualizarUsuario(usuarioData);
          setAnonimo(Boolean(usuarioData.anonimo));
          setVisibilidadPerfil(usuarioData.visibilidadPerfil || 'publico');
        }
      } catch (err) {
        console.error(
          'useConfigurarPerfil cargarUsuario error:',
          err?.message || err
        );
        if (mounted) setError('No se pudo cargar la configuración del usuario');
      }
    };

    cargar();
    return () => {
      mounted = false;
    };
  }, [usuario, actualizarUsuario, navigate]);

  // Validar contraseña con reglas mínimas
  const validarContraseña = useCallback((pass) => {
    if (!pass) return 'La contraseña es obligatoria';
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;
    if (!regex.test(pass)) {
      return 'Debe tener 8-128 caracteres, al menos una mayúscula, una minúscula y un número';
    }
    return null;
  }, []);

  // Guardar configuración general (anonimato, visibilidad y contraseña opcional)
  const handleGuardar = useCallback(async () => {
    setError('');
    setMensaje('');

    if (contraseña) {
      const errVal = validarContraseña(contraseña);
      if (errVal) {
        setError(errVal);
        return;
      }
    }

    setCargando(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Sesión inválida');

      const decoded = parseJwt(token);
      const userId = decoded?.id ?? decoded?._id ?? decoded?.sub;
      if (!userId) throw new Error('Usuario no identificado');

      const payload = {
        nombreUsuario: decoded.nombreUsuario,
        anonimo: Boolean(anonimo),
        visibilidadPerfil: visibilidadPerfil || 'publico',
        ...(contraseña ? { contraseña } : {}),
      };

      const data = await actualizarConfiguracion(userId, payload, token);
      if (data?.usuario && actualizarUsuario) actualizarUsuario(data.usuario);

      setMensaje('Configuración actualizada correctamente');
      setContraseña('');
    } catch (err) {
      // mostrar mensaje claro
      const msg = err?.message || 'Error al guardar configuración';
      setError(msg);

      console.error('handleGuardar configurarPerfil error:', msg);
    } finally {
      setCargando(false);
    }
  }, [
    contraseña,
    anonimo,
    visibilidadPerfil,
    validarContraseña,
    actualizarUsuario,
  ]);

  // Cambiar contraseña (modal)
  const handleChangePassword = useCallback(async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword) {
      setPasswordError('Ambas contraseñas son obligatorias');
      return;
    }

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;
    if (!regex.test(newPassword)) {
      setPasswordError(
        'La nueva contraseña debe tener 8-128 caracteres, incluyendo al menos una mayúscula, una minúscula y un número'
      );
      return;
    }

    setChangingPassword(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Sesión inválida');

      const data = await cambiarContraseña(currentPassword, newPassword, token);

      if (data?.accessToken) localStorage.setItem('token', data.accessToken);
      if (data?.refreshToken)
        localStorage.setItem('refreshToken', data.refreshToken);
      if (data?.usuario && actualizarUsuario) actualizarUsuario(data.usuario);

      setPasswordSuccess('Contraseña cambiada exitosamente');
      setCurrentPassword('');
      setNewPassword('');
      setShowChangePasswordModal(false);
    } catch (err) {
      const msg = err?.message || 'Error al cambiar contraseña';
      setPasswordError(msg);

      console.error('handleChangePassword error:', msg);
    } finally {
      setChangingPassword(false);
    }
  }, [currentPassword, newPassword, actualizarUsuario]);

  // Eliminar cuenta (confirmación)
  const handleDeleteAccount = useCallback(async () => {
    setDeleteError('');
    if (!passwordConfirm) {
      setDeleteError('Por favor, ingresa tu contraseña para confirmar');
      return;
    }

    if (deleteConfirmation.trim().toLowerCase() !== 'eliminar') {
      setDeleteError('Por favor, escribe "ELIMINAR" para confirmar');
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Sesión inválida');

      const decoded = parseJwt(token);
      const userId = decoded?.id ?? decoded?._id ?? decoded?.sub;
      if (!userId) throw new Error('Usuario no identificado');

      await eliminarCuenta(userId, passwordConfirm, token);

      // Si todo OK, cerrar sesión y redirigir
      if (cerrarSesion) cerrarSesion();
      setMensaje('Cuenta eliminada correctamente. Redirigiendo...');
      setTimeout(() => navigate('/', { replace: true }), 1800);
    } catch (err) {
      const msg = err?.message || 'Error al eliminar la cuenta';
      setDeleteError(msg);

      console.error('handleDeleteAccount error:', msg);
    } finally {
      setIsDeleting(false);
    }
  }, [passwordConfirm, deleteConfirmation, cerrarSesion, navigate]);

  return {
    // estados
    contraseña,
    setContraseña,
    anonimo,
    setAnonimo,
    visibilidadPerfil,
    setVisibilidadPerfil,
    error,
    mensaje,
    cargando,

    // cambiar contraseña
    showChangePasswordModal,
    setShowChangePasswordModal,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    passwordError,
    passwordSuccess,
    changingPassword,
    handleChangePassword,

    // eliminar cuenta
    showDeleteModal,
    setShowDeleteModal,
    passwordConfirm,
    setPasswordConfirm,
    deleteError,
    setDeleteError,
    deleteConfirmation,
    setDeleteConfirmation,
    isDeleting,
    handleDeleteAccount,

    // acciones generales
    handleGuardar,
    validarContraseña,
  };
};
