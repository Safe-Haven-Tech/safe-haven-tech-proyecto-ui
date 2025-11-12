/* filepath: f:\SafeHaven\safe-haven-tech-proyecto-ui\src\components\AutoEvaluacion\MyEvaluations\EvaluationCard.jsx */
import React, { useEffect, useState } from 'react';
import { FaDownload } from 'react-icons/fa';
import styles from './EvaluationCard.module.css';
import {
  getBackgroundColor,
  getBadgeColor,
  getIconRiesgo,
  getTip,
} from '../../../utils/riskUtils';
import { formatearNivelRiesgo } from '../../../utils/formatUtils';

const EvaluationCard = ({ r, idx, handleDownloadPDF, pdfLoading }) => {
  const [isAnimated, setIsAnimated] = useState(false);
  const Icono = getIconRiesgo(r.nivelRiesgo);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, idx * 100);

    return () => clearTimeout(timer);
  }, [idx]);

  // Usar recomendaciones personalizadas si existen, sino usar la por defecto
  const hayRecomendacionesPersonalizadas = r.recomendaciones && r.recomendaciones.length > 0;
  const recomendacionesTexto = hayRecomendacionesPersonalizadas
    ? r.recomendaciones.length === 1 
      ? r.recomendaciones[0]
      : r.recomendaciones.slice(0, 2).join(' • ') + (r.recomendaciones.length > 2 ? ` • +${r.recomendaciones.length - 2} más` : '')
    : getTip(r.nivelRiesgo);
  
  const todasLasRecomendaciones = hayRecomendacionesPersonalizadas
    ? r.recomendaciones.join('\n• ')
    : getTip(r.nivelRiesgo);

  return (
    <div
      className={`${styles.cardWrapper} ${isAnimated ? styles.animated : ''}`}
      style={{ animationDelay: `${idx * 0.1}s` }}
    >
      <div
        className={styles.evaluationCard}
        style={{ background: getBackgroundColor(r.nivelRiesgo) }}
      >
        <div className={styles.cardContent}>
          <h5 className={styles.cardTitle}>
            {r.encuestaId?.titulo || 'Encuesta sin título'}
          </h5>

          <span
            className={`${styles.riskBadge} ${getBadgeColor(r.nivelRiesgo)}`}
            data-tip={todasLasRecomendaciones}
            title={todasLasRecomendaciones}
          >
            {Icono && <Icono />}
            <span>{formatearNivelRiesgo(r.nivelRiesgo)}</span>
          </span>

          <p className={styles.tipText}>
            <span style={{ fontSize: '0.85em', fontWeight: '600', color: '#2E7D32', marginRight: '5px' }}>
              💡
            </span>
            {recomendacionesTexto}
          </p>
        </div>

        <button
          className={styles.downloadButton}
          onClick={() => handleDownloadPDF(r)}
          disabled={pdfLoading}
          aria-label="Descargar PDF de evaluación"
        >
          <FaDownload />
          <span>Descargar PDF</span>
        </button>
      </div>
    </div>
  );
};

export default EvaluationCard;
