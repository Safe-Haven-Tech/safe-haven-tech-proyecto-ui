import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import perfilPlaceholder from '../assets/perfil_placeholder.png';

const colors = {
  primary: '#22c55e',
  secondary: '#64748b',
  error: '#ef4444',
  white: '#ffffff',
  lightGray: '#f8fafc',
  darkGray: '#334155',
};

const spinnerStyle = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

export default function Profile() {
  const { nickname } = useParams();
  const navigate = useNavigate();



  const [usuario, setUsuario] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /** Decodifica token JWT del frontend */
  const getCurrentUser = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp < Date.now() / 1000) return null;
      return payload;
    } catch (err) {
      console.error('Error al decodificar token:', err);
      return null;
    }
  }, []);



  
  /** Fetch de usuario público por nickname */
  const fetchUsuario = useCallback(async (nickname) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/usuarios/public/${nickname}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        }
      );
      if (!res.ok) {
        if (res.status === 404) throw new Error('Usuario no encontrado');    
        throw new Error('Error al obtener datos del usuario');
      }
      const data = await res.json();
      return data.usuario;
    } catch (err) {
      console.error('Error fetchUsuario:', err);
      throw err;
    }
  }, []);

  /** Mapear campos para compatibilidad con frontend */
  const mapearUsuario = (user) => ({
    ...user,
    avatar: user.fotoPerfil,
    bio: user.biografia,
    nickname: user.nombreUsuario,
  });

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userData = await fetchUsuario(nickname);
        setUsuario(mapearUsuario(userData));

        const currentUser = getCurrentUser();
        const ownProfile = currentUser && currentUser.id === userData._id;
        setIsOwnProfile(ownProfile);

        // Puede ver contenido privado si es propio o es seguidor
       
       

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [nickname, fetchUsuario, getCurrentUser]);

  /** Toggle seguir/dejar de seguir */
  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/usuarios/${usuario._id}/seguir`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }
      );
      if (!res.ok) throw new Error('Error al seguir/dejar de seguir');

      const currentUser = getCurrentUser();
      const updatedUser = { ...usuario };
      if (updatedUser.seguidores?.includes(currentUser.id)) {
        updatedUser.seguidores = updatedUser.seguidores.filter(id => id !== currentUser.id);
       
      } else {
        updatedUser.seguidores = [...(updatedUser.seguidores || []), currentUser.id];
        
      }
      setUsuario(updatedUser);

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  /** Estados de carga o error */
  if (isLoading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <style>{spinnerStyle}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '1.2rem', color: colors.primary }}>
        <div style={{
          width: '3rem', height: '3rem',
          border: '0.4rem solid #f3f3f3',
          borderTop: `0.4rem solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }} />
        Cargando perfil...
      </div>
    </div>
  );

  if (error) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Volver al inicio</button>
      </div>
    </div>
  );

  /** Contenido privado */
  const isPrivateProfile = usuario.visibilidadPerfil === 'privado';
  

return (
  <div
    style={{
      minHeight: '100vh',
      width: '100%',
      background: '#fafafa',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '80px', // espacio para navbar
      paddingBottom: '6rem', // espacio inferior
    }}
  >
    <style>{spinnerStyle}</style>


{/* Header moderno tipo Instagram */}
<div className="bg-white border-bottom">
  <div className="container-fluid px-4">
    <div className="d-flex py-4">
      {/* Avatar */}
      <div className="me-4">
        <div
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #ffffff',          
            padding: '3px',
          }}
        >
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
            <img
              src={usuario.avatar || perfilPlaceholder}
              onError={(e) => { e.target.src = perfilPlaceholder; }}
              alt="perfil"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }}
            />
          </div>
        </div>
      </div>

      {/* Información del perfil */}
      <div className="flex-grow-1">
        {/* Fila 1: Nickname y botones */}
        <div className="d-flex align-items-center mb-3">
          <h1 className="h4 me-4 mb-0" style={{ fontWeight: '300' }}>
            {usuario.nickname || usuario.nombreUsuario}
          </h1>
          
          {/* Botones de acción */}
          {isOwnProfile ? (
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-dark btn-sm px-3"
                style={{ fontWeight: '600', fontSize: '14px' }}
                onClick={() => navigate('/editar-perfil')}
              >
                Editar perfil
              </button>
              <button
                className="btn btn-outline-dark btn-sm px-2"
                style={{ fontWeight: '600', fontSize: '14px' }}
                onClick={() => navigate('/configurar-perfil')}
              >
                 <i className="bi bi-gear"></i>
              </button>
            </div>
          ) : (
            <div className="d-flex gap-2">
              <button 
                className={`btn btn-sm px-4 ${
                  usuario.seguidores?.includes(getCurrentUser()?.id) 
                    ? 'btn-outline-dark' 
                    : 'btn-primary'
                }`}
                style={{ fontWeight: '600', fontSize: '14px' }}
                onClick={handleFollowToggle}
              >
                {usuario.seguidores?.includes(getCurrentUser()?.id) ? 'Siguiendo' : 'Seguir'}
              </button>
              <button className="btn btn-outline-dark btn-sm px-3" style={{ fontWeight: '600', fontSize: '14px' }}>
                Mensaje
              </button>
              <button className="btn btn-outline-dark btn-sm p-2">
                <i className="bi bi-person-plus"></i>
              </button>
            </div>
          )}
        </div>

        {/* Fila 2: Estadísticas */}
        <div className="d-flex gap-4 mb-3">
          <span><strong>{usuario.posts?.length || 0}</strong> publicaciones</span>
          <span style={{ cursor: 'pointer' }}>
            <strong>{usuario.seguidores?.length || 0}</strong> seguidores
          </span>
          <span style={{ cursor: 'pointer' }}>
            <strong>{usuario.seguidos?.length || 0}</strong> seguidos
          </span>
        </div>

        {/* Fila 3: Bio y detalles */}
        <div>
          <h2 className="h6 mb-1" style={{ fontWeight: '600' }}>
            {usuario.nombreCompleto}
          </h2>
          
          {usuario.pronombres && (
            <span className="badge bg-light text-dark me-2 mb-2" style={{ fontSize: '11px' }}>
              {usuario.pronombres}
            </span>
          )}
          
          <p className="mb-2" style={{ whiteSpace: 'pre-line', fontSize: '14px', lineHeight: '1.4' }}>
            {usuario.bio || usuario.biografia || (isOwnProfile ? 'Agrega una biografía desde "Editar perfil"' : '')}
          </p>
          
          {/* Indicadores de perfil */}
          <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '12px' }}>
            <span className={`badge ${usuario.visibilidadPerfil === 'publico' ? 'bg-success' : 'bg-warning'}`}>
              {usuario.visibilidadPerfil === 'publico' ? '🌐 Público' : '🔒 Privado'}
            </span>
            <span>•</span>
            <span className="text-capitalize">{usuario.rol}</span>
            {isOwnProfile && (
              <>
                <span>•</span>
                <span className="text-primary">Tu perfil</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


         {/* Contenido del perfil */}
           {/* Contenido del perfil */}
<div className="container py-3">
  {isPrivateProfile && !isOwnProfile ? (
    // PERFIL PRIVADO - No es el mío
    <div className="text-center p-5" style={{ color: colors.secondary }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}></div>
      <h4>Este perfil es privado</h4>
      <p className="text-muted mb-4">
        {getCurrentUser() 
          ? `Sigue a @${usuario.nickname || usuario.nombreUsuario} para ver sus fotos y videos.`
          : `Inicia sesión y sigue a @${usuario.nickname || usuario.nombreUsuario} para ver su contenido.`
        }
      </p>
      
      {/* Botones según estado del usuario */}
      {getCurrentUser() ? (
        <button 
          className="btn btn-primary" 
          onClick={handleFollowToggle}
        >
          {usuario.seguidores?.includes(getCurrentUser()?.id) ? 'Dejar de seguir' : 'Seguir'}
        </button>
      ) : (
        <div className="d-flex gap-2 justify-content-center">
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
          </button>
          <button 
            className="btn btn-outline-primary" 
            onClick={() => navigate('/register')}
          >
            Registrarse
          </button>
        </div>
      )}
    </div>
  ) : (
    // PERFIL PÚBLICO O PROPIO - Mostrar contenido
    <>
      {/* Mensaje si no hay posts */}
      {(!usuario.posts || usuario.posts.length === 0) && (
        <div className="text-center p-4">
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></div>
          <h5 className="text-muted mb-2">
            {isOwnProfile ? 'Aún no tienes publicaciones' : 'Este usuario no tiene publicaciones'}
          </h5>
          {isOwnProfile && (
            <p className="text-muted small">
              Comparte tus primeros momentos con tus seguidores
            </p>
          )}
        </div>
      )}

      {/* Grid de Posts */}
      {usuario.posts && usuario.posts.length > 0 && (
        <div className="row g-2">
          {usuario.posts.map((post, index) => (
            <div key={index} className="col-4">
              <div
                className="position-relative"
                style={{
                  aspectRatio: '1/1',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <img
                  src={post.imagen || usuario.avatar || perfilPlaceholder}
                  onError={(e) => { e.target.src = perfilPlaceholder; }}
                  alt="publicación"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
                
                {/* Overlay con estadísticas */}
                <div
                  className="position-absolute d-flex align-items-center justify-content-center gap-3"
                  style={{
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                >
                  <div className="d-flex align-items-center gap-1">
                    <i className="bi bi-heart-fill"></i> 
                    <span>{post.likes || 0}</span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <i className="bi bi-chat-fill"></i> 
                    <span>{post.comentarios || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )}
</div>
  </div>
);


}
