import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login', { replace: true });

        const decoded = parseJwt(token);
        if (
          !decoded ||
          !decoded.id ||
          (decoded.exp && decoded.exp < Date.now() / 1000)
        ) {
          setSessionExpired(true);
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
          return;
        }

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/usuarios/${decoded.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!res.ok)
          throw new Error(
            res.status === 404
              ? 'Usuario no encontrado'
              : 'Error al obtener datos del usuario'
          );
        const data = await res.json();
        if (!data.usuario)
          throw new Error(
            'La respuesta del servidor no contiene datos de usuario'
          );

        setUsuario(data.usuario);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchUsuario();
  }, [navigate]);

  if (sessionExpired)
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.alertError}>
            Sesión expirada. Redirigiendo al login...
          </div>
        </div>
      </div>
    );
  if (error)
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.alertError}>{error}</div>
        </div>
      </div>
    );
  if (!usuario)
    return (
      <div style={styles.container}>
        <style>{spinnerStyle}</style>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>Cargando perfil...
        </div>
      </div>
    );

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#fafafa',
        display: 'flex',
        justifyContent: 'flex-start', // cambiar de 'center' a 'flex-start'
        flexDirection: 'column',
        paddingTop: '80px', // ajustar según altura del navbar
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
            {usuario.visibilidadPerfil && (
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                {usuario.visibilidadPerfil === 'publico'
                  ? 'Perfil público'
                  : 'Perfil privado'}
              </div>
            )}

            {/* agregar bio*/}
            <p> test de bio </p>
            {/* agregar pronombres*/}
            <p>Pronombres</p>

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
            <div className="d-flex gap-2 mt-2">
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
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor posts tipo cuadrícula Instagram */}
      <div className="container py-3">
        {(!usuario.posts || usuario.posts.length === 0) && (
          <p className="text-center text-muted">Aún no hay publicaciones</p>
        )}
      </div>
    </div>
  );
}
