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

const EvaluationCard = ({ r, idx, handleDownloadPDF, pdfLoading }) => {
  const [isAnimated, setIsAnimated] = useState(false);
  const Icono = getIconRiesgo(r.nivelRiesgo);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, idx * 100);

    return () => clearTimeout(timer);
  }, [idx]);

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
            data-tip={r.recomendaciones?.join(', ')}
            title={r.recomendaciones?.join(', ')}
          >
            {Icono && <Icono />}
            <span>{r.nivelRiesgo?.toUpperCase() || 'N/A'}</span>
          </span>

          <p className={styles.tipText}>
            {getTip(r.nivelRiesgo)}
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