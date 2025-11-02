import { useState, useEffect, useCallback } from 'react';
import {
  fetchUsuarioPublico,
  getUsuarioActual,
  fetchPostsPerfilByUserId,
} from '../services/profileServices';

import {
  seguirUsuario,
  dejarDeSeguirUsuario,
  cancelarSolicitudSeguimiento,
} from '../services/redSocialServices';

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
  const [perfilPosts, setPerfilPosts] = useState([]);

  const getCurrentUser = useCallback(() => {
    try {
      return getUsuarioActual();
    } catch {
      return null;
    }
  }, []);

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

      if (!userData) {
        throw new Error('Usuario no encontrado');
      }

      const mappedUser = mapearUsuario(userData);
      setUsuario(mappedUser);

      const currentUser = getCurrentUser();
      const currentUserId = currentUser?.id ?? currentUser?._id ?? currentUser?.sub ?? null;
      const userId = userData._id ?? userData.id ?? mappedUser?._id ?? null;

      setIsOwnProfile(Boolean(currentUserId && userId && String(currentUserId) === String(userId)));

      try {
        const postsPerfil = await fetchPostsPerfilByUserId(userId, token);
        setPerfilPosts(Array.isArray(postsPerfil) ? postsPerfil : []);
      } catch (postsErr) {
        // No bloquear la carga del perfil si falla la carga de posts
        // eslint-disable-next-line no-console
        console.error('loadProfile posts error:', postsErr?.message || postsErr);
        setPerfilPosts([]);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('loadProfile error:', err?.message || err);
      setError(err?.message || 'Error cargando perfil');
      setUsuario(null);
      setPerfilPosts([]);
      setIsOwnProfile(false);
    } finally {
      setIsLoading(false);
    }
  }, [nickname, getCurrentUser]);

  const handleFollowToggle = useCallback(async () => {
    if (!usuario) return;

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) throw new Error('Usuario no autenticado');

      const currentUserId = currentUser?.id ?? currentUser?._id ?? currentUser?.sub ?? null;

      const yaSigo = Array.isArray(usuario.seguidores)
        ? usuario.seguidores.some((s) => {
            const sid = typeof s === 'object' ? s._id ?? s.id ?? null : s;
            return sid && String(sid) === String(currentUserId);
          })
        : false;

      if (yaSigo) {
        await dejarDeSeguirUsuario(usuario._id);
      } else {
        const res = await seguirUsuario(usuario._id);
        // No usar alert; propagar info en estado si es necesario
        if (res?.tipo === 'solicitud_enviada') {
          setError('Solicitud de seguimiento enviada');
        }
      }

      await loadProfile();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('handleFollowToggle error:', err?.message || err);
      setError(err?.message || 'Error al actualizar seguimiento');
      throw err;
    }
  }, [usuario, getCurrentUser, loadProfile]);

  const handleCancelRequest = useCallback(async () => {
    if (!usuario) return;
    try {
      await cancelarSolicitudSeguimiento(usuario._id);
      await loadProfile();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('handleCancelRequest error:', err?.message || err);
      setError(err?.message || 'Error al cancelar solicitud');
      throw err;
    }
  }, [usuario, loadProfile]);

  const refreshProfile = useCallback(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    usuario,
    isOwnProfile,
    isLoading,
    error,
    perfilPosts,

    getCurrentUser,
    handleFollowToggle,
    refreshProfile,
    handleCancelRequest,
    setError,
  };
};