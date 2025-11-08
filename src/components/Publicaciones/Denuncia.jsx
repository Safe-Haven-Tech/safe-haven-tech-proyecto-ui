import React, { useState } from 'react';
import styles from './DenunciaModal.module.css';

const motivos = [
  { value: 'contenido_inapropiado', label: 'Contenido inapropiado' },
  { value: 'spam', label: 'Spam' },
  { value: 'acoso', label: 'Acoso' },
  { value: 'discurso_odio', label: 'Discurso de odio' },
  { value: 'informacion_falsa', label: 'Información falsa' },
  { value: 'contenido_sexual', label: 'Contenido sexual' },
  { value: 'violencia', label: 'Violencia' },
  { value: 'otro', label: 'Otro' },
];

export default function DenunciaModal({ show, onClose, onSubmit }) {
  const [motivo, setMotivo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');

  const handleEnviar = () => {
    if (!motivo) {
      setError('Debes seleccionar un motivo');
      return;
    }
    onSubmit({ motivo, descripcion });
    setMotivo('');
    setDescripcion('');
    setError('');
  };

  if (!show) return null;

  return (
    <div className={styles.backdrop} aria-modal="true" role="dialog">
      <div className={styles.modalWrapper}>
        <div className={styles.modalHeader}>
          <h5 className={styles.title}>Denunciar publicación</h5>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <label className={styles.formLabel}>
            Motivo <span style={{ color: '#d32f2f' }}>*</span>
          </label>
          <select
            className={styles.select}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            aria-label="Seleccionar motivo de denuncia"
          >
            <option value="">Selecciona un motivo</option>
            {motivos.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <label className={styles.formLabel} style={{ marginTop: 8 }}>
            Descripción (opcional)
          </label>
          <textarea
            className={styles.textarea}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Describe el problema (opcional)"
            aria-label="Descripción de la denuncia"
          />
          {error && <div className={styles.errorText}>{error}</div>}
        </div>

        <div className={styles.modalFooter}>
          <button
            className={`${styles.btn} ${styles.btnCancel}`}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleEnviar}
          >
            Enviar denuncia
          </button>
        </div>
      </div>
    </div>
  );
}
