import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './ProfileComponent.module.css';
import perfilPlaceholder from '../../../assets/perfil_placeholder.png';
import FollowersList from './FollowersList';
import SolicitudesModal from './SolicitudesModal'; // Importa el modal
import DenunciaModal from '../../Publicaciones/Denuncia';
import { denunciarUsuario } from '../../../services/userServices';

// Utilidad para obtener un thumbnail de video
const getVideoThumbnail = (url) =>
  new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.currentTime = 0.5;
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        resolve(URL.createObjectURL(blob));
        URL.revokeObjectURL(video.src);
      }, 'image/jpeg', 0.8);
    };
    video.onerror = () => resolve('');
  });

const ProfileComponent = React.memo(
  ({
    usuario,
    isOwnProfile,
    isLoading,
    error,
    nicknameParam,
    getCurrentUser,
    onFollowToggle,
    onCancelRequest,
    onEditProfile,
    perfilPosts,
    onConfigureProfile,
  }) => {
    const navigate = useNavigate();
    const [showSolicitudes, setShowSolicitudes] = useState(false); // Estado para el modal

    // Estados para denuncia de usuario
    const [showDenunciaModal, setShowDenunciaModal] = useState(false);
    const [denunciaLoading, setDenunciaLoading] = useState(false);

    if (isLoading)
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingSpinner} />
            Cargando perfil...
          </div>
        </div>
      );

    if (error)
      return (
        <div className={styles.errorContainer}>
          <div className={`card p-4 ${styles.errorCard}`}>
            <div className={`alert alert-danger mb-3 ${styles.errorText}`}>
              {error}
            </div>
            <div className={styles.errorButtons}>
              <button
                className={`btn btn-primary ${styles.errorButton}`}
                onClick={() => navigate('/')}
              >
                Volver al inicio
              </button>
              <button
                className={`btn btn-outline-secondary ${styles.errorButton}`}
                onClick={() => window.location.reload()}
              >
                Reintentar
              </button>
            </div>
            <small className={`text-muted mt-3 ${styles.errorFooter}`}>
              Buscando: @{nicknameParam}
            </small>
          </div>
        </div>
      );

    if (!usuario) {
      return (
        <div className={styles.errorContainer}>
          <div className={`alert alert-warning ${styles.errorText}`}>
            No se pudo cargar la información del usuario
          </div>
        </div>
      );
    }

    const isPrivateProfile = usuario.visibilidadPerfil === 'privado';
    const currentUser = getCurrentUser();
    const yaSigo = usuario.seguidores?.some(
      (id) => String(id) === String(currentUser?.id)
    );
    const solicitudPendiente = usuario.solicitudesSeguidores?.some(
      (sol) => String(sol.usuarioId) === String(currentUser?.id)
    );

    return (
      <div className={styles.profileContainer}>
        {/* Header moderno tipo Instagram */}
        <div className={styles.profileHeader}>
          <div className={`container ${styles.headerContainer}`}>
            <div className={styles.profileInfo}>
              {/* Avatar */}
              <div className={styles.avatarContainer}>
                <div className={styles.avatarWrapper}>
                  <div className={styles.avatarImage}>
                    <img
                      src={usuario.avatar || perfilPlaceholder}
                      onError={(e) => {
                        e.target.src = perfilPlaceholder;
                      }}
                      alt="perfil"
                      className={styles.avatar}
                    />
                  </div>
                </div>
              </div>

              {/* Información del perfil */}
              <div className={styles.userInfo}>
                {/* Fila 1: Nickname y botones */}
                <div className={styles.nicknameRow}>
                  <h1 className={styles.nickname}>
                    {usuario.nickname || usuario.nombreUsuario}
                  </h1>

                  {/* Botones de acción */}
                  {isOwnProfile ? (
                    <div className={styles.actionButtons}>
                      <button
                        className={`btn btn-outline-dark btn-sm ${styles.actionButton}`}
                        onClick={onEditProfile}
                      >
                        Editar perfil
                      </button>
                      <button
                        className={`btn btn-outline-dark btn-sm ${styles.actionButton} ${styles.iconButton}`}
                        onClick={onConfigureProfile}
                      >
                        <i className="bi bi-gear"></i>
                      </button>
                      {/* Botón para abrir el modal de solicitudes */}
                      {usuario.visibilidadPerfil === 'privado' && (
                        <button
                          className={`btn btn-outline-dark btn-sm ${styles.actionButton}`}
                          onClick={() => setShowSolicitudes(true)}
                        >
                          Solicitudes de seguidores
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className={styles.actionButtons}>
                      {yaSigo ? (
                        <button
                          className={`btn btn-outline-dark btn-sm ${styles.actionButton}`}
                          onClick={onFollowToggle}
                        >
                          Siguiendo
                        </button>
                      ) : solicitudPendiente ? (
                        <button
                          className={`btn btn-warning btn-sm ${styles.actionButton}`}
                          onClick={onCancelRequest}
                        >
                          Pendiente
                        </button>
                      ) : (
                        <button
                          className={`btn btn-primary btn-sm ${styles.actionButton}`}
                          onClick={onFollowToggle}
                        >
                          Seguir
                        </button>
                      )}


                      {/* Denunciar usuario (solo si estoy autenticado y NO es mi propio perfil) */}
                      {currentUser && !isOwnProfile && (
                        <button
                          className={`btn btn-outline-danger btn-sm ${styles.actionButton}`}
                          onClick={() => setShowDenunciaModal(true)}
                          disabled={denunciaLoading}
                          title="Denunciar usuario"
                        >
                          {denunciaLoading ? 'Enviando...' : 'Denunciar'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Estadísticas SIEMPRE visibles */}
                <div className={styles.statsRow}>
                  <span className={styles.statItem}>
                    <strong>{perfilPosts ? perfilPosts.length : 0}</strong>{' '}
                    <span className="d-none d-sm-inline">publicaciones</span>
                    <span className="d-inline d-sm-none">posts</span>
                  </span>
                  <span className={styles.statItem}>
                    <strong>{usuario.seguidores?.length || 0}</strong> seguidores
                  </span>
                  <span className={styles.statItem}>
                    <strong>{usuario.seguidos?.length || 0}</strong> seguidos
                  </span>
                </div>

                <FollowersList usuarioId={usuario._id} />

                {/* Fila 3: Bio y detalles */}
                <div className={styles.bioSection}>
                  <h2 className={styles.fullName}>{usuario.nombreCompleto}</h2>

                  {usuario.pronombres && (
                    <span
                      className={`badge bg-light text-dark me-2 mb-2 ${styles.pronounsBadge}`}
                    >
                      {usuario.pronombres}
                    </span>
                  )}

                  <p className={styles.bio}>
                    {usuario.bio ||
                      usuario.biografia ||
                      (isOwnProfile
                        ? 'Agrega una biografía desde "Editar perfil"'
                        : '')}
                  </p>

                  {/* Indicadores de perfil */}
                  <div className={styles.badges}>
                    <span
                      className={`badge ${
                        usuario.visibilidadPerfil === 'publico'
                          ? 'bg-success'
                          : 'bg-warning'
                      } ${styles.badge}`}
                    >
                      {usuario.visibilidadPerfil === 'publico'
                        ? '🌐 Público'
                        : '🔒 Privado'}
                    </span>
                    <span style={{ color: '#6c757d' }}>•</span>
                    <span
                      className="text-capitalize"
                      style={{ color: '#6c757d' }}
                    >
                      {usuario.rol}
                    </span>
                    {isOwnProfile && (
                      <>
                        <span style={{ color: '#6c757d' }}>•</span>
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
        <div className={`container-fluid ${styles.profileContent}`}>
          {isPrivateProfile && !isOwnProfile && !yaSigo ? (
            // PERFIL PRIVADO - No es el mío y no lo sigo
            <div className={styles.privateProfile}>
              <div className={styles.privateIcon}>🔒</div>
              <h4 className={styles.privateTitle}>Este perfil es privado</h4>
              <p className={`text-muted mb-4 ${styles.privateText}`}>
                {currentUser
                  ? `Sigue a @${usuario.nickname || usuario.nombreUsuario} para ver sus fotos y videos.`
                  : `Inicia sesión y sigue a @${usuario.nickname || usuario.nombreUsuario} para ver su contenido.`}
              </p>
              {currentUser ? (
                solicitudPendiente ? (
                  <button
                    className={`btn btn-warning ${styles.privateButton}`}
                    onClick={onCancelRequest}
                  >
                    Pendiente
                  </button>
                ) : (
                  <button
                    className={`btn btn-primary ${styles.privateButton}`}
                    onClick={onFollowToggle}
                  >
                    Seguir
                  </button>
                )
              ) : (
                <div className={styles.privateButtons}>
                  <button
                    className={`btn btn-primary ${styles.privateButton}`}
                    onClick={() => navigate('/login')}
                  >
                    Iniciar sesión
                  </button>
                  <button
                    className={`btn btn-outline-primary ${styles.privateButton}`}
                    onClick={() => navigate('/register')}
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>
          ) : (
            <ProfileContent
              usuario={usuario}
              isOwnProfile={isOwnProfile}
              perfilPosts={perfilPosts}
            />
          )}
        </div>
        {isOwnProfile && (
          <button
            className={styles.fabCrearPost}
            title="Crear nueva publicación"
            onClick={() => navigate('/crear-post')}
          >
            <i className="bi bi-plus-lg"></i>
          </button>
        )}
        {/* Modal de solicitudes de seguidores */}
        <SolicitudesModal show={showSolicitudes} onClose={() => setShowSolicitudes(false)} />

        {/* Modal de denuncia de usuario */}
        {showDenunciaModal && (
          <DenunciaModal
            show={showDenunciaModal}
            onClose={() => setShowDenunciaModal(false)}
            onSubmit={async ({ motivo, descripcion }) => {
              try {
                setDenunciaLoading(true);
                const token = localStorage.getItem('token');
                await denunciarUsuario(token, usuario._id, motivo, descripcion);
                alert('Denuncia enviada correctamente');
                setShowDenunciaModal(false);
              } catch (err) {
                console.error('Error al denunciar usuario:', err);
                alert(err.message || 'Error al enviar denuncia');
              } finally {
                setDenunciaLoading(false);
              }
            }}
          />
        )}
      </div>
    );
  }
);

const ProfileContent = React.memo(({ usuario, isOwnProfile, perfilPosts }) => {
  return (
    <>
      {(!perfilPosts || perfilPosts.length === 0) && (
        <div className={styles.noPostsContainer}>
          <div className={styles.noPostsIcon}>📷</div>
          <h5 className={`text-muted mb-2 ${styles.noPostsTitle}`}>
            {isOwnProfile
              ? 'Aún no tienes publicaciones de perfil'
              : 'Este usuario no tiene publicaciones de perfil'}
          </h5>
          {isOwnProfile && (
            <p className={`text-muted small ${styles.noPostsText}`}>
              Comparte tus primeros momentos con tus seguidores
            </p>
          )}
        </div>
      )}

      {perfilPosts && perfilPosts.length > 0 && (
        <div className={`row justify-content-center ${styles.postsGrid}`}>
          {perfilPosts.map((post, index) => (
            <PostGridItem key={post._id || index} post={post} usuario={usuario} />
          ))}
        </div>
      )}
    </>
  );
});

const PostGridItem = React.memo(({ post, usuario }) => {
  const [thumb, setThumb] = React.useState('');
  const multimedia = Array.isArray(post.multimedia) ? post.multimedia : [];
  const primerArchivo = multimedia.length > 0 ? multimedia[0] : null;

  React.useEffect(() => {
    if (!primerArchivo) return;
    const ext = primerArchivo.split('.').pop().toLowerCase();
    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) {
      getVideoThumbnail(primerArchivo).then((t) => setThumb(t));
    }
  }, [primerArchivo]);

  const esVideo =
    primerArchivo &&
    ['mp4', 'webm', 'ogg', 'mov'].includes(
      primerArchivo.split('.').pop().toLowerCase()
    );

  const imagenSrc =
    esVideo && thumb
      ? thumb
      : primerArchivo ||
        usuario.avatar ||
        perfilPlaceholder;

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
      <div className={styles.postItem} style={{ cursor: 'pointer', position: 'relative' }}>
        <Link to={`/publicacion/${post._id}`}>
          <img
            src={imagenSrc}
            onError={(e) => {
              e.target.src = perfilPlaceholder;
            }}
            alt="publicación"
            className={styles.postImage}
            style={{ width: '100%', objectFit: 'cover', borderRadius: 12 }}
          />
          {esVideo && (
            <span
              style={{
                position: 'absolute',
                top: 8,
                right: 12,
                background: 'rgba(0,0,0,0.55)',
                color: '#fff',
                borderRadius: 6,
                padding: '2px 7px',
                fontSize: 18,
                zIndex: 2,
              }}
            >
              <i className="bi bi-play-fill"></i>
            </span>
          )}
        </Link>
        <div className={styles.postOverlay}>
          <div className={styles.postStat}>
            <i className="bi bi-heart-fill"></i>
            <span>{Array.isArray(post.likes) ? post.likes.length : post.likes || 0}</span>
          </div>
          <div className={styles.postStat}>
            <i className="bi bi-chat-fill"></i>
            <span>{Array.isArray(post.comentarios) ? post.comentarios.length : post.comentarios || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProfileComponent;
