//src/pages/profile/ProfilePage.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import ProfileComponent from '../../components/Profile/ViewProfile/ProfileComponent';

import { useProfile } from '../../hooks/useProfile';

export default function Profile() {
  const { nickname } = useParams();
  const navigate = useNavigate();

  // Usar el hook personalizado para manejar toda la lógica del perfil
  const {
    usuario,
    isOwnProfile,
    isLoading,
    error,
    getCurrentUser,
    handleFollowToggle,
  } = useProfile(nickname);

  /** Handlers para botones del perfil propio */
  const handleEditProfile = () => {
    navigate('/editar-perfil');
  };

  const handleConfigureProfile = () => {
    navigate('/configurar-perfil');
  };

  // Wrapper para el toggle de seguir que maneja la navegación
  const handleFollowToggleWithNavigation = async () => {
    try {
      await handleFollowToggle();
    } catch (error) {
      // Si el error es por falta de token, redirigir al login
      if (error.message.includes('Token de autenticación requerido')) {
        navigate('/login');
      }
    }
  };

  // Usar el componente ProfileComponent
  return (
    <ProfileComponent
      usuario={usuario}
      isOwnProfile={isOwnProfile}
      isLoading={isLoading}
      error={error}
      nicknameParam={nickname}
      getCurrentUser={getCurrentUser}
      onFollowToggle={handleFollowToggleWithNavigation}
      onEditProfile={handleEditProfile}
      onConfigureProfile={handleConfigureProfile}
    />
  );
}
