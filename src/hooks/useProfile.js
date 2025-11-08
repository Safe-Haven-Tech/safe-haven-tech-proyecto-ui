import { useCallback, useEffect, useRef, useState } from 'react';
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
 * useProfile
 * - Hook que encapsula la carga y la gestión mínima de un perfil público.
 * - Evita actualizaciones de estado tras el desmontado del componente.
 * - Proporciona funciones estables para seguir / dejar de seguir y cancelar solicitudes.
 *
 * @param {string} nickname - Nickname del perfil a cargar
 * @returns {Object} Estado y acciones del perfil
 */
export const useProfile = (nickname) => {
  const [usuario, setUsuario] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [perfilPosts, setPerfilPosts] = useState([]);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Devuelve el usuario actualmente autenticado (si existe).
   * El wrapper protege la llamada frente a excepciones internas de getUsuarioActual.
   */
  const getCurrentUser = useCallback(() => {
    try {
      return getUsuarioActual();
    } catch {
      return null;
    }
  }, []);

  /**
   * Normaliza posibles estructuras de respuesta para obtener un array de posts.
   */
  const normalizePostsResponse = useCallback((postsResp) => {
    if (!postsResp) return [];
    if (Array.isArray(postsResp)) return postsResp;
    if (Array.isArray(postsResp.publicaciones)) return postsResp.publicaciones;
    if (Array.isArray(postsResp.posts)) return postsResp.posts;
    if (Array.isArray(postsResp.data)) return postsResp.data;
    // Fallback conservador
    return [];
  }, []);

  /**
   * Carga el perfil público y sus publicaciones asociadas.
   * - Protege actualizaciones de estado tras desmontado.
   * - Separa errores de perfil y de posts para no bloquear la UX.
   */
  const loadProfile = useCallback(async () => {
    if (!nickname || nickname.trim() === '') {
      if (mountedRef.current) {
        setError('Nickname inválido');
        setIsLoading(false);
      }
      return;
    }

    if (mountedRef.current) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const token = localStorage.getItem('token');
      const userData = await fetchUsuarioPublico(nickname, token);

      if (!userData) {
        throw new Error('Usuario no encontrado');
      }

      const mappedUser = mapearUsuario(userData);

      if (mountedRef.current) {
        setUsuario(mappedUser);
      }

      // Determinar si el perfil pertenece al usuario logueado
      const currentUser = getCurrentUser();
      const currentUserId =
        currentUser?.id ?? currentUser?._id ?? currentUser?.sub ?? null;
      const userId = userData._id ?? userData.id ?? mappedUser?._id ?? null;

      if (mountedRef.current) {
        setIsOwnProfile(
          Boolean(
            currentUserId && userId && String(currentUserId) === String(userId)
          )
        );
      }

      // Cargar posts del perfil: fallo aquí no debe abortar la carga del perfil
      try {
        const postsResp = await fetchPostsPerfilByUserId(userId, token);
        const posts = normalizePostsResponse(postsResp);
        if (mountedRef.current) {
          setPerfilPosts(posts);
        }
      } catch (postsErr) {
        // Loguear en consola para debugging sin bloquear la carga del perfil

        console.error(
          'useProfile: fetch posts error',
          postsErr?.message || postsErr
        );
        if (mountedRef.current) setPerfilPosts([]);
      }
    } catch (err) {
      console.error('useProfile: loadProfile error', err?.message || err);
      if (mountedRef.current) {
        setError(err?.message || 'Error cargando perfil');
        setUsuario(null);
        setPerfilPosts([]);
        setIsOwnProfile(false);
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [nickname, getCurrentUser, normalizePostsResponse]);

  /**
   * Toggle follow / unfollow
   * - Determina si el usuario actual ya sigue al perfil y ejecuta la acción inversa.
   * - Refresca el perfil tras completar la operación.
   * - Propaga el error para que los consumers puedan reaccionar (p. ej. navegación).
   */
  const handleFollowToggle = useCallback(async () => {
    if (!usuario) return;

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) throw new Error('Usuario no autenticado');

      const currentUserId =
        currentUser?.id ?? currentUser?._id ?? currentUser?.sub ?? null;

      const yaSigo = Array.isArray(usuario.seguidores)
        ? usuario.seguidores.some((s) => {
            const sid = typeof s === 'object' ? (s._id ?? s.id ?? null) : s;
            return sid && String(sid) === String(currentUserId);
          })
        : false;

      if (yaSigo) {
        await dejarDeSeguirUsuario(usuario._id);
      } else {
        const res = await seguirUsuario(usuario._id);
        // Si la API indica estado especial (por ejemplo solicitud enviada) actualizamos error/estado informativo.
        if (res?.tipo === 'solicitud_enviada' && mountedRef.current) {
          setError('Solicitud de seguimiento enviada');
        }
      }

      // Refrescar perfil para reflejar cambio en seguidores / estado
      await loadProfile();
    } catch (err) {
      console.error(
        'useProfile: handleFollowToggle error',
        err?.message || err
      );
      if (mountedRef.current)
        setError(err?.message || 'Error al actualizar seguimiento');
      throw err;
    }
  }, [usuario, getCurrentUser, loadProfile]);

  /**
   * Cancela una solicitud de seguimiento pendiente.
   * - Refresca el perfil tras completar la operación.
   */
  const handleCancelRequest = useCallback(async () => {
    if (!usuario) return;
    try {
      await cancelarSolicitudSeguimiento(usuario._id);
      await loadProfile();
    } catch (err) {
      console.error(
        'useProfile: handleCancelRequest error',
        err?.message || err
      );
      if (mountedRef.current)
        setError(err?.message || 'Error al cancelar solicitud');
      throw err;
    }
  }, [usuario, loadProfile]);

  const refreshProfile = useCallback(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    void loadProfile();
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

export default useProfile;
