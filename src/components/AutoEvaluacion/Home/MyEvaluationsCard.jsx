import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import styles from './MyEvaluationsCard.module.css';

const MyEvaluationsCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div
      className={`card ${styles.evaluationsCard}`}
      onClick={() => navigate('/mis-evaluaciones')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate('/mis-evaluaciones');
        }
      }}
    >
      <div className={styles.cardBody}>
        <h5 className={styles.cardTitle}>
          Mis Evaluaciones
        </h5>
        <p className={styles.cardText}>
          Ver todas tus encuestas completadas, resultados y descargar PDF.
        </p>
        <button 
          className={`btn ${styles.primaryButton}`}
          onClick={(e) => {
            e.stopPropagation();
            navigate('/mis-evaluaciones');
          }}
        >
          <span>Ir a Mis Evaluaciones</span>
        </button>
      </div>
    </div>
  );
};

export default MyEvaluationsCard;