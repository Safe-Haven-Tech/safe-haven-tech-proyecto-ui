/* filepath: f:\SafeHaven\safe-haven-tech-proyecto-ui\src\components\Profile\ViewProfile\ProfileComponent.jsx */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfileComponent.module.css';

// Asegúrate de que esta ruta sea correcta según tu estructura de carpetas
import perfilPlaceholder from '../../../assets/perfil_placeholder.png';


const ProfileComponent = React.memo(
  ({
    usuario,
    isOwnProfile,
    isLoading,
    error,
    nicknameParam,
    getCurrentUser,
    onFollowToggle,
    onEditProfile,
    onConfigureProfile,
  }) => {
    const navigate = useNavigate();

    /** Estados de carga o error */
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

    // Validar que el usuario existe antes de renderizar
    if (!usuario) {
      return (
        <div className={styles.errorContainer}>
          <div className={`alert alert-warning ${styles.errorText}`}>
            No se pudo cargar la información del usuario
          </div>
        </div>
      );
    }

    /** Contenido privado */
    const isPrivateProfile = usuario.visibilidadPerfil === 'privado';
    const currentUser = getCurrentUser();

    return (
      <div className={styles.profileContainer}>
        {/* Header moderno tipo Instagram */}
        <div className={styles.profileHeader}>
          <div className={`container-fluid ${styles.headerContainer}`}>
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
                    </div>
                  ) : (
                    <div className={styles.actionButtons}>
                      <button
                        className={`btn btn-sm ${
                          usuario.seguidores?.includes(currentUser?.id)
                            ? 'btn-outline-dark'
                            : 'btn-primary'
                        } ${styles.actionButton}`}
                        onClick={onFollowToggle}
                      >
                        {usuario.seguidores?.includes(currentUser?.id)
                          ? 'Siguiendo'
                          : 'Seguir'}
                      </button>
                      <button
                        className={`btn btn-outline-dark btn-sm ${styles.actionButton}`}
                      >
                        Mensaje
                      </button>
                      <button 
                        className={`btn btn-outline-dark btn-sm ${styles.actionButton} ${styles.iconButton}`}
                      >
                        <i className="bi bi-person-plus"></i>
                      </button>
                    </div>
                  )}
                </div>

                {/* Fila 2: Estadísticas */}
                <div className={styles.statsRow}>
                  <span className={styles.statItem}>
                    <strong>{usuario.posts?.length || 0}</strong>{' '}
                    <span className="d-none d-sm-inline">publicaciones</span>
                    <span className="d-inline d-sm-none">posts</span>
                  </span>
                  <span className={styles.statItem}>
                    <strong>{usuario.seguidores?.length || 0}</strong>{' '}
                    seguidores
                  </span>
                  <span className={styles.statItem}>
                    <strong>{usuario.seguidos?.length || 0}</strong>{' '}
                    seguidos
                  </span>
                </div>

                {/* Fila 3: Bio y detalles */}
                <div className={styles.bioSection}>
                  <h2 className={styles.fullName}>
                    {usuario.nombreCompleto}
                  </h2>

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
                    <span className="text-capitalize" style={{ color: '#6c757d' }}>
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
        <div className={`container ${styles.profileContent}`}>
          {isPrivateProfile && !isOwnProfile ? (
            // PERFIL PRIVADO - No es el mío
            <div className={styles.privateProfile}>
              <div className={styles.privateIcon}>🔒</div>
              <h4 className={styles.privateTitle}>Este perfil es privado</h4>
              <p className={`text-muted mb-4 ${styles.privateText}`}>
                {currentUser
                  ? `Sigue a @${usuario.nickname || usuario.nombreUsuario} para ver sus fotos y videos.`
                  : `Inicia sesión y sigue a @${usuario.nickname || usuario.nombreUsuario} para ver su contenido.`}
              </p>

              {/* Botones según estado del usuario */}
              {currentUser ? (
                <button 
                  className={`btn btn-primary ${styles.privateButton}`}
                  onClick={onFollowToggle}
                >
                  {usuario.seguidores?.includes(currentUser?.id)
                    ? 'Dejar de seguir'
                    : 'Seguir'}
                </button>
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
            // PERFIL PÚBLICO O PROPIO - Mostrar contenido
            <ProfileContent usuario={usuario} isOwnProfile={isOwnProfile} />
          )}
        </div>
      </div>
    );
  }
);

// Componente separado para el contenido de publicaciones
const ProfileContent = React.memo(({ usuario, isOwnProfile }) => {
  return (
    <>
      {/* Mensaje si no hay posts */}
      {(!usuario.posts || usuario.posts.length === 0) && (
        <div className={styles.noPostsContainer}>
          <div className={styles.noPostsIcon}>📷</div>
          <h5 className={`text-muted mb-2 ${styles.noPostsTitle}`}>
            {isOwnProfile
              ? 'Aún no tienes publicaciones'
              : 'Este usuario no tiene publicaciones'}
          </h5>
          {isOwnProfile && (
            <p className={`text-muted small ${styles.noPostsText}`}>
              Comparte tus primeros momentos con tus seguidores
            </p>
          )}
        </div>
      )}

      {/* Grid de Posts */}
      {usuario.posts && usuario.posts.length > 0 && (
        <div className={`row ${styles.postsGrid}`}>
          {usuario.posts.map((post, index) => (
            <PostGridItem key={index} post={post} usuario={usuario} />
          ))}
        </div>
      )}
    </>
  );
});

// Componente para cada item del grid de posts
const PostGridItem = React.memo(({ post, usuario }) => {
  return (
    <div className="col-4">
      <div className={styles.postItem}>
        <img
          src={post.imagen || usuario.avatar || perfilPlaceholder}
          onError={(e) => {
            e.target.src = perfilPlaceholder;
          }}
          alt="publicación"
          className={styles.postImage}
        />

        {/* Overlay con estadísticas */}
        <div className={styles.postOverlay}>
          <div className={styles.postStat}>
            <i className="bi bi-heart-fill"></i>
            <span>{post.likes || 0}</span>
          </div>
          <div className={styles.postStat}>
            <i className="bi bi-chat-fill"></i>
            <span>{post.comentarios || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProfileComponent;