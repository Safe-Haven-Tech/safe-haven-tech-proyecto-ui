import React from 'react';
import styles from './EvaluationBanner.module.css';

const EvaluationBanner = ({ usuario, respuestas }) => (
  <div className={styles.evaluationBanner}>
    <div className={styles.bannerContent}>
      <h4 className={styles.greeting}>
        ¡Hola, {usuario?.nombreUsuario || 'usuario'}!
      </h4>

      <p className={styles.evaluationInfo}>
        Has completado{' '}
        <span className={styles.boldText}>{respuestas.length}</span>{' '}
        autoevaluación(es).
      </p>

      {respuestas[0] && (
        <p className={styles.lastEvaluation}>
          Última evaluación:{' '}
          <span className={styles.boldText}>
            {respuestas[0].encuestaId?.titulo}
          </span>
        </p>
      )}
    </div>
  </div>
);

export default EvaluationBanner;
