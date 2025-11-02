// ...existing code...
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './PostDetail.module.css';
import placeholderImage from '../../assets/perfil_placeholder.png';
import {
  fetchPublicacionPorId,
  likePublicacion,
  unlikePublicacion,
  comentarPublicacion,
  eliminarComentario,
  deletePublicacion,
  denunciarPublicacion,
  denunciarComentario
} from '../../services/publicacionesService';

import DenunciaModal from '../../components/Publicaciones/Denuncia';

/**
 * Decodifica el token JWT para obtener el id del usuario.
 * Devuelve null si el token no es válido o no existe.
 */
function getUsuarioIdFromToken(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    // atob puede fallar en entornos no-browser; envolver en try/catch
    const decoded = JSON.parse(atob(payload));
    return decoded.id || decoded._id || null;
  } catch {
    return null;
  }
}


/**
 * Simple toast para mostrar mensajes no intrusivos.
 * Se oculta automáticamente tras timeout ms.
 */
const Toast = ({ message, show, onClose, timeout = 3500 }) => {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, timeout);
    return () => clearTimeout(t);
  }, [show, onClose, timeout]);

  if (!show) return null;
  return (
    <div className={styles.toastContainer} role="status" aria-live="polite">
      <div className={styles.toast}>{message}</div>
    </div>
  );
};

/**
 * Modal de confirmación reutilizable para acciones críticas.
 * Mensajes y callbacks pasan por props.
 */
const ConfirmModal = ({ show, title, message, onCancel, onConfirm, confirmText = 'Confirmar' }) => {
  if (!show) return null;
  return (
    <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
      <div className={styles.modalCard}>
        <h5 className={styles.modalTitle}>{title}</h5>
        <p className={styles.modalMessage}>{message}</p>
        <div className={styles.modalActions}>
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancelar</button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

/**
 * Carrusel ligero para imágenes / video.
 * Detecta video por extensión y muestra controles nativos cuando corresponde.
 */
const ImagenesCarrusel = ({ imagenes }) => {
  const [indice, setIndice] = useState(0);

  if (!imagenes || imagenes.length === 0) return null;

  const siguiente = useCallback(() => setIndice((i) => (i + 1) % imagenes.length), [imagenes.length]);
  const anterior = useCallback(() => setIndice((i) => (i - 1 + imagenes.length) % imagenes.length), [imagenes.length]);

  const esVideo = (url = '') => {
    const ext = url.split('.').pop()?.toLowerCase();
    return ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
  };

  return (
    <div className="d-flex flex-column align-items-center mb-3">
      <div className={styles.carruselContainer}>
        {esVideo(imagenes[indice]) ? (
          <video src={imagenes[indice]} className={styles.carruselImg} controls style={{ background: '#000' }} />
        ) : (
          <img src={imagenes[indice]} alt={`multimedia-${indice + 1}`} className={styles.carruselImg} />
        )}

        {imagenes.length > 1 && (
          <>
            <button
              type="button"
              onClick={anterior}
              className={`btn btn-light ${styles.carruselBtn} ${styles.carruselBtnLeft}`}
              aria-label="Anterior"
            >
              <i className="bi bi-chevron-left" />
            </button>
            <button
              type="button"
              onClick={siguiente}
              className={`btn btn-light ${styles.carruselBtn} ${styles.carruselBtnRight}`}
              aria-label="Siguiente"
            >
              <i className="bi bi-chevron-right" />
            </button>

            <div className={styles.carruselIndicators}>
              {imagenes.map((_, idx) => (
                <span
                  key={imagenes[idx] || idx}
                  className={idx === indice ? `${styles.carruselIndicator} ${styles.carruselIndicatorActive}` : styles.carruselIndicator}
                  aria-hidden
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ------------------------------
   Componente principal
   ------------------------------ */

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [publicacion, setPublicacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);

  const token = localStorage.getItem('token');
  const usuarioId = getUsuarioIdFromToken(token);

  // Likes
  const [yaDioLike, setYaDioLike] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Comentarios
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [comentarioLoading, setComentarioLoading] = useState(false);
  const [comentarioError, setComentarioError] = useState('');

  // UI modals / toasts / menus
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [comentarioMenuOpen, setComentarioMenuOpen] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Denuncias
  const [showDenunciaModal, setShowDenunciaModal] = useState(false);
  const [denunciaTarget, setDenunciaTarget] = useState(null); // { tipo: 'publicacion'|'comentario', id }

  // Confirm modal state centralizado para eliminar publicación/comentario
  const [confirmState, setConfirmState] = useState({ show: false, tipo: null, payload: null, title: '', message: '' });

  // Toast
  const [toast, setToast] = useState({ show: false, message: '' });

  const puedeBorrar = Boolean(
    publicacion &&
    usuarioId &&
    (publicacion.autorId && (publicacion.autorId._id === usuarioId || publicacion.autorId === usuarioId))
  );

  /* Cargar publicación por id y establecer estados relacionados */
  useEffect(() => {
    let mounted = true;
    const cargarPublicacion = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchPublicacionPorId(id);
        if (!mounted) return;
        setPublicacion(data);
        setLikesCount(data.likes ? data.likes.length : 0);
        setYaDioLike(data.likes ? data.likes.some((uid) => uid === usuarioId) : false);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || 'Error al cargar la publicación');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    cargarPublicacion();
    return () => {
      mounted = false;
    };
  }, [id, usuarioId]);

  /* Manejo de like/unlike con retroalimentación */
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
      setToast({ show: true, message: err?.message || 'Error al procesar like' });
    } finally {
      setLikeLoading(false);
    }
  };

  /* Enviar comentario */
  const handleComentar = async (e) => {
    e.preventDefault();
    if (!comentarioTexto.trim()) return;
    if (!token || !usuarioId) {
      setShowLoginModal(true);
      return;
    }
    setComentarioLoading(true);
    setComentarioError('');
    try {
      await comentarPublicacion(id, comentarioTexto, token);
      setComentarioTexto('');
      // recargar comentarios
      const data = await fetchPublicacionPorId(id);
      setPublicacion(data);
    } catch (err) {
      setComentarioError(err?.message || 'Error al comentar');
    } finally {
      setComentarioLoading(false);
    }
  };

  /*
   * Solicita confirmación para eliminar comentario/publicacion
   * Se abre modal confirmState; la acción concreta se realiza en handleConfirmAction.
   */
  const openConfirm = ({ tipo, payload, title, message }) => {
    setConfirmState({ show: true, tipo, payload, title, message });
  };

  /* Ejecuta la acción confirmada por el usuario */
  const handleConfirmAction = async () => {
    const { tipo, payload } = confirmState;
    setConfirmState((s) => ({ ...s, show: false }));
    try {
      if (tipo === 'eliminarComentario') {
        await eliminarComentario(id, payload, token);
        const data = await fetchPublicacionPorId(id);
        setPublicacion(data);
        setToast({ show: true, message: 'Comentario eliminado' });
      } else if (tipo === 'eliminarPublicacion') {
        await deletePublicacion(id, token);
        setToast({ show: true, message: 'Publicación eliminada' });
        // pequeña demora para que el toast sea visible antes de navegar
        setTimeout(() => navigate('/publicaciones'), 600);
      }
    } catch (err) {
      setToast({ show: true, message: err?.message || 'Error en la operación' });
    }
  };

  /* Manejo de menú clic fuera para cerrarlo */
  useEffect(() => {
    const handleClickOutsideMenu = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      window.addEventListener('mousedown', handleClickOutsideMenu);
      return () => window.removeEventListener('mousedown', handleClickOutsideMenu);
    }
    return undefined;
  }, [menuOpen]);

  /* Cierre global del menú de comentario si se hace click fuera */
  useEffect(() => {
    const handleClickOutside = () => setComentarioMenuOpen(null);
    if (comentarioMenuOpen !== null) {
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
    return undefined;
  }, [comentarioMenuOpen]);

  /* Preparar denuncia: abrir modal de denuncia con el objetivo */
  const prepararDenuncia = (target) => {
    setDenunciaTarget(target);
    setShowDenunciaModal(true);
    setMenuOpen(false);
    setComentarioMenuOpen(null);
  };

  /* Envía denuncia y refresca la publicación */
  const handleDenunciar = async ({ motivo, descripcion }) => {
    try {
      if (!denunciaTarget) throw new Error('Objetivo de denuncia no especificado');
      if (denunciaTarget.tipo === 'publicacion') {
        await denunciarPublicacion(denunciaTarget.id, motivo, descripcion);
      } else if (denunciaTarget.tipo === 'comentario') {
        await denunciarComentario(denunciaTarget.id, motivo, descripcion);
      } else {
        throw new Error('Tipo de denuncia no soportado');
      }
      setToast({ show: true, message: 'Denuncia enviada correctamente' });
      setShowDenunciaModal(false);
      setDenunciaTarget(null);
      const data = await fetchPublicacionPorId(id);
      setPublicacion(data);
    } catch (err) {
      setToast({ show: true, message: err?.message || 'Error al enviar denuncia' });
    }
  };

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
                <div className={styles.cardHeader}>
                  {publicacion.autorId?.anonimo ? (
                    <>
                      <img src={publicacion.autorId?.fotoPerfil || placeholderImage} alt="Avatar" className={styles.cardAutorImg} />
                      <span className={styles.cardAutorNombre}>Anónimo</span>
                    </>
                  ) : (
                    <a
                      href={`/perfil/${publicacion.autorId?.nombreUsuario}`}
                      className={styles.cardAutorLink}
                      aria-label={`Ir al perfil de ${publicacion.autorId?.nombreCompleto || publicacion.autorId?.nombreUsuario || 'usuario'}`}
                    >
                      <img src={publicacion.autorId?.fotoPerfil || placeholderImage} alt="Avatar" className={styles.cardAutorImg} />
                      <span className={styles.cardAutorNombre}>
                        {publicacion.autorId?.nombreCompleto || publicacion.autorId?.nombreUsuario}
                      </span>
                    </a>
                  )}

                  <div className={styles.cardFechaWrapper}>
                    <div className={styles.cardAutorFecha}>{new Date(publicacion.fecha).toLocaleString()}</div>
                  </div>

                  {/* Botón de tres puntos - menú de publicación */}
                  <div ref={menuRef} className={styles.cardMenuContainer}>
                    <div className={styles.cardMenuWrapper}>
                      <button
                        type="button"
                        className={styles.cardMenuBtn}
                        onClick={(e) => { e.stopPropagation(); setMenuOpen((prev) => !prev); }}
                        aria-label="Abrir opciones"
                      >
                        <i className="bi bi-three-dots-vertical" />
                      </button>

                      {menuOpen && (
                        <div className={styles.cardMenu} onClick={(e) => e.stopPropagation()}>
                          {puedeBorrar ? (
                            <button
                              type="button"
                              className={styles.cardMenuButtonDanger}
                              onClick={() =>
                                openConfirm({
                                  tipo: 'eliminarPublicacion',
                                  payload: id,
                                  title: 'Eliminar publicación',
                                  message: '¿Seguro que deseas eliminar esta publicación?'
                                })
                              }
                              aria-label="Eliminar publicación"
                            >
                              <span className={styles.cardMenuButtonText}>Eliminar publicación</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className={styles.cardMenuButton}
                              onClick={() => prepararDenuncia({ tipo: 'publicacion', id: publicacion._id || id })}
                              aria-label="Denunciar publicación"
                            >
                              <span className={styles.cardMenuButtonText}>Denunciar publicación</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Carrusel */}
                <ImagenesCarrusel imagenes={publicacion.multimedia || []} />

                {/* Contenido */}
                <div className={styles.cardContenidoBox}>
                  {publicacion.contenido}
                </div>

                {/* Likes y contador de comentarios */}
                <div className={styles.cardStats}>
                  <button
                    className={styles.cardLikes}
                    style={{
                      background: '#603c7e',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      cursor: likeLoading ? 'wait' : 'pointer',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 20px',
                      marginRight: 16,
                      boxShadow: yaDioLike ? '0 2px 8px rgba(96,60,126,0.10)' : 'none',
                      transition: 'background 0.2s, box-shadow 0.2s'
                    }}
                    disabled={likeLoading}
                    onClick={handleLike}
                    aria-label={yaDioLike ? 'Quitar like' : 'Dar like'}
                    title={yaDioLike ? 'Quitar like' : 'Dar like'}
                  >
                    <i className={`bi ${yaDioLike ? 'bi-heart-fill' : 'bi-heart'}`} style={{ marginRight: 8, fontSize: '1.4rem' }} />
                    {likesCount} Me gusta
                  </button>

                  <span className={styles.cardComentarios}>
                    <i className="bi bi-chat-left-text" style={{ marginRight: 6, fontSize: '1.2rem', color: '#603c7e' }} />
                    {publicacion.comentarios?.length !== undefined ? `${publicacion.comentarios.length} comentarios` : '0 comentarios'}
                  </span>
                </div>

                {/* Etiquetas de usuarios */}
                {publicacion.etiquetasUsuarios?.length > 0 && (
                  <div className={styles.cardEtiquetas}>
                    {publicacion.etiquetasUsuarios.map((user) => (
                      <span key={user._id || user.nombreUsuario} className={`badge bg-secondary ${styles.cardEtiqueta}`}>
                        @{user.nombreCompleto}
                      </span>
                    ))}
                  </div>
                )}

                <hr />

                <h5 className="mb-3" style={{ color: '#603c7e' }}>Comentarios</h5>

                {(!token || !usuarioId) ? (
                  <div className="alert alert-warning mb-3" style={{ borderRadius: 10 }}>
                    Para participar y comentar <a href="/register" style={{ color: '#603c7e', fontWeight: 'bold' }}>registrate</a> o <a href="/login" style={{ color: '#603c7e', fontWeight: 'bold' }}>inicia sesión</a>
                  </div>
                ) : (
                  <form onSubmit={handleComentar} className="mb-3">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Escribe un comentario..."
                        value={comentarioTexto}
                        onChange={(e) => setComentarioTexto(e.target.value)}
                        disabled={comentarioLoading}
                        maxLength={500}
                        style={{ border: '1px solid #603c7e', borderRadius: '8px 0 0 8px' }}
                        aria-label="Escribe un comentario"
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
                          fontWeight: 'bold'
                        }}
                      >
                        <i className="bi bi-send" style={{ marginRight: 6, fontSize: '1.2rem' }} />
                        {comentarioLoading ? 'Comentando...' : 'Comentar'}
                      </button>
                    </div>
                    {comentarioError && <div className="text-danger mt-2">{comentarioError}</div>}
                  </form>
                )}

                {/* Lista de comentarios (usar ids como key en lugar de index) */}
                {publicacion.comentarios && publicacion.comentarios.length > 0 ? (
                  publicacion.comentarios.map((comentario) => (
                    <div key={comentario._id} className={styles.comentarioCard}>
                      <div className={styles.comentarioHeader}>
                        {comentario.usuarioId?.anonimo ? (
                          <>
                            <img src={comentario.usuarioId?.fotoPerfil || placeholderImage} alt="Avatar" className={styles.comentarioAutorImg} />
                            <span className={styles.comentarioAutorNombre}>Anónimo</span>
                          </>
                        ) : (
                          <a
                            href={`/perfil/${comentario.usuarioId?.nombreUsuario}`}
                            className={styles.comentarioAutorLink}
                            aria-label={`Ir al perfil de ${comentario.usuarioId?.nombreCompleto || comentario.usuarioId?.nombreUsuario || 'usuario'}`}
                          >
                            <img src={comentario.usuarioId?.fotoPerfil || placeholderImage} alt="Avatar" className={styles.comentarioAutorImg} />
                            <span className={styles.comentarioAutorNombre}>{comentario.usuarioId?.nombreCompleto || comentario.usuarioId?.nombreUsuario}</span>
                          </a>
                        )}

                        <span className={styles.comentarioFecha}>{new Date(comentario.fecha).toLocaleString()}</span>

                        {usuarioId && (
                          <div className={styles.comentarioMenuWrapper}>
                            <button
                              type="button"
                              className={styles.comentarioMenuBtn}
                              onClick={(e) => { e.stopPropagation(); setComentarioMenuOpen(comentario._id); }}
                              aria-label="Abrir menú de comentario"
                            >
                              <i className="bi bi-three-dots-vertical" />
                            </button>
                            {comentarioMenuOpen === comentario._id && (
                              <div className={styles.comentarioMenu} onClick={(e) => e.stopPropagation()}>
                                {comentario.usuarioId?._id === usuarioId ? (
                                  <button
                                    type="button"
                                    className={styles.comentarioMenuEliminar}
                                    onClick={() => {
                                      setComentarioMenuOpen(null); // cerrar menú antes de abrir confirm
                                      openConfirm({
                                        tipo: 'eliminarComentario',
                                        payload: comentario._id,
                                        title: 'Eliminar comentario',
                                        message: '¿Seguro que deseas eliminar este comentario?'
                                      });
                                    }}
                                  >
                                    Eliminar comentario
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className={styles.comentarioMenuDenunciar}
                                    onClick={() => {
                                      setComentarioMenuOpen(null); // cerrar menú y abrir formulario de denuncia
                                      prepararDenuncia({ tipo: 'comentario', id: comentario._id });
                                    }}
                                  >
                                    Denunciar comentario
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className={styles.comentarioContenido}>{comentario.contenido}</div>
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

      {/* Modal para login/registro (simple) */}
      {showLoginModal && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <h4 className={styles.modalTitle} style={{ color: '#603c7e' }}>¡Únete a la comunidad!</h4>
            <p className={styles.modalMessage}>Para participar y dar "Me gusta" debes iniciar sesión o registrarte.</p>
            <div className={styles.modalActions}>
              <a href="/login" className="btn btn-primary" style={{ background: '#603c7e', border: 'none' }}>Iniciar sesión</a>
              <a href="/register" className="btn btn-outline-primary" style={{ borderColor: '#603c7e', color: '#603c7e' }}>Registrarse</a>
            </div>
            <button type="button" className="btn btn-link" onClick={() => setShowLoginModal(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Modal para confirmaciones */}
      <ConfirmModal
        show={confirmState.show}
        title={confirmState.title}
        message={confirmState.message}
        onCancel={() => setConfirmState((s) => ({ ...s, show: false }))}
        onConfirm={handleConfirmAction}
        confirmText="Eliminar"
      />

      {/* Modal de denuncia reutilizado */}
      {showDenunciaModal && (
        <DenunciaModal
          show={showDenunciaModal}
          onClose={() => { setShowDenunciaModal(false); setDenunciaTarget(null); }}
          onSubmit={handleDenunciar}
        />
      )}

      {/* Toast global */}
      <Toast message={toast.message} show={toast.show} onClose={() => setToast({ show: false, message: '' })} />
    </>
  );
};

export default PostDetail;