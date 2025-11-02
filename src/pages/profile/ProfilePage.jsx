import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import ProfileComponent from '../../components/Profile/ViewProfile/ProfileComponent';
import { useProfile } from '../../hooks/useProfile';

/**
 * ProfilePage
 * - Componente de presentación para la página de perfil.
 * - Orquesta el hook useProfile (logica de datos) y provee handlers de navegación
 *   y control de errores al componente de vista.
 */
export default function ProfilePage() {
  const { nickname } = useParams();
  const navigate = useNavigate();

  const {
    usuario,
    isOwnProfile,
    isLoading,
    error,
    perfilPosts,
    getCurrentUser,
    handleFollowToggle,
    handleCancelRequest,
  } = useProfile(nickname);

  // Navegación a editar perfil
  const handleEditProfile = useCallback(() => {
    navigate('/editar-perfil');
  }, [navigate]);

  // Navegación a configuración de perfil
  const handleConfigureProfile = useCallback(() => {
    navigate('/configurar-perfil');
  }, [navigate]);

  // Wrapper para toggle follow con manejo sencillo de errores de autenticación.
  const handleFollowToggleWithNavigation = useCallback(async () => {
    try {
      await handleFollowToggle();
    } catch (err) {
      // Si la API devuelve un error relacionado con token, redirigir al login.
      // Nota: el string exacto puede variar según la implementación del backend.
      const mensaje = err?.message || '';
      if (mensaje.includes('Token de autenticación requerido') || mensaje.includes('Authentication required')) {
        navigate('/login');
      } else {
        // Re-lanzar para que caller (o un logger global) pueda manejarlo si procede.
        throw err;
      }
    }
  }, [handleFollowToggle, navigate]);

  return (
    <ProfileComponent
      usuario={usuario}
      isOwnProfile={isOwnProfile}
      isLoading={isLoading}
      error={error}
      perfilPosts={perfilPosts}
      nicknameParam={nickname}
      getCurrentUser={getCurrentUser}
      onFollowToggle={handleFollowToggleWithNavigation}
      onEditProfile={handleEditProfile}
      onConfigureProfile={handleConfigureProfile}
      onCancelRequest={handleCancelRequest}
    />
  );
}