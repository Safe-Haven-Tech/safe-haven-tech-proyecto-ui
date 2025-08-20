import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const colors = {
  primary: '#22c55e',
  secondary: '#64748b',
  error: '#ef4444',
  success: '#22c55e',
  white: '#ffffff',
  lightGray: '#f8fafc',
  darkGray: '#334155',
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'linear-gradient(135deg, #f0f2f5 0%, #d9d9d9 100%)',
  },
  card: {
    maxWidth: '700px',
    width: '100%',
    borderRadius: '16px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    backgroundColor: colors.white,
    transition: 'all 0.3s ease',
  },
  header: {
    height: '140px',
    background: 'linear-gradient(90deg, #22c55e 0%, #3b6e48ff 100%)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 1.5rem',
    color: colors.white,
  },
  avatar: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    backgroundColor: colors.white,
    color: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.2rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    marginRight: '1rem',
  },
  name: { margin: 0, fontSize: '1.5rem', fontWeight: 600 },
  email: { color: colors.lightGray },
  infoCardsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    padding: '1.5rem',
  },
  infoCard: {
    flex: '1 1 45%',
    padding: '1rem',
    borderRadius: '12px',
    backgroundColor: '#f1f5f9',
    transition: 'all 0.2s ease',
    cursor: 'default',
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.8rem',
    marginTop: '1rem',
  },
  logoutBtn: {
    backgroundColor: colors.error,
    color: colors.white,
    borderRadius: '8px',
    padding: '10px 25px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1rem',
    marginBottom: '0.5rem',
    color: colors.secondary,
    fontSize: '0.9rem',
  },
  alertError: {
    backgroundColor: '#fef2f2',
    color: colors.error,
    border: `1px solid #fecaca`,
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '1rem',
  },
  loading: {
    fontSize: '1.2rem',
    color: colors.primary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  spinner: {
    width: '3rem',
    height: '3rem',
    border: '0.4rem solid #f3f3f3',
    borderTop: `0.4rem solid ${colors.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  ageCard: {
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
  },
};

const spinnerStyle = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

function parseJwt(token) {
  try {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch (err) {
    console.error('Error al decodificar token:', err);
    return null;
  }
}

export default function Profile() {
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const { userId } = useParams()

  // Función para obtener datos del usuario autenticado
  const getCurrentUser = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const decoded = parseJwt(token);
    if (!decoded || !decoded.id || (decoded.exp && decoded.exp < Date.now() / 1000)) {
      return null;
    }
    
    return decoded;
  };

  // Función para obtener datos de cualquier usuario
const fetchUsuario = async (targetUserId) => {
  try {
    // Usar la ruta pública SIN token
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/usuarios/public/${targetUserId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Usuario no encontrado');
      } else if (res.status === 403) {
        throw new Error('Este perfil es privado');
      } else {
        throw new Error('Error al obtener datos del usuario');
      }
    }

    const data = await res.json();
    if (!data.usuario) {
      throw new Error('La respuesta del servidor no contiene datos de usuario');
    }

    return data.usuario;

  } catch (err) {
    console.error('Error en fetchUsuario:', err);
    throw err;
  }
};


useEffect(() => {
  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validar que userId existe
      if (!userId) {
        setError('ID de usuario no válido');
        return;
      }

      // Obtener datos del usuario objetivo (sin verificar autenticación)
      const userData = await fetchUsuario(userId);
      setUsuario(userData);

      // Verificar si es perfil propio (opcional, para UI)
      const currentUserData = getCurrentUser();
      if (currentUserData) {
        const isOwn = userId === currentUserData.id.toString();
        setIsOwnProfile(isOwn);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  loadProfile();
}, [navigate, userId]); // ← Solo depende de userId


  // Componente de carga
  if (isLoading) {
    return (
      <div style={styles.container}>
        <style>{spinnerStyle}</style>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          Cargando perfil...
        </div>
      </div>
    );
  }


  // Componente de error
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.alertError}>{error}</div>
          <div className="text-center mt-3">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Función para seguir/dejar de seguir usuario (placeholder)
  const handleFollowToggle = async () => {
    // TODO: Implementar lógica para seguir/dejar de seguir
    console.log('Toggle follow para usuario:', usuario._id);
  };

  // Función para enviar mensaje (placeholder)
  const handleSendMessage = () => {
    // TODO: Implementar lógica de mensajes
    console.log('Enviar mensaje a usuario:', usuario._id);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#fafafa',
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        paddingTop: '80px',
      }}
    >
      <style>{spinnerStyle}</style>

      {/* Header tipo Instagram */}
      <div
        className="d-flex align-items-center justify-content-between p-4"
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #dbdbdb',
        }}
      >
        <div className="d-flex align-items-center gap-4">
          {/* Avatar */}
          <div
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <img
              src={
                usuario.avatar ||
                'https://static.vecteezy.com/system/resources/thumbnails/003/337/584/small_2x/default-avatar-photo-placeholder-profile-icon-vector.jpg'
              }
              alt="Avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div>
            <h2 style={{ margin: 0 }}>{usuario.nombreCompleto}</h2>
            <span
              className="text-muted"
              style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}
            >
              {usuario.rol}
            </span>

            {/* Indicador de perfil propio/ajeno */}
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>
              {isOwnProfile ? (
                <span>Tu perfil</span>
              ) : (
                <span>Perfil de usuario</span>
              )}
              {usuario.visibilidadPerfil && (
                <span>
                  {' • '}
                  {usuario.visibilidadPerfil === 'publico' ? 'Público' : 'Privado'}
                </span>
              )}
            </div>

            {/* Bio */}
            <p className="mt-2 mb-1">
              {usuario.bio || (isOwnProfile ? 'Agrega una bio desde configuración' : 'Sin bio')}
            </p>

            {/* Pronombres */}
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              {usuario.pronombres || (isOwnProfile ? 'Agrega pronombres' : 'Pronombres no especificados')}
            </p>

            {/* Estadísticas tipo Instagram */}
            <div className="d-flex gap-4 mt-2">
              <div>
                <strong>{usuario.posts?.length || 0}</strong> publicaciones
              </div>
              <div>
                <strong>{usuario.seguidores?.length || 0}</strong> seguidores
              </div>
              <div>
                <strong>{usuario.seguidos?.length || 0}</strong> seguidos
              </div>
            </div>

            {/* Botones de acción */}
            <div className="d-flex gap-2 mt-3">
              {isOwnProfile ? (
                // Botones para perfil propio
                <>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate('/editar-perfil')}
                  >
                    Editar perfil
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => navigate('/configurar-perfil')}
                  >
                    Configurar perfil
                  </button>
                </>
              ) : (
                // Botones para perfil ajeno
                <>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleFollowToggle}
                  >
                    {usuario.isFollowing ? 'Dejar de seguir' : 'Seguir'}
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleSendMessage}
                  >
                    Mensaje
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => navigate(-1)}
                  >
                    Volver
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor posts tipo cuadrícula Instagram */}
      <div className="container py-3">
        {(!usuario.posts || usuario.posts.length === 0) && (
          <p className="text-center text-muted">
            {isOwnProfile 
              ? 'Aún no tienes publicaciones' 
              : 'Este usuario no tiene publicaciones'}
          </p>
        )}

        {/* Aquí puedes agregar la cuadrícula de posts cuando la implementes */}
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
                    cursor: 'pointer'
                  }}
                >
                  {/* Aquí renderizarías cada post */}
                  <div className="d-flex align-items-center justify-content-center h-100">
                    Post {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}