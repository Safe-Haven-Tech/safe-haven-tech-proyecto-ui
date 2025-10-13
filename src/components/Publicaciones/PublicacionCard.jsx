/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import carruselStyles from '../../pages/Publicaciones/PostDetail.module.css';
import styles from '../../pages/Publicaciones/FeedPublicaciones.module.css';
import placeholderImage from '../../assets/perfil_placeholder.png';
import { likePublicacion, unlikePublicacion } from '../../services/publicacionesService';

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

function getUsuarioRolFromToken(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.rol || decoded.role || null;
  } catch {
    return null;
  }
}

const CarruselMultimedia = ({ multimedia }) => {
  const [indice, setIndice] = useState(0);
  if (!multimedia || multimedia.length === 0) return null;

  const siguiente = () => setIndice((indice + 1) % multimedia.length);
  const anterior = () => setIndice((indice - 1 + multimedia.length) % multimedia.length);

  const esVideo = (url) => {
    const ext = url.split('.').pop().toLowerCase();
    return ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
  };

  return (
    <div className={styles.cardImageContainer} style={{ position: 'relative' }}>
      {esVideo(multimedia[indice]) ? (
        <video
          src={multimedia[indice]}
          className={styles.cardImage}
          controls
          style={{ background: '#000' }}
        />
      ) : (
        <img
          src={multimedia[indice]}
          alt={`Multimedia ${indice + 1}`}
          className={styles.cardImage}
        />
      )}
      {multimedia.length > 1 && (
        <>
          <button
            type="button"
            onClick={anterior}
            className={`${carruselStyles.carruselBtn} ${carruselStyles.carruselBtnLeft}`}
            aria-label="Anterior"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <button
            type="button"
            onClick={siguiente}
            className={`${carruselStyles.carruselBtn} ${carruselStyles.carruselBtnRight}`}
            aria-label="Siguiente"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
          <div className={carruselStyles.carruselIndicators}>
            {multimedia.map((_, idx) => (
              <span
                key={idx}
                className={
                  idx === indice
                    ? `${carruselStyles.carruselIndicator} ${carruselStyles.carruselIndicatorActive}`
                    : carruselStyles.carruselIndicator
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const PublicacionCard = ({ publicacion, onDelete }) => {
  const navigate = useNavigate();

  if (!publicacion) return null;

  const {
    autorId,
    contenido,
    multimedia,
    likes,
    comentarios,
    fecha,
    _id
  } = publicacion;

  const token = localStorage.getItem('token');
  const usuarioId = getUsuarioIdFromToken(token);
  const usuarioRol = getUsuarioRolFromToken(token);

  const [yaDioLike, setYaDioLike] = useState(
    Array.isArray(likes) && usuarioId
      ? likes.includes(usuarioId)
      : false
  );
  const [likesCount, setLikesCount] = useState(Array.isArray(likes) ? likes.length : 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [copiado, setCopiado] = useState(false);

  // Permitir borrar si es autor o admin
  const puedeBorrar = usuarioId && (
    autorId?._id === usuarioId ||
    autorId === usuarioId ||
    usuarioRol === 'admin' ||
    usuarioRol === 'administrador'
  );

  // Menú de opciones (tres puntos)
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  // Confirmación de eliminación
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    }
    if (menuAbierto) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuAbierto]);

  const handleShare = (id) => {
    const url = `${window.location.origin}/publicacion/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    });
  };

  const handleLike = async () => {
    if (!token || !usuarioId) {
      setShowLoginModal(true);
      return;
    }
    setLikeLoading(true);
    try {
      if (yaDioLike) {
        const res = await unlikePublicacion(_id, token);
        setLikesCount(res.likes ? res.likes.length : 0);
        setYaDioLike(false);
      } else {
        const res = await likePublicacion(_id, token);
        setLikesCount(res.likes ? res.likes.length : 0);
        setYaDioLike(true);
      }
    } catch (err) {
      alert(err.message || 'Error al dar like');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleVerDetalle = () => {
    navigate(`/publicacion/${_id}`);
  };

  const handleIrPerfil = () => {
    if (autorId?.nombreUsuario) {
      navigate(`/perfil/${autorId.nombreUsuario}`);
    }
  };

  // Lógica de eliminación usando el prop onDelete
  const handleEliminar = async () => {
    setConfirmarEliminar(false);
    if (onDelete) {
      await onDelete(_id);
    }
  };

  return (
    <div className={styles.card}>
      {/* Carrusel de imágenes */}
      {multimedia && multimedia.length > 0 && (
        <CarruselMultimedia multimedia={multimedia} />
      )}
      {/* Autor y fecha */}
      <div className={styles.cardHeader}>
        <div
          className={styles.cardAutor}
          style={{ cursor: 'pointer' }}
          onClick={handleIrPerfil}
          aria-label={`Ir al perfil de ${autorId?.nombreCompleto || autorId?.nombreUsuario || 'usuario'}`}
        >
          <img
            src={autorId?.fotoPerfil || placeholderImage}
            alt="Avatar"
            className={styles.cardAvatar}
          />
          <span className={styles.cardAutorNombre}>
            {autorId?.nombreCompleto || autorId?.nombreUsuario || 'Anónimo'}
          </span>
        </div>
        <span className={styles.cardFecha}>
          {fecha ? new Date(fecha).toLocaleString() : ''}
        </span>
        {/* Botón de menú de opciones si es autor o admin */}
        {puedeBorrar && (
          <div className={styles.cardMenuWrapper} ref={menuRef}>
            <button
              className={styles.cardMenuBtn}
              onClick={e => { e.stopPropagation(); setMenuAbierto((v) => !v); }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setMenuAbierto((v) => !v);
                }
                if (e.key === 'Escape') {
                  setMenuAbierto(false);
                }
              }}
              title="Opciones"
              aria-label="Opciones"
              tabIndex={0}
              style={{
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: menuAbierto ? '#ede7f6' : 'none',
                border: menuAbierto ? '1.5px solid #603c7e' : 'none',
                boxShadow: menuAbierto ? '0 2px 8px rgba(96,60,126,0.13)' : 'none',
                transition: 'background 0.18s, border 0.18s, box-shadow 0.18s',
              }}
            >
              <i className="bi bi-three-dots-vertical" style={{ fontSize: '1.7rem', color: '#603c7e' }}></i>
            </button>
            {menuAbierto && (
              <div className={styles.cardMenu} style={{ marginTop: 8, minWidth: 140, position: 'absolute', right: 0 }}>
                {/* Flecha indicadora */}
                <div style={{
                  position: 'absolute',
                  top: -8,
                  right: 18,
                  width: 16,
                  height: 16,
                  background: '#fff',
                  transform: 'rotate(45deg)',
                  boxShadow: '0 -2px 8px rgba(96,60,126,0.07)',
                  zIndex: 1,
                }} />
                <button
                  className={styles.cardDeleteBtn}
                  onClick={e => { e.stopPropagation(); setMenuAbierto(false); setConfirmarEliminar(true); }}
                  style={{ padding: '12px 20px', fontSize: '1.08rem' }}
                >
                  <i className="bi bi-trash"></i> Eliminar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Contenido */}
      <div className={styles.cardContenido}>
        {contenido}
      </div>
      {/* Vista previa de comentarios estilo Instagram */}
      {Array.isArray(comentarios) && comentarios.length > 0 && (
        <div className={styles.comentariosPreview}>
          {comentarios
            .slice(0, 2)
            .map((comentario) => (
              <div key={comentario._id} className={styles.comentarioPreviewItem}>
                <img
                  src={comentario.usuarioId?.fotoPerfil || placeholderImage}
                  alt="Avatar"
                  className={styles.comentarioPreviewAvatar}
                />
                <div>
                  <span className={styles.comentarioPreviewAutor}>
                    {comentario.usuarioId?.nombreCompleto || 'Usuario'}
                  </span>
                  <span className={styles.comentarioPreviewContenido}>
                    {comentario.contenido}
                  </span>
                  <span className={styles.comentarioPreviewFecha}>
                    {' · '}
                    {comentario.fecha ? new Date(comentario.fecha).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            ))}
          <button
            className={styles.comentarioPreviewVerTodos}
            onClick={handleVerDetalle}
            aria-label="Ver todos los comentarios"
          >
            Ver todos los comentarios
          </button>
        </div>
      )}
      {/* Acciones */}
      <div className={styles.cardActions}>
        <button
          className={styles.cardLike}
          style={{
            background: yaDioLike ? '#603c7e' : '#fff',
            color: yaDioLike ? '#fff' : '#603c7e',
            border: 'none',
            borderRadius: '8px',
            cursor: likeLoading ? 'wait' : 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            padding: '8px 20px',
            boxShadow: yaDioLike ? '0 2px 8px rgba(96,60,126,0.10)' : 'none',
            transition: 'background 0.2s, box-shadow 0.2s',
          }}
          disabled={likeLoading}
          onClick={handleLike}
          aria-label={yaDioLike ? 'Quitar like' : 'Dar like'}
          title={yaDioLike ? 'Quitar like' : 'Dar like'}
        >
          <i className={`bi ${yaDioLike ? 'bi-heart-fill' : 'bi-heart'}`} style={{ marginRight: 8, fontSize: '1.4rem' }}></i>
          {likesCount}
        </button>
        <button
          className={styles.cardComment}
          style={{
            background: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            padding: '8px 20px',
            transition: 'background 0.2s',
          }}
          onClick={handleVerDetalle}
          aria-label="Ver comentarios"
          title="Ver comentarios"
        >
          <i className="bi bi-chat-left-text" style={{ marginRight: 8, fontSize: '1.4rem' }}></i>
          {Array.isArray(comentarios) ? comentarios.length : 0}
        </button>
        <button
          className={styles.cardVerMas}
          style={{
            background: '#603c7e',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            padding: '8px 20px',
            marginLeft: 'auto'
          }}
          onClick={handleVerDetalle}
          aria-label="Ver más"
          title="Ver más"
        >
          Ver más
        </button>
        <button
          className={styles.cardShare}
          style={{
            background: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            padding: '8px 20px',
            transition: 'background 0.2s',
          }}
          onClick={() => handleShare(_id)}
          aria-label="Compartir"
          title="Compartir"
        >
          <i className="bi bi-share" style={{ marginRight: 8, fontSize: '1.4rem' }}></i>
          Compartir
        </button>
        {copiado && (
          <span style={{ color: '#603c7e', marginLeft: 12, fontWeight: 500 }}>
            ¡Enlace copiado!
          </span>
        )}
      </div>
      {/* Confirmación de eliminación */}
      {confirmarEliminar && (
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
            <h4 style={{ color: '#d32f2f', marginBottom: 16 }}>¿Eliminar publicación?</h4>
            <p style={{ color: '#444', marginBottom: 24 }}>
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={handleEliminar}
                style={{
                  background: '#d32f2f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 'bold',
                  padding: '8px 18px'
                }}
              >Eliminar</button>
              <button
                onClick={() => setConfirmarEliminar(false)}
                style={{
                  background: '#fff',
                  color: '#603c7e',
                  border: '1px solid #603c7e',
                  borderRadius: 8,
                  fontWeight: 'bold',
                  padding: '8px 18px'
                }}
              >Cancelar</button>
            </div>
          </div>
        </div>
      )}
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
    </div>
  );
};

export default PublicacionCard;