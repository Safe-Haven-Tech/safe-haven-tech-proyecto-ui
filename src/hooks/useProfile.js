import { useState, useEffect, useCallback } from 'react';
import {
  fetchUsuarioPublico,
  toggleSeguirUsuario,
  getUsuarioActual,
} from '../services/profileServices';

import { mapearUsuario } from '../utils/mappers';

/**
 * Hook personalizado para manejar la lógica de perfiles de usuario
 * @param {string} nickname - Nickname del usuario a cargar
 * @returns {Object} Estado y funciones del perfil
 */
export const useProfile = (nickname) => {
  const [usuario, setUsuario] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función memoizada para obtener el usuario actual
  const getCurrentUser = useCallback(() => {
    return getUsuarioActual();
  }, []);

  // Función para cargar el perfil
  const loadProfile = useCallback(async () => {
    if (!nickname || nickname.trim() === '') {
      setError('Nickname inválido');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const userData = await fetchUsuarioPublico(nickname, token);
      const mappedUser = mapearUsuario(userData);

      setUsuario(mappedUser);

      // Verificar si es el perfil propio
      const currentUser = getCurrentUser();
      const ownProfile = currentUser && currentUser.id === userData._id;
      setIsOwnProfile(ownProfile);
    } catch (err) {
      console.error('❌ Error cargando perfil:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [nickname, getCurrentUser]);

  // Función para seguir/dejar de seguir
  const handleFollowToggle = useCallback(async () => {
    if (!usuario) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticación requerido');
      }

      await toggleSeguirUsuario(usuario._id, token);

      // Actualizar el estado local
      const currentUser = getCurrentUser();
      const updatedUser = { ...usuario };

      if (updatedUser.seguidores?.includes(currentUser?.id)) {
        updatedUser.seguidores = updatedUser.seguidores.filter(
          (id) => id !== currentUser.id
        );
      } else {
        updatedUser.seguidores = [
          ...(updatedUser.seguidores || []),
          currentUser.id,
        ];
      }

      setUsuario(updatedUser);
    } catch (err) {
      console.error('❌ Error al seguir/dejar de seguir:', err);
      setError(err.message);
      throw err; // Re-throw para que el componente pueda manejar el error si es necesario
    }
  }, [usuario, getCurrentUser]);

  // Función para refrescar el perfil
  const refreshProfile = useCallback(() => {
    loadProfile();
  }, [loadProfile]);

  // Cargar perfil cuando cambie el nickname
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    // Estado
    usuario,
    isOwnProfile,
    isLoading,
    error,

    // Funciones
    getCurrentUser,
    handleFollowToggle,
    refreshProfile,

    // Funciones de utilidad
    setError, // Para limpiar errores desde el componente
  };
};
