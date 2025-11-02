import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchDenunciaPorId, accionDenuncia } from '../../services/DenunciasServices';
import { deletePublicacion } from '../../services/publicacionesService';
import styles from './DenunciaDetail.module.css';

import avatar from '../../assets/perfil_placeholder.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function DenunciaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [denuncia, setDenuncia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [autorObjetivo, setAutorObjetivo] = useState(null);
  const token = localStorage.getItem('token');

  // Helper para construir la ruta al perfil del usuario objetivo (usa nombreUsuario si existe, sino id)
  const perfilLinkParaUsuario = (usuarioObj) => {
    if (!usuarioObj) return '/perfil';
    // usuarioObj puede ser string id, o objeto { nombreUsuario, usuario: { nombreUsuario }, nickname, _id, ... }
    const nombreUsuario =
      (typeof usuarioObj === 'string' ? null : usuarioObj.nombreUsuario) ||
      (usuarioObj.usuario && usuarioObj.usuario.nombreUsuario) ||
      usuarioObj.nickname ||
      usuarioObj.nombreUsuario ||
      null;
    if (typeof nombreUsuario === 'string' && nombreUsuario.trim() !== '') {
      return `/perfil/${encodeURIComponent(nombreUsuario)}`;
    }
    const idVal = usuarioObj._id || (typeof usuarioObj === 'string' ? usuarioObj : null);
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
    return () => { mounted = false; };
  }, [id, token]);

  useEffect(() => {
    let mounted = true;
    const loadAutor = async () => {
      if (!denuncia) return;
      const objetivo = denuncia.publicacionId || denuncia.comentarioId || denuncia.usuarioDenunciadoId;
      if (!objetivo) return;

      const autorId =
        (objetivo && typeof objetivo.autorId === 'string' && objetivo.autorId) ||
        (objetivo && typeof objetivo.autor === 'string' && objetivo.autor) ||
        (objetivo && objetivo.autorId?._id) ||
        (objetivo && objetivo.autor?._id) ||
        null;

      if (!autorId) return;

      try {
        const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/usuarios/${autorId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) {
          console.warn('fetch autor no ok', res.status);
          return;
        }
        const body = await res.json().catch(() => null);
        const user = body?.usuario || body || null;
        if (mounted) setAutorObjetivo(user);
      } catch (e) {
        console.error('Error fetching autor objetivo', e);
      }
    };
    loadAutor();
    return () => { mounted = false; };
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

  const handleAction = async (accion, payload = {}) => {
    if (!window.confirm(`Confirmar acción: ${accion}`)) return;
    try {
      setActionLoading(true);

      // Mapear estado por acción si no se envía explícitamente
      const estadoPorDefecto = {
        marcar_resuelta: 'resuelta',
        eliminar_publicacion: 'resuelta',
        eliminar_comentario: 'resuelta',
        desactivar_usuario: 'resuelta',
        desestimar: 'rechazada'
      };

      // Ejecutar acción específica sobre el recurso (DELETE / PATCH)
      if (accion === 'eliminar_publicacion') {
        const pubId = payload.publicacionId || (denuncia && denuncia.publicacionId && (denuncia.publicacionId._id || denuncia.publicacionId));
        if (!pubId) throw new Error('Falta publicacionId para eliminar');
        await deletePublicacion(pubId, token);
        alert('Publicación eliminada');
      } else if (accion === 'eliminar_comentario') {
        const comentarioObj = payload.comentarioId || (denuncia && denuncia.comentarioId);
        const comentarioVal = comentarioObj && (comentarioObj._id || comentarioObj);
        const pubId = payload.publicacionId || (comentarioObj && comentarioObj.publicacionId) || (denuncia && denuncia.publicacionId && (denuncia.publicacionId._id || denuncia.publicacionId));
        if (!comentarioVal || !pubId) throw new Error('Falta comentarioId o publicacionId para eliminar comentario');
        const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/publicaciones/${pubId}/comentarios/${comentarioVal}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detalles || err.error || 'Error eliminando comentario');
        }
        alert('Comentario eliminado');
      } else if (accion === 'desactivar_usuario') {
        const usuarioIdVal = payload.usuarioId || (denuncia && denuncia.usuarioDenunciadoId && (denuncia.usuarioDenunciadoId._id || denuncia.usuarioDenunciadoId));
        if (!usuarioIdVal) throw new Error('Falta usuarioId para desactivar');
        const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/usuarios/${usuarioIdVal}/desactivar`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ motivo: payload.motivo || payload.observaciones || 'Desactivado por moderación' })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detalles || err.error || 'Error desactivando usuario');
        }
        alert('Usuario desactivado');
      } else {
        // otras acciones no requieren cambios en recursos externos
        console.log('Acción genérica:', accion);
      }

      // Normalizar y enviar la acción sobre la denuncia
      const body = { accion, ...(payload || {}) };
      if (!body.estado) body.estado = estadoPorDefecto[accion] || 'resuelta';
      if (body.razon && !body.observaciones) {
        body.observaciones = body.razon;
        delete body.razon;
      }

      await accionDenuncia(id, body, token);
      alert('Acción registrada en la denuncia');
      await reload();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al ejecutar acción');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className={styles.container}>Cargando denuncia...</div>;
  if (!denuncia) return <div className={styles.container}>Denuncia no encontrada</div>;

  const {
    tipoDenuncia,
    motivo,
    descripcion,
    fecha,
    publicacionId,
    comentarioId,
    usuarioDenunciadoId,
    evidencia = []
  } = denuncia;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h2>Denuncia: {tipoDenuncia || '—'}</h2>
          <div className={styles.meta}>{motivo} • {fecha ? new Date(fecha).toLocaleString() : ''}</div>
        </div>
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => handleAction('marcar_resuelta')} disabled={actionLoading}>Marcar resuelta</button>
          <button className={`${styles.btn}`} onClick={() => handleAction('desestimar')} disabled={actionLoading}>Desestimar</button>
        </div>
      </header>

      <main className={styles.grid}>
        <section className={styles.detalle}>
          <h3>Detalle de la denuncia</h3>
          <p className={styles.muted}><strong>Descripción:</strong></p>
          <p className={styles.small}>{descripcion || '—'}</p>

          {evidencia && evidencia.length > 0 && (
            <>
              <p className={styles.muted}><strong>Evidencia:</strong></p>
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
                <button className={styles.btn} onClick={() => handleAction('eliminar_publicacion', { publicacionId: publicacionId._id || publicacionId })} disabled={actionLoading}>Eliminar publicación</button>{' '}
                <Link to={`/publicacion/${publicacionId._id || publicacionId}`}><button className={styles.btn}>Ir a publicación</button></Link>
              </>
            )}
            {tipoDenuncia === 'comentario' && comentarioId && (
              <>
                <button className={styles.btn} onClick={() => handleAction('eliminar_comentario', { comentarioId: comentarioId._id || comentarioId, publicacionId: comentarioId.publicacionId })} disabled={actionLoading}>Eliminar comentario</button>{' '}
                {comentarioId.publicacionId && <Link to={`/publicacion/${comentarioId.publicacionId}`}><button className={styles.btn}>Ver publicación</button></Link>}
              </>
            )}
            {usuarioDenunciadoId && (
              <>
                <button className={styles.btn} onClick={() => handleAction('desactivar_usuario', { usuarioId: usuarioDenunciadoId._id || usuarioDenunciadoId })} disabled={actionLoading}>Desactivar usuario</button>{' '}
                <Link to={perfilLinkParaUsuario(usuarioDenunciadoId)}><button className={styles.btn}>Ir al usuario</button></Link>
              </>
            )}
          </div>
        </section>

        <aside className={styles.target}>
          <h3>Objetivo</h3>

          {tipoDenuncia === 'publicacion' && publicacionId ? (
            <div className={styles.card}>
              <strong>Publicación</strong>
              <p>{publicacionId.contenido || publicacionId.texto || publicacionId.titulo || 'Sin texto'}</p>
              {Array.isArray(publicacionId.multimedia) && publicacionId.multimedia.length > 0 && (
                <img src={publicacionId.multimedia[0]} alt="media" style={{ width: '100%', borderRadius: 8 }} />
              )}
              <div className={styles.muted}>
                Autor: { (publicacionId.autor && (publicacionId.autor.nickname || publicacionId.autor.nombreUsuario)) || autorObjetivo?.nickname || autorObjetivo?.nombreUsuario || publicacionId.autorId || '—' }
              </div>
            </div>
          ) : tipoDenuncia === 'comentario' && comentarioId ? (
            <div className={styles.card}>
              <strong>Comentario</strong>
              <p>{comentarioId.contenido || comentarioId.texto || 'Sin texto'}</p>
              <div className={styles.muted}>
                Autor: {
                  comentarioId?.usuario?.nombreUsuario ||
                  comentarioId?.usuario?.nombreCompleto ||
                  comentarioId?.usuarioId || '—'
                }
              </div>
            </div>
          ) : usuarioDenunciadoId ? (
            <div className={styles.card}>
              <strong>Usuario</strong>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <img src={(usuarioDenunciadoId.avatar && usuarioDenunciadoId.avatar) || avatar} alt="avatar" style={{ width: 56, height: 56, borderRadius: 999 }} />
                <div>
                  <div>
                    <Link to={perfilLinkParaUsuario(usuarioDenunciadoId)} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {usuarioDenunciadoId.nickname || usuarioDenunciadoId.nombreUsuario || usuarioDenunciadoId}
                    </Link>
                  </div>
                  <div className={styles.muted}>{usuarioDenunciadoId.bio || usuarioDenunciadoId.descripcion || ''}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.card}>Objetivo no disponible</div>
          )}
        </aside>
      </main>

      <footer className={styles.footer}>
        <button className={styles.btn} onClick={() => navigate(-1)}>Volver</button>
      </footer>
    </div>
  );
}