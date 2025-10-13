import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './PostDetail.module.css';
import placeholderImage from '../../assets/perfil_placeholder.png';
import { fetchPublicacionPorId, likePublicacion, unlikePublicacion, comentarPublicacion, eliminarComentario } from '../../services/publicacionesService';

function getUsuarioIdFromToken(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.id || decoded._id || null;
  } catch {
    return null;
  }
}

// Extrae el rol del usuario desde el token JWT
function getUsuarioRolFromToken(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.rol || null;
  } catch {
    return null;
  }
}

const ImagenesCarrusel = ({ imagenes }) => {
  const [indice, setIndice] = useState(0);
  if (!imagenes || imagenes.length === 0) return null;
  const siguiente = () => setIndice((indice + 1) % imagenes.length);
  const anterior = () => setIndice((indice - 1 + imagenes.length) % imagenes.length);

  // Detecta si es video por extensión
  const esVideo = (url) => {
    const ext = url.split('.').pop().toLowerCase();
    return ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
  };

  return (
    <div className="d-flex flex-column align-items-center mb-3">
      <div className={styles.carruselContainer}>
        {esVideo(imagenes[indice]) ? (
          <video
            src={imagenes[indice]}
            className={styles.carruselImg}
            controls
            style={{ background: '#000' }}
          />
        ) : (
          <img
            src={imagenes[indice]}
            alt={`multimedia-${indice + 1}`}
            className={styles.carruselImg}
          />
        )}
        {imagenes.length > 1 && (
          <>
            <button
              type="button"
              onClick={anterior}
              className={`btn btn-light ${styles.carruselBtn} ${styles.carruselBtnLeft}`}
              aria-label="Anterior"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button
              type="button"
              onClick={siguiente}
              className={`btn btn-light ${styles.carruselBtn} ${styles.carruselBtnRight}`}
              aria-label="Siguiente"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </>
        )}
        {imagenes.length > 1 && (
          <div className={styles.carruselIndicators}>
            {imagenes.map((_, idx) => (
              <span
                key={idx}
                className={
                  idx === indice
                    ? `${styles.carruselIndicator} ${styles.carruselIndicatorActive}`
                    : styles.carruselIndicator
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PostDetail = () => {
  const { id } = useParams();
  const [publicacion, setPublicacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);

  // Obtener token, usuarioId y rol desde el token JWT
  const token = localStorage.getItem('token');
  const usuarioId = getUsuarioIdFromToken(token);
  const usuarioRol = getUsuarioRolFromToken(token);

  // Estado para likes
  const [yaDioLike, setYaDioLike] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Estado para comentarios
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [comentarioLoading, setComentarioLoading] = useState(false);
  const [comentarioError, setComentarioError] = useState('');

  // Estado para modal de login
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Estado para menú de opciones de comentario
  const [comentarioMenuOpen, setComentarioMenuOpen] = useState(null);

  useEffect(() => {
    const cargarPublicacion = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchPublicacionPorId(id);
        setPublicacion(data);
        setLikesCount(data.likes ? data.likes.length : 0);
        setYaDioLike(data.likes ? data.likes.some(uid => uid === usuarioId) : false);
      } catch (err) {
        setError(err.message || 'Error al cargar la publicación');
      } finally {
        setLoading(false);
      }
    };
    cargarPublicacion();
  }, [id, usuarioId]);

  const handleLike = async () => {
    if (!token || !usuarioId) {
      setShowLoginModal(true);
      return;
    }
    setLikeLoading(true);
    try {
      if (yaDioLike) {
        const res = await unlikePublicacion(id, token);
        setLikesCount(res.likes ? res.likes.length : 0); 
        setYaDioLike(false);
      } else {
        const res = await likePublicacion(id, token);
        setLikesCount(res.likes ? res.likes.length : 0); 
        setYaDioLike(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComentar = async (e) => {
    e.preventDefault();
    if (!comentarioTexto.trim()) return;
    setComentarioLoading(true);
    setComentarioError('');
    try {
      await comentarPublicacion(id, comentarioTexto, token);
      setComentarioTexto('');
      // Recargar publicación para mostrar el nuevo comentario
      const data = await fetchPublicacionPorId(id);
      setPublicacion(data);
    } catch (err) {
      setComentarioError(err.message || 'Error al comentar');
    } finally {
      setComentarioLoading(false);
    }
  };

const handleEliminarComentario = async (comentarioId) => {
  if (!window.confirm('¿Seguro que deseas eliminar este comentario?')) return;
  try {
    await eliminarComentario(id, comentarioId, token); // <-- CORREGIDO: agrega el id de la publicación
    // Recargar publicación para mostrar los comentarios actualizados
    const data = await fetchPublicacionPorId(id);
    setPublicacion(data);
  } catch (err) {
    alert(err.message || 'Error al eliminar el comentario');
  }
};

  // Cierra el menú si se hace click fuera
  useEffect(() => {
    const handleClickOutside = () => setComentarioMenuOpen(null);
    if (comentarioMenuOpen !== null) {
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [comentarioMenuOpen]);

  if (loading) return <div className="container my-5 text-center">Cargando publicación...</div>;
  if (error) return <div className="container my-5 alert alert-danger">{error}</div>;
  if (!publicacion) return null;
  return (
    <>
      <section className={`container ${styles.pageOffset} my-5`}>
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className={`${styles.cardContainer} shadow-sm border-0`}>
              <div className="card-body">
                {/* Autor y fecha */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  {publicacion.autorId?.anonimo ? (
                    <>
                      <img
                        src={publicacion.autorId?.fotoPerfil || placeholderImage}
                        alt="Avatar"
                        className={styles.cardAutorImg}
                      />
                      <span className={styles.cardAutorNombre}>Anónimo</span>
                    </>
                  ) : (
                    <a
                      href={`/perfil/${publicacion.autorId?.nombreUsuario}`}
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                      aria-label={`Ir al perfil de ${publicacion.autorId?.nombreCompleto || publicacion.autorId?.nombreUsuario || 'usuario'}`}
                    >
                      <img
                        src={publicacion.autorId?.fotoPerfil || placeholderImage}
                        alt="Avatar"
                        className={styles.cardAutorImg}
                      />
                      <span className={styles.cardAutorNombre}>
                        {publicacion.autorId?.nombreCompleto || publicacion.autorId?.nombreUsuario}
                      </span>
                    </a>
                  )}
                  <div style={{ marginLeft: 12 }}>
                    <div className={styles.cardAutorFecha}>
                      {new Date(publicacion.fecha).toLocaleString()}
                    </div>
                  </div>
                </div>
                {/* Carrusel de imágenes */}
                <ImagenesCarrusel imagenes={publicacion.multimedia || []} />
                {/* Contenido completo */}
                <div className={styles.cardContenido} style={{ background: '#f6f2fa', borderRadius: 12, padding: 16 }}>
                  {publicacion.contenido}
                </div>
                {/* Likes y comentarios */}
                <div className={styles.cardStats}>
                  <button
                    className={styles.cardLikes}
                    style={{
                      background: yaDioLike ? '#603c7e' : '#603c7e',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: likeLoading ? 'wait' : 'pointer',
                      outline: 'none',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 20px',
                      marginRight: '16px',
                      boxShadow: yaDioLike ? '0 2px 8px rgba(96,60,126,0.10)' : 'none',
                      transition: 'background 0.2s, box-shadow 0.2s',
                    }}
                    disabled={likeLoading}
                    onClick={handleLike}
                    aria-label={yaDioLike ? 'Quitar like' : 'Dar like'}
                    title={yaDioLike ? 'Quitar like' : 'Dar like'}
                  >
                    <i className={`bi ${yaDioLike ? 'bi-heart-fill' : 'bi-heart'}`} style={{ marginRight: 8, fontSize: '1.4rem' }}></i>
                    {likesCount} Me gusta
                  </button>
                  <span className={styles.cardComentarios}>
                    <i className="bi bi-chat-left-text" style={{ marginRight: 6, fontSize: '1.2rem', color: '#603c7e' }}></i>
                    {publicacion.comentarios?.length !== undefined
                      ? `${publicacion.comentarios.length} comentarios`
                      : '0 comentarios'}
                  </span>
                </div>
                {/* Etiquetas de usuarios */}
                {publicacion.etiquetasUsuarios && publicacion.etiquetasUsuarios.length > 0 && (
                  <div className={styles.cardEtiquetas}>
                    {publicacion.etiquetasUsuarios.map((user, idx) => (
                      <span key={idx} className={`badge bg-secondary ${styles.cardEtiqueta}`}>
                        @{user.nombreCompleto}
                      </span>
                    ))}
                  </div>
                )}
                {/* Comentarios */}
                <hr />
                <h5 className="mb-3" style={{ color: '#603c7e' }}>Comentarios</h5>
                {!token || !usuarioId ? (
                  <div className="alert alert-warning mb-3" style={{ borderRadius: 10 }}>
                    Para participar y comentar <a href="/register" style={{ color: '#603c7e', fontWeight: 'bold' }}>registrate</a> o  <a href="/login" style={{ color: '#603c7e', fontWeight: 'bold' }}>inicia sesión</a>
                  </div>
                ) : (
                  <form onSubmit={handleComentar} className="mb-3">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Escribe un comentario..."
                        value={comentarioTexto}
                        onChange={e => setComentarioTexto(e.target.value)}
                        disabled={comentarioLoading}
                        maxLength={500}
                        style={{ border: '1px solid #603c7e', borderRadius: '8px 0 0 8px' }}
                      />
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={comentarioLoading || !comentarioTexto.trim()}
                        style={{
                          background: '#603c7e',
                          border: 'none',
                          color: '#fff',
                          borderRadius: '0 8px 8px 0',
                          fontWeight: 'bold',
                          transition: 'background 0.2s',
                        }}
                      >
                        <i className="bi bi-send" style={{ marginRight: 6, fontSize: '1.2rem' }}></i>
                        {comentarioLoading ? 'Comentando...' : 'Comentar'}
                      </button>
                    </div>
                    {comentarioError && (
                      <div className="text-danger mt-2">{comentarioError}</div>
                    )}
                  </form>
                )}
                {publicacion.comentarios && publicacion.comentarios.length > 0 ? (
                  publicacion.comentarios.map((comentario, idx) => (
                    <div
                      key={idx}
                      className={styles.comentarioCard}
                      style={{
                        background: '#f8f6fc',
                        borderRadius: '12px',
                        boxShadow: '0 1px 6px rgba(96,60,126,0.07)',
                        padding: '12px 16px',
                        marginBottom: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                        {comentario.usuarioId?.anonimo ? (
                          <>
                            <img
                              src={comentario.usuarioId?.fotoPerfil || placeholderImage}
                              alt="Avatar"
                              className={styles.comentarioAutorImg}
                              style={{ boxShadow: '0 2px 8px rgba(96,60,126,0.10)' }}
                            />
                            <span className={styles.comentarioAutorNombre} style={{ marginLeft: 8 }}>
                              Anónimo
                            </span>
                          </>
                        ) : (
                          <a
                            href={`/perfil/${comentario.usuarioId?.nombreUsuario}`}
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                            aria-label={`Ir al perfil de ${comentario.usuarioId?.nombreCompleto || comentario.usuarioId?.nombreUsuario || 'usuario'}`}
                          >
                            <img
                              src={comentario.usuarioId?.fotoPerfil || placeholderImage}
                              alt="Avatar"
                              className={styles.comentarioAutorImg}
                              style={{ boxShadow: '0 2px 8px rgba(96,60,126,0.10)' }}
                            />
                            <span className={styles.comentarioAutorNombre} style={{ marginLeft: 8 }}>
                              {comentario.usuarioId?.nombreCompleto || comentario.usuarioId?.nombreUsuario}
                            </span>
                          </a>
                        )}
                        <span className={styles.comentarioAutorFecha} style={{ marginLeft: 'auto' }}>
                          {new Date(comentario.fecha).toLocaleString()}
                        </span>
                        {(usuarioRol === 'administrador' || comentario.usuarioId?._id === usuarioId) && (
                          <div style={{ position: 'relative', marginLeft: 8 }}>
                            <button
                              type="button"
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 4,
                                fontSize: 22,
                                color: '#603c7e'
                              }}
                              onClick={e => {
                                e.stopPropagation();
                                setComentarioMenuOpen(comentario._id);
                              }}
                              aria-label="Abrir menú de opciones"
                            >
                              <i className="bi bi-three-dots-vertical"></i>
                            </button>
                            {comentarioMenuOpen === comentario._id && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 28,
                                  right: 0,
                                  background: '#fff',
                                  borderRadius: 8,
                                  boxShadow: '0 2px 12px rgba(96,60,126,0.13)',
                                  zIndex: 10,
                                  minWidth: 140,
                                  padding: '8px 0'
                                }}
                                onClick={e => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  style={{
                                    width: '100%',
                                    background: 'none',
                                    border: 'none',
                                    color: '#d32f2f',
                                    fontWeight: 'bold',
                                    padding: '8px 18px',
                                    textAlign: 'left',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setComentarioMenuOpen(null);
                                    handleEliminarComentario(comentario._id);
                                  }}
                                >
                                  Eliminar comentario
                                </button>
                                {/* Aquí puedes agregar más opciones en el futuro */}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className={styles.comentarioContenido} style={{ marginLeft: 0, marginTop: 2 }}>
                        {comentario.contenido}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted">No hay comentarios aún.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Modal para login/registro */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '32px 28px',
            boxShadow: '0 6px 32px rgba(96,60,126,0.13)',
            textAlign: 'center',
            minWidth: 320,
            maxWidth: 360
          }}>
            <h4 style={{ color: '#603c7e', marginBottom: 16 }}>¡Únete a la comunidad!</h4>
            <p style={{ color: '#444', marginBottom: 24 }}>
              Para participar y dar "Me gusta" debes iniciar sesión o registrarte.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <a href="/login" className="btn btn-primary" style={{
                background: '#603c7e',
                border: 'none',
                borderRadius: 8,
                fontWeight: 'bold'
              }}>Iniciar sesión</a>
              <a href="/register" className="btn btn-outline-primary" style={{
                borderColor: '#603c7e',
                color: '#603c7e',
                borderRadius: 8,
                fontWeight: 'bold'
              }}>Registrarse</a>
            </div>
            <button
              onClick={() => setShowLoginModal(false)}
              style={{
                marginTop: 18,
                background: 'none',
                border: 'none',
                color: '#603c7e',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PostDetail;