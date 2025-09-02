import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
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

  if (loading) return <p className="text-center mt-4">Cargando encuestas...</p>;

  return (
    <section className="my-5">
      <div
        className="container p-3 p-md-4"
        style={{
          borderRadius: '1.5rem',
          background:
            'linear-gradient(135deg, rgba(251,232,245,0.8), rgba(230,240,250,0.8), rgba(208,230,255,0.8))',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        }}
      >
        {displayedSurveys.length === 0 ? (
          <p
            className="text-center fw-bold"
            style={{
              fontFamily: "'Poppins', sans-serif",
              color: '#5A4E7C',
              fontSize: '1.1rem',
              padding: '2rem',
            }}
          >
            No hay encuestas disponibles para este tópico.
          </p>
        ) : (
          <>
            <div className="row g-4">
              {displayedSurveys.map((survey, idx) => (
                <div
                  key={idx}
                  className={`col-12 col-md-6 col-lg-4 survey-card-wrapper ${
                    animateIndexes.includes(idx) ? 'fade-in' : 'opacity-0'
                  }`}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <div
                    className="card h-100 shadow-sm border-0 p-3 survey-card"
                    style={{
                      borderRadius: '1rem',
                      background: 'white',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSurveyClick(survey._id)}
                  >
                    <h5
                      className="fw-bold"
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        color: '#5A4E7C',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {survey.titulo}
                    </h5>
                    <p
                      className="text-muted"
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)',
                      }}
                    >
                      {survey.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {showLoadMore && (
              <div className="text-center mt-4 load-more-wrapper fade-in">
                <button
                  className="btn btn-outline-primary px-4 py-2"
                  onClick={handleLoadMore}
                  style={{ borderRadius: '2rem' }}
                >
                  Cargar más encuestas
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .survey-card {
          transition: all 0.3s ease;
        }
        .survey-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(90, 78, 124, 0.3);
        }
        .opacity-0 {
          opacity: 0;
          transform: translateY(10px);
        }
        .fade-in {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
        }
      `}</style>
    </section>
  );
}
