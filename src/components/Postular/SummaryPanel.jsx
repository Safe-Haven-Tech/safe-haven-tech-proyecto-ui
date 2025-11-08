import React from 'react';
import styles from '../../pages/profesionals/Postulacion.module.css';

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value))
    return value
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean);
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function truncate(text, max = 140) {
  if (!text) return '—';
  return text.length > max ? text.slice(0, max).trim() + '…' : text;
}

export default function SummaryPanel({
  values = {},
  onFocus = () => {},
  onPreview = () => {},
}) {
  const titulos = toArray(values.titulos);
  const especialidades = toArray(values.especialidades);
  const registro = values.registroProfesional || '—';
  const institucion = values.institucionTitulo || '—';
  const disponible =
    typeof values.disponible === 'boolean'
      ? values.disponible
      : values.disponible
        ? true
        : false;
  const carta = values.cartaMotivacion || values.motivacion || '';

  return (
    <aside
      className={styles.summaryPanel}
      aria-label="Resumen de la postulación"
    >
      <div className={styles.summaryHeader}>
        <h3 className={styles.summaryTitle}>Resumen rápido</h3>
        <p className={styles.summarySubtitle}>
          Previsualiza tus datos antes de enviar
        </p>
      </div>

      <div className={styles.summarySection}>
        <strong className={styles.summaryLabel}>Títulos</strong>
        <div className={styles.chipsPreview}>
          {titulos.length ? (
            titulos.map((t, i) => (
              <span key={t + i} className={styles.chip}>
                <span className={styles.chipText}>{t}</span>
              </span>
            ))
          ) : (
            <div className={styles.emptyNote}>—</div>
          )}
        </div>
      </div>

      <div className={styles.summarySection}>
        <strong className={styles.summaryLabel}>Especialidades</strong>
        <div className={styles.chipsPreview}>
          {especialidades.length ? (
            especialidades.map((s, i) => (
              <span key={s + i} className={styles.chip}>
                <span className={styles.chipText}>{s}</span>
              </span>
            ))
          ) : (
            <div className={styles.emptyNote}>—</div>
          )}
        </div>
      </div>

      <div className={styles.summarySection}>
        <div className={styles.previewRow}>
          <strong>Registro:</strong>{' '}
          <span className={styles.previewValue}>{registro}</span>
        </div>
        <div className={styles.previewRow}>
          <strong>Institución:</strong>{' '}
          <span className={styles.previewValue}>{institucion}</span>
        </div>
        <div className={styles.previewRow}>
          <strong>Disponible:</strong>{' '}
          <span className={styles.previewValue}>
            {disponible ? 'Sí' : 'No'}
          </span>
        </div>
      </div>

      <div className={styles.summarySection}>
        <strong className={styles.summaryLabel}>Carta de motivación</strong>
        <div className={styles.previewBox}>
          <p className={styles.previewText}>{truncate(carta, 260)}</p>
        </div>
      </div>

      <div className={styles.summaryActions}>
        <button type="button" className={styles.btnGhost} onClick={onFocus}>
          Editar
        </button>
        <button type="button" className={styles.btnPrimary} onClick={onPreview}>
          Previsualizar
        </button>
      </div>
    </aside>
  );
}
