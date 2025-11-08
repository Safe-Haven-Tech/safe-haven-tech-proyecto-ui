import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchDenunciaPorId,
  accionDenuncia,
} from '../../services/DenunciasServices';
import { deletePublicacion } from '../../services/publicacionesService';
import styles from './DenunciaDetail.module.css';
import avatar from '../../assets/perfil_placeholder.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ConfirmModal = ({
  show,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}) => {
  const btnRef = useRef(null);
  const prevActiveRef = useRef(null);

  useEffect(() => {
    if (!show) return;
    prevActiveRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel && onCancel();
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm && onConfirm();
      }
    };
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => btnRef.current?.focus(), 0);

    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      try {
        prevActiveRef.current?.focus?.();
      } catch {}
    };
  }, [show, onCancel, onConfirm]);

  if (!show) return null;

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1600,
    padding: 20,
  };
  const modalStyle = {
    background: '#fff',
    borderRadius: 8,
    maxWidth: 760,
    width: '100%',
    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
    overflow: 'auto',
    maxHeight: '90vh',
  };

  return ReactDOM.createPortal(
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel && onCancel();
      }}
    >
      <div style={modalStyle} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 id="confirm-modal-title">{title}</h2>
          <button
            className={styles.closeButton}
            onClick={onCancel}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className={styles.modalContent}>
          <p style={{ whiteSpace: 'pre-wrap' }}>{message}</p>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            {cancelText}
          </button>
          <button
            ref={btnRef}
            className={styles.saveButton}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const InfoModal = ({ show, title, message, onClose, okText = 'Aceptar' }) => {
  const okRef = useRef(null);
  const prevActiveRef = useRef(null);

  useEffect(() => {
    if (!show) return;
    prevActiveRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        onClose && onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => okRef.current?.focus(), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      try {
        prevActiveRef.current?.focus?.();
      } catch {}
    };
  }, [show, onClose]);

  if (!show) return null;

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1600,
    padding: 20,
  };
  const modalStyle = {
    background: '#fff',
    borderRadius: 8,
    maxWidth: 640,
    width: '100%',
    boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
    overflow: 'auto',
    maxHeight: '85vh',
  };

  return ReactDOM.createPortal(
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose && onClose();
      }}
    >
      <div style={modalStyle} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 id="info-modal-title">{title}</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className={styles.modalContent}>
          <p style={{ whiteSpace: 'pre-wrap' }}>{message}</p>
        </div>
        <div className={styles.modalActions}>
          <button ref={okRef} className={styles.saveButton} onClick={onClose}>
            {okText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default function DenunciaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [denuncia, setDenuncia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [autorObjetivo, setAutorObjetivo] = useState(null);
  const token = localStorage.getItem('token');

  const [confirmState, setConfirmState] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
  });
  const [infoState, setInfoState] = useState({
    show: false,
    title: '',
    message: '',
  });

  const perfilLinkParaUsuario = (usuarioObj) => {
    if (!usuarioObj) return '/perfil';
    const nombreUsuario =
      (typeof usuarioObj === 'string' ? null : usuarioObj.nombreUsuario) ||
      (usuarioObj.usuario && usuarioObj.usuario.nombreUsuario) ||
      usuarioObj.nickname ||
      usuarioObj.nombreUsuario ||
      null;
    if (typeof nombreUsuario === 'string' && nombreUsuario.trim() !== '') {
      return `/perfil/${encodeURIComponent(nombreUsuario)}`;
    }
    const idVal =
      usuarioObj._id || (typeof usuarioObj === 'string' ? usuarioObj : null);
    return idVal ? `/perfil/${idVal}` : '/perfil';
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const doc = await fetchDenunciaPorId(id, token);
        if (mounted) {
          setDenuncia(doc);
          setAutorObjetivo(null);
        }
      } catch (err) {
        console.error('Error cargando denuncia:', err);
        if (mounted) setDenuncia(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, token]);

  useEffect(() => {
    let mounted = true;
    const loadAutor = async () => {
      if (!denuncia) return;

      if (
        (denuncia.tipoDenuncia || denuncia.tipo) === 'usuario' &&
        denuncia.usuarioDenunciadoId
      ) {
        const u = denuncia.usuarioDenunciadoId;
        const avatarUrl =
          u?.fotoPerfil ||
          u?.avatar ||
          u?.foto ||
          u?.imagen ||
          u?.profilePicture ||
          null;
        if (avatarUrl) {
          if (mounted) setAutorObjetivo(u);
          return;
        }
        const idVal = typeof u === 'string' ? u : u?._id || u?.id || null;
        if (!idVal) {
          if (mounted) setAutorObjetivo(u);
          return;
        }
        try {
          const res = await fetch(
            `${API_URL.replace(/\/$/, '')}/api/usuarios/${encodeURIComponent(idVal)}`,
            {
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            }
          );
          if (!res.ok) {
            if (mounted) setAutorObjetivo(u);
            return;
          }
          const body = await res.json().catch(() => null);
          const user = body?.usuario || body || u;
          if (mounted) setAutorObjetivo(user);
        } catch (err) {
          console.error('Error cargando usuario denunciado', err);
          if (mounted) setAutorObjetivo(u);
        }
        return;
      }

      const objetivo = denuncia.publicacionId || denuncia.comentarioId;
      if (!objetivo) return;
      const autorId =
        (objetivo &&
          typeof objetivo.autorId === 'string' &&
          objetivo.autorId) ||
        (objetivo && typeof objetivo.autor === 'string' && objetivo.autor) ||
        (objetivo && objetivo.autorId?._id) ||
        (objetivo && objetivo.autor?._id) ||
        null;
      if (!autorId) return;
      try {
        const res2 = await fetch(
          `${API_URL.replace(/\/$/, '')}/api/usuarios/${encodeURIComponent(autorId)}`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        if (!res2.ok) return;
        const body2 = await res2.json().catch(() => null);
        const user2 = body2?.usuario || body2 || null;
        if (mounted) setAutorObjetivo(user2);
      } catch (e) {
        console.error('Error fetching autor objetivo', e);
      }
    };
    loadAutor();
    return () => {
      mounted = false;
    };
  }, [denuncia, token]);

  const reload = async () => {
    setLoading(true);
    try {
      const doc = await fetchDenunciaPorId(id, token);
      setDenuncia(doc);
      setAutorObjetivo(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (accion, payload = {}) => {
    setConfirmState((s) => ({ ...s, show: false, onConfirm: null }));
    try {
      setActionLoading(true);

      const estadoPorDefecto = {
        marcar_resuelta: 'resuelta',
        eliminar_publicacion: 'resuelta',
        eliminar_comentario: 'resuelta',
        desactivar_usuario: 'resuelta',
        desestimar: 'rechazada',
      };

      if (accion === 'eliminar_publicacion') {
        const pubId =
          payload.publicacionId ||
          (denuncia && (denuncia.publicacionId?._id || denuncia.publicacionId));
        if (!pubId) throw new Error('Falta publicacionId para eliminar');
        await deletePublicacion(pubId, token);
        setInfoState({
          show: true,
          title: 'Éxito',
          message: 'Publicación eliminada correctamente.',
        });
      } else if (accion === 'eliminar_comentario') {
        const comentarioObj =
          payload.comentarioId || (denuncia && denuncia.comentarioId);
        const comentarioVal =
          comentarioObj && (comentarioObj._id || comentarioObj);
        const pubId =
          payload.publicacionId ||
          (comentarioObj && comentarioObj.publicacionId) ||
          (denuncia && (denuncia.publicacionId?._id || denuncia.publicacionId));
        if (!comentarioVal || !pubId)
          throw new Error(
            'Falta comentarioId o publicacionId para eliminar comentario'
          );
        const res = await fetch(
          `${API_URL.replace(/\/$/, '')}/api/publicaciones/${pubId}/comentarios/${comentarioVal}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err.detalles || err.error || 'Error eliminando comentario'
          );
        }
        setInfoState({
          show: true,
          title: 'Éxito',
          message: 'Comentario eliminado correctamente.',
        });
      } else if (accion === 'desactivar_usuario') {
        const usuarioIdVal =
          payload.usuarioId ||
          (denuncia &&
            (denuncia.usuarioDenunciadoId?._id ||
              denuncia.usuarioDenunciadoId));
        if (!usuarioIdVal) throw new Error('Falta usuarioId para desactivar');
        const res = await fetch(
          `${API_URL.replace(/\/$/, '')}/api/usuarios/${usuarioIdVal}/desactivar`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              motivo:
                payload.motivo ||
                payload.observaciones ||
                'Desactivado por moderación',
            }),
          }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err.detalles || err.error || 'Error desactivando usuario'
          );
        }
        setInfoState({
          show: true,
          title: 'Éxito',
          message: 'Usuario desactivado correctamente.',
        });
      } else {
        console.log('Acción genérica:', accion);
      }

      const body = { accion, ...(payload || {}) };
      if (!body.estado) body.estado = estadoPorDefecto[accion] || 'resuelta';
      if (body.razon && !body.observaciones) {
        body.observaciones = body.razon;
        delete body.razon;
      }

      await accionDenuncia(id, body, token);
      setInfoState({
        show: true,
        title: 'Operación registrada',
        message: 'La acción fue registrada en la denuncia.',
      });
      await reload();
    } catch (err) {
      console.error(err);
      setInfoState({
        show: true,
        title: 'Error',
        message: err.message || 'Error al ejecutar acción',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const requestAction = (accion, payload = {}, options = {}) => {
    const title = options.title || 'Confirmar acción';
    const message =
      options.message || `¿Estás seguro de que deseas ejecutar "${accion}"?`;
    setConfirmState({
      show: true,
      title,
      message,
      onConfirm: () => executeAction(accion, payload),
    });
  };

  if (loading)
    return <div className={styles.container}>Cargando denuncia...</div>;
  if (!denuncia)
    return <div className={styles.container}>Denuncia no encontrada</div>;

  const {
    tipoDenuncia,
    motivo,
    descripcion,
    fecha,
    publicacionId,
    comentarioId,
    usuarioDenunciadoId,
    evidencia = [],
  } = denuncia;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h2>Denuncia: {tipoDenuncia || '—'}</h2>
          <div className={styles.meta}>
            {motivo} • {fecha ? new Date(fecha).toLocaleString() : ''}
          </div>
        </div>
        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() =>
              requestAction(
                'marcar_resuelta',
                {},
                {
                  title: 'Marcar resuelta',
                  message: '¿Confirmar marcar esta denuncia como resuelta?',
                }
              )
            }
            disabled={actionLoading}
          >
            Marcar resuelta
          </button>
          <button
            className={`${styles.btn}`}
            onClick={() =>
              requestAction(
                'desestimar',
                {},
                {
                  title: 'Desestimar',
                  message: '¿Confirmar desestimar esta denuncia?',
                }
              )
            }
            disabled={actionLoading}
          >
            Desestimar
          </button>
        </div>
      </header>

      <main className={styles.grid}>
        <section className={styles.detalle}>
          <h3>Detalle de la denuncia</h3>
          <p className={styles.muted}>
            <strong>Descripción:</strong>
          </p>
          <p className={styles.small}>{descripcion || '—'}</p>

          {evidencia && evidencia.length > 0 && (
            <>
              <p className={styles.muted}>
                <strong>Evidencia:</strong>
              </p>
              <div className={styles.evidencia}>
                {evidencia.map((url, i) => (
                  <img key={i} src={url} alt={`evidencia-${i}`} />
                ))}
              </div>
            </>
          )}

          <div style={{ marginTop: 24 }}>
            <h4>Acciones rápidas</h4>
            {tipoDenuncia === 'publicacion' && publicacionId && (
              <>
                <button
                  className={styles.btn}
                  onClick={() =>
                    requestAction(
                      'eliminar_publicacion',
                      { publicacionId: publicacionId._id || publicacionId },
                      {
                        title: 'Eliminar publicación',
                        message: '¿Confirmar eliminar la publicación objetivo?',
                      }
                    )
                  }
                  disabled={actionLoading}
                >
                  Eliminar publicación
                </button>{' '}
                <Link to={`/publicacion/${publicacionId._id || publicacionId}`}>
                  <button className={styles.btn}>Ir a publicación</button>
                </Link>
              </>
            )}
            {tipoDenuncia === 'comentario' && comentarioId && (
              <>
                <button
                  className={styles.btn}
                  onClick={() =>
                    requestAction(
                      'eliminar_comentario',
                      {
                        comentarioId: comentarioId._id || comentarioId,
                        publicacionId: comentarioId.publicacionId,
                      },
                      {
                        title: 'Eliminar comentario',
                        message: '¿Confirmar eliminar el comentario objetivo?',
                      }
                    )
                  }
                  disabled={actionLoading}
                >
                  Eliminar comentario
                </button>{' '}
                {comentarioId.publicacionId && (
                  <Link to={`/publicacion/${comentarioId.publicacionId}`}>
                    <button className={styles.btn}>Ver publicación</button>
                  </Link>
                )}
              </>
            )}
            {usuarioDenunciadoId && (
              <>
                <button
                  className={styles.btn}
                  onClick={() =>
                    requestAction(
                      'desactivar_usuario',
                      {
                        usuarioId:
                          usuarioDenunciadoId._id || usuarioDenunciadoId,
                      },
                      {
                        title: 'Desactivar usuario',
                        message: '¿Confirmar desactivar al usuario objetivo?',
                      }
                    )
                  }
                  disabled={actionLoading}
                >
                  Desactivar usuario
                </button>{' '}
                <Link to={perfilLinkParaUsuario(usuarioDenunciadoId)}>
                  <button className={styles.btn}>Ir al usuario</button>
                </Link>
              </>
            )}
          </div>
        </section>

        <aside className={styles.target}>
          <h3>Objetivo</h3>

          {tipoDenuncia === 'publicacion' && publicacionId ? (
            <div className={styles.card}>
              <strong>Publicación</strong>
              <p>
                {publicacionId.contenido ||
                  publicacionId.texto ||
                  publicacionId.titulo ||
                  'Sin texto'}
              </p>
              {Array.isArray(publicacionId.multimedia) &&
                publicacionId.multimedia.length > 0 && (
                  <img
                    src={publicacionId.multimedia[0]}
                    alt="media"
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                )}
              <div className={styles.muted}>
                Autor:{' '}
                {(publicacionId.autor &&
                  (publicacionId.autor.nickname ||
                    publicacionId.autor.nombreUsuario)) ||
                  autorObjetivo?.nickname ||
                  autorObjetivo?.nombreUsuario ||
                  publicacionId.autorId ||
                  '—'}
              </div>
            </div>
          ) : tipoDenuncia === 'comentario' && comentarioId ? (
            <div className={styles.card}>
              <strong>Comentario</strong>
              <p>
                {comentarioId.contenido || comentarioId.texto || 'Sin texto'}
              </p>
              <div className={styles.muted}>
                Autor:{' '}
                {comentarioId?.usuario?.nombreUsuario ||
                  comentarioId?.usuario?.nombreCompleto ||
                  comentarioId?.usuarioId ||
                  '—'}
              </div>
            </div>
          ) : usuarioDenunciadoId ? (
            <div className={styles.card}>
              <strong>Usuario</strong>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {(() => {
                  const uObj =
                    autorObjetivo ||
                    (typeof usuarioDenunciadoId === 'object'
                      ? usuarioDenunciadoId
                      : null);
                  const avatarUrl =
                    (uObj &&
                      (uObj.fotoPerfil ||
                        uObj.avatar ||
                        uObj.foto ||
                        uObj.imagen ||
                        uObj.profilePicture)) ||
                    (typeof usuarioDenunciadoId === 'object' &&
                      (usuarioDenunciadoId.fotoPerfil ||
                        usuarioDenunciadoId.avatar ||
                        usuarioDenunciadoId.foto)) ||
                    null;
                  const displayName =
                    (uObj &&
                      (uObj.nombreCompleto ||
                        uObj.nombreUsuario ||
                        uObj.nickname)) ||
                    (typeof usuarioDenunciadoId === 'string'
                      ? usuarioDenunciadoId
                      : 'Usuario');
                  return (
                    <>
                      <img
                        src={avatarUrl || avatar}
                        alt={displayName}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 999,
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = avatar;
                        }}
                      />
                      <div>
                        <div>
                          <Link
                            to={perfilLinkParaUsuario(
                              autorObjetivo || usuarioDenunciadoId
                            )}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            {displayName}
                          </Link>
                        </div>
                        <div className={styles.muted}>
                          {(uObj &&
                            (uObj.bio ||
                              uObj.descripcion ||
                              uObj.profileDescription)) ||
                            ''}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className={styles.card}>Objetivo no disponible</div>
          )}
        </aside>
      </main>

      <footer className={styles.footer}>
        <button className={styles.btn} onClick={() => navigate(-1)}>
          Volver
        </button>
      </footer>

      <ConfirmModal
        show={confirmState.show}
        title={confirmState.title}
        message={confirmState.message}
        onCancel={() =>
          setConfirmState((s) => ({ ...s, show: false, onConfirm: null }))
        }
        onConfirm={() => {
          if (typeof confirmState.onConfirm === 'function')
            confirmState.onConfirm();
          else setConfirmState((s) => ({ ...s, show: false }));
        }}
        confirmText="Confirmar"
        cancelText="Cancelar"
      />

      <InfoModal
        show={infoState.show}
        title={infoState.title}
        message={infoState.message}
        onClose={() => setInfoState({ show: false, title: '', message: '' })}
        okText="Aceptar"
      />
    </div>
  );
}
