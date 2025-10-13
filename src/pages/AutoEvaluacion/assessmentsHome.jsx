import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './AssessmentsHome.module.css';
import WelcomeCard from '../../components/AutoEvaluacion/Home/WelcomeCard';
import BenefitsSection from '../../components/AutoEvaluacion/Home/BenefitsSection';
import TopicsFilter from '../../components/AutoEvaluacion/Home/TopicsFilter';
import SurveysSection from '../../components/AutoEvaluacion/Home/SurveysSection';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function SelfAssessment() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const navigate = useNavigate();
  const { usuario } = useAuth();

  return (
    <>
      {/* Welcome Card */}
      <div className={styles.welcomeContainer}>
        <WelcomeCard
          title="¡Bienvenido a las encuestas de autoevaluación!"
          subtitle="Descubre tu estado emocional de manera segura y sencilla."
          description="Realiza las encuestas disponibles, obtén retroalimentación inmediata sobre tu bienestar emocional y accede a recursos confiables que te ayudarán a cuidarte y sentirte acompañado o ayudar a otros"
          fullWidth
        />
      </div>

      {usuario && (
        <div className={styles.userEvaluationsContainer}>
          <div className={styles.userEvaluationsCard}>
            <h5 className={styles.cardTitle}>Tus autoevaluaciones</h5>
            <p className={styles.cardDescription}>
              Aquí podrás consultar todas las autoevaluaciones que has realizado
              y, si lo deseas, descargarlas para guardarlas o compartirlas.
            </p>
            <button
              onClick={() => navigate('/mis-evaluaciones')}
              className={styles.primaryButton}
            >
              <i className="bi bi-clipboard-check me-2"></i>
              Ver y descargar mis evaluaciones
            </button>
          </div>
        </div>
      )}

      <div className="container py-5">
        {/* Benefits Section */}
        <BenefitsSection />

        {/* Topics Filter */}
        <div className={styles.topicsContainer}>
          <TopicsFilter onSelect={setSelectedTopic} />
        </div>

        {/* Encuestas */}
        <div className={styles.surveysContainer}>
          <h3 className={styles.sectionTitle}>Encuestas disponibles</h3>
          <SurveysSection selectedTopic={selectedTopic} />
        </div>
      </div>
    </>
  );
}
