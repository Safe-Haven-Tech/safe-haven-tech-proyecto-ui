// src/hooks/useConfigurarPerfil.js
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

  // Cargar configuración inicial
  useEffect(() => {
    if (usuario) {
      setAnonimo(usuario.anonimo);
      setVisibilidadPerfil(usuario.visibilidadPerfil || 'publico');
      return;
    }

    const cargarUsuario = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/', { replace: true });

      try {
        const decoded = parseJwt(token);
        const usuarioData = await fetchUsuarioCompleto(decoded.id, token);
        actualizarUsuario(usuarioData);
        setAnonimo(usuarioData.anonimo);
        setVisibilidadPerfil(usuarioData.visibilidadPerfil || 'publico');
      } catch (err) {
        console.error('Error cargando usuario:', err);
        setError('Error al cargar los datos del usuario');
      }
    };

    cargarUsuario();
  }, [navigate, usuario, actualizarUsuario]);

  // Validar contraseña
  const validarContraseña = useCallback((pass) => {
    if (!pass) return 'La contraseña es obligatoria';
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;
    if (!regex.test(pass)) {
      return 'Debe tener 8-128 caracteres, al menos una mayúscula, una minúscula y un número';
    }
    return null;
  }, []);

  // Guardar configuración
  const handleGuardar = useCallback(async () => {
    setError('');
    setMensaje('');

    const errorValidacion = contraseña ? validarContraseña(contraseña) : null;
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setCargando(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No se encontró token');

      const decoded = parseJwt(token);
      const configuracion = {
        nombreUsuario: decoded.nombreUsuario,
        ...(contraseña && { contraseña }),
        anonimo,
        visibilidadPerfil,
      };

      const data = await actualizarConfiguracion(
        decoded.id,
        configuracion,
        token
      );
      setMensaje('Configuración actualizada correctamente');
      setContraseña('');
      actualizarUsuario(data.usuario);
    } catch (err) {
      setError(err.message);
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

  // Cambiar contraseña
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
      const data = await cambiarContraseña(currentPassword, newPassword, token);

      if (data.accessToken) localStorage.setItem('token', data.accessToken);
      if (data.refreshToken)
        localStorage.setItem('refreshToken', data.refreshToken);
      if (data.usuario) actualizarUsuario(data.usuario);

      setPasswordSuccess('Contraseña cambiada exitosamente');
      setCurrentPassword('');
      setNewPassword('');
      setShowChangePasswordModal(false);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setChangingPassword(false);
    }
  }, [currentPassword, newPassword, actualizarUsuario]);

  // Eliminar cuenta
  const handleDeleteAccount = useCallback(async () => {
    if (!passwordConfirm) {
      setDeleteError('Por favor, ingresa tu contraseña para confirmar');
      return;
    }

    if (deleteConfirmation.toLowerCase() !== 'eliminar') {
      setDeleteError('Por favor, escribe "ELIMINAR" para confirmar');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      const token = localStorage.getItem('token');
      const decoded = parseJwt(token);
      await eliminarCuenta(decoded.id, passwordConfirm, token);

      cerrarSesion();
      setMensaje('Cuenta eliminada correctamente. Redirigiendo...');
      setTimeout(() => navigate('/', { replace: true }), 2000);
    } catch (err) {
      setDeleteError(err.message || 'Error al eliminar la cuenta');
    } finally {
      setIsDeleting(false);
    }
  }, [passwordConfirm, deleteConfirmation, cerrarSesion, navigate]);

  return {
    // Estados
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

    // Handlers
    handleGuardar,
    handleChangePassword,
    handleDeleteAccount,
    validarContraseña,
  };
};
