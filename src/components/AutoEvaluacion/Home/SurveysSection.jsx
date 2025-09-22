/* filepath: f:\SafeHaven\safe-haven-tech-proyecto-ui\src\components\AutoEvaluacion\Home\SurveysSection.jsx */
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './SurveysSection.module.css';
import { fetchEncuestas } from '../../../services/surveysServices';

const validTopics = [
  'Bienestar emocional',
  'Relaciones cercanas',
  'Autoestima y autoconcepto',
  'Habilidades sociales',
  'Salud y hábitos',
  'Orientación emocional',
  'Prevención y señales de alerta',
];

export default function SurveysSection({ selectedTopic, batchSize = 3 }) {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const [animateIndexes, setAnimateIndexes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoadMore, setShowLoadMore] = useState(true);

  // Cargar encuestas
  useEffect(() => {
    const loadSurveys = async () => {
      try {
        setLoading(true);
        const data = await fetchEncuestas();
        const filtered = data.filter((s) => validTopics.includes(s.categoria));
        setSurveys(filtered);
      } catch (err) {
        console.error('Error cargando encuestas:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSurveys();
  }, []);

  // Filtrado por tópico
  const filteredSurveys = useMemo(
    () =>
      !selectedTopic || selectedTopic === 'Todas'
        ? surveys
        : surveys.filter((s) => s.categoria === selectedTopic),
    [surveys, selectedTopic]
  );

  // Mostrar visible
  const displayedSurveys = useMemo(
    () => filteredSurveys.slice(0, visibleCount),
    [filteredSurveys, visibleCount]
  );

  // Resetear al cambiar tópico
  useEffect(() => {
    setVisibleCount(batchSize);
    setAnimateIndexes([]);
    setShowLoadMore(filteredSurveys.length > batchSize);
    const timeout = setTimeout(() => {
      setAnimateIndexes(
        filteredSurveys.slice(0, batchSize).map((_, idx) => idx)
      );
    }, 50);
    return () => clearTimeout(timeout);
  }, [selectedTopic, filteredSurveys, batchSize]);

  // Animación al cargar más
  useEffect(() => {
    const indexes = displayedSurveys.map((_, idx) => idx);
    setAnimateIndexes(indexes);
    setShowLoadMore(visibleCount < filteredSurveys.length);
  }, [displayedSurveys, visibleCount, filteredSurveys.length]);

  const handleLoadMore = () => setVisibleCount((prev) => prev + batchSize);
  const handleSurveyClick = (surveyId) => navigate(`/encuesta/${surveyId}`);

  if (loading) return <p className={styles.loadingText}>Cargando encuestas...</p>;

  return (
    <section className="my-5">
      <div className={`container ${styles.surveysContainer}`}>
        {displayedSurveys.length === 0 ? (
          <p className={styles.noSurveysMessage}>
            No hay encuestas disponibles para este tópico.
          </p>
        ) : (
          <>
            <div className={styles.surveysGrid}>
              {displayedSurveys.map((survey, idx) => (
                <div
                  key={idx}
                  className={`${styles.surveyCardWrapper} ${
                    animateIndexes.includes(idx) ? styles.fadeIn : ''
                  }`}
                >
                  <div
                    className={`card ${styles.surveyCard}`}
                    onClick={() => handleSurveyClick(survey._id)}
                  >
                    <h5 className={styles.surveyTitle}>
                      {survey.titulo}
                    </h5>
                    <p className={styles.surveyDescription}>
                      {survey.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {showLoadMore && (
              <div className={`${styles.loadMoreWrapper} ${styles.fadeIn}`}>
                <button
                  className={`btn ${styles.loadMoreButton}`}
                  onClick={handleLoadMore}
                >
                  Cargar más encuestas
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}