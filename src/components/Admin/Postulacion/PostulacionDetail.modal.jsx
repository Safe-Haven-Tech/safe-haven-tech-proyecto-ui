import React, { useState, useEffect, useRef } from 'react';
import styles from '../../../pages/admin/PostulacionesAdmin.module.css';

export default function PostulacionDetailModal({
  postulacion,
  onClose = () => {},
  onDecidir = async () => {},
  loading = false,
  autoFocusRejection = false
}) {
  const [motivo, setMotivo] = useState('');
  const motivoRef = useRef(null);

  useEffect(() => {
    // si ya existe motivo de rechazo en la data, precargarlo
    if (postulacion?.motivoRechazo) setMotivo(postulacion.motivoRechazo);
  }, [postulacion]);

  useEffect(() => {
    if (autoFocusRejection) {
      // pequeño delay para asegurar que el modal está renderizado
      const t = setTimeout(() => motivoRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [autoFocusRejection]);

  const handleAceptar = async () => {
    if (!confirm('¿Confirmar aprobación de esta postulación?')) return;
    await onDecidir(postulacion._id, 'aceptar', '');
  };

  const handleDenegar = async () => {
    if (!motivo || motivo.trim().length === 0) {
      alert('Debes indicar un motivo para denegar');
      motivoRef.current?.focus();
      return;
    }
    if (!confirm('¿Confirmar denegación de esta postulación?')) return;
    await onDecidir(postulacion._id, 'denegar', motivo.trim());
  };

  const usuario = postulacion.usuarioId || postulacion.usuario || {};
  const info = postulacion.infoProfesional || {};

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <header className={styles.modalHeader}>
          <h2>Detalle de Postulación</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">×</button>
        </header>

        <div className={styles.modalBody}>
          <section>
            <h3>Usuario</h3>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {usuario.fotoPerfil && (
                <img src={usuario.fotoPerfil} alt={usuario.nombreCompleto || 'foto'} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
              )}
              <div>
                <p><strong>{usuario.nombreCompleto || usuario.nombreUsuario || '—'}</strong></p>
                <p style={{ color: '#6b7280' }}>{usuario.correo || '—'}</p>
                {usuario.telefono && <p style={{ color: '#6b7280' }}>Tel: {usuario.telefono}</p>}
                <p style={{ marginTop: 6 }}>
                  <a href={`/usuarios/${usuario._id}`} className={styles.actionBtn} style={{ textDecoration: 'none' }}>Ver perfil</a>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3>Información profesional</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <strong>Títulos</strong>
                {Array.isArray(info.titulos) && info.titulos.length > 0 ? (
                  <ul>
                    {info.titulos.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                ) : <p>—</p>}
              </div>

              <div>
                <strong>Especialidades</strong>
                {Array.isArray(info.especialidades) && info.especialidades.length > 0 ? (
                  <ul>
                    {info.especialidades.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                ) : <p>—</p>}
              </div>

              <div>
                <strong>Registro profesional</strong>
                <p>{info.registroProfesional || '—'}</p>
              </div>

              <div>
                <strong>Institución</strong>
                <p>{info.institucionTitulo || '—'}</p>
              </div>

              <div>
              </div>

              <div>
                <strong>Disponible</strong>
                <p>{info.disponible ? 'Sí' : 'No'}</p>
              </div>
            </div>
          </section>

          <section>
            <h3>Postulación</h3>
            <p><strong>Motivación</strong></p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{postulacion.motivacion || '—'}</p>

            <p style={{ marginTop: 8 }}><strong>Experiencia (resumen)</strong></p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{postulacion.experiencia ? `${postulacion.experiencia} Años` : '—'}</p>

            <p style={{ marginTop: 8 }}><strong>Especialidad solicitada</strong></p>
            <p>{postulacion.especialidad || '—'}</p>

            {Array.isArray(postulacion.etiquetas) && postulacion.etiquetas.length > 0 && (
              <>
                <p style={{ marginTop: 8 }}><strong>Etiquetas</strong></p>
                <p>{postulacion.etiquetas.join(', ')}</p>
              </>
            )}
          </section>

          <section>
            <h3>Documentos</h3>
            {postulacion.archivos && postulacion.archivos.length > 0 ? (
              <ul>
                {postulacion.archivos.map((f, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    <a href={f.url} target="_blank" rel="noreferrer">{f.nombre || f.url}</a>
                    {' '}
                    <a href={f.url} download style={{ marginLeft: 8, color: '#374151' }}>[descargar]</a>
                    {f.tipo && <span style={{ marginLeft: 8, color: '#6b7280' }}>{f.tipo}</span>}
                  </li>
                ))}
              </ul>
            ) : <p>No hay documentos</p>}
          </section>

          <section>
            <h3>Estado & metadatos</h3>
            <p><strong>Estado:</strong> {postulacion.estado}</p>
            <p><strong>Creada:</strong> {postulacion.createdAt ? new Date(postulacion.createdAt).toLocaleString() : '—'}</p>
            <p><strong>ID:</strong> {postulacion._id}</p>
            {postulacion.revisadoPor && <p><strong>Revisado por:</strong> {postulacion.revisadoPor.nombreCompleto || postulacion.revisadoPor}</p>}
            {postulacion.fechaRevision && <p><strong>Fecha revisión:</strong> {new Date(postulacion.fechaRevision).toLocaleString()}</p>}
          </section>

          <section>
            <h3>Rechazo / observaciones</h3>
            {postulacion.motivoRechazo ? (
              <p><strong>Motivo rechazo:</strong> <span style={{ color: '#b91c1c' }}>{postulacion.motivoRechazo}</span></p>
            ) : <p>No hay motivo de rechazo registrado</p>}

            {postulacion.observaciones ? (
              <p><strong>Observaciones:</strong> <span style={{ whiteSpace: 'pre-wrap' }}>{postulacion.observaciones}</span></p>
            ) : null}
          </section>

          <section className={styles.rejection}>
            <h3>Motivo (para denegar)</h3>
            <textarea
              ref={motivoRef}
              className={styles.textarea}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Escribe el motivo para denegar..."
              aria-label="Motivo de rechazo"
            />
          </section>
        </div>

        <footer className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>Cerrar</button>
          <button className={styles.btnAccept} disabled={loading} onClick={handleAceptar}>Aceptar</button>
          <button className={styles.btnReject} disabled={loading} onClick={handleDenegar}>Denegar</button>
        </footer>
      </div>
    </div>
  );
}