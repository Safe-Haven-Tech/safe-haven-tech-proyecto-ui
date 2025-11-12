import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchEncuestaById,
  completarEncuesta,
} from '../../services/surveysServices';
import { useAuth } from '../../hooks/useAuth';
import styles from './ViewSurvey.module.css';
import SurveyHeader from '../../components/AutoEvaluacion/ViewSurvey/SurveyHeader';
import QuestionCard from '../../components/AutoEvaluacion/ViewSurvey/QuestionCard';

export default function ViewSurvey() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const [survey, setSurvey] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);

  // Estado para notificaciones
  const [notification, setNotification] = useState(null);
  const showNotification = (message, type = 'success', duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        setLoading(true);
        setError(null);
        const { encuesta, status, mensaje } = await fetchEncuestaById(id);
        if (!encuesta) {
          setSurvey(null);
          setError(
            status === 404
              ? 'Encuesta no encontrada'
              : mensaje || 'Error al cargar la encuesta'
          );
          return;
        }
        setSurvey(encuesta);

        const initialAnswers = {};
        encuesta.preguntas.forEach((pregunta) => {
          initialAnswers[pregunta.orden] = null;
        });
        setAnswers(initialAnswers);
      } catch (err) {
        console.error('Error loading survey:', err);
        setError('Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
    };
    loadSurvey();
  }, [id]);

  const handleAnswer = (questionOrder, answer) => {
    setAnswers((prev) => ({ ...prev, [questionOrder]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < survey.preguntas.length - 1)
      setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleCompleteSurvey = async () => {
    if (!survey || !survey.preguntas) return;
    setIsCompleting(true);

    try {
      const respuestas = Object.entries(answers)
        .filter(([, answerValue]) => answerValue !== null)
        .map(([preguntaOrden, respuesta]) => ({
          preguntaOrden: parseInt(preguntaOrden),
          respuesta,
        }));

      const resultado = await completarEncuesta(
        id,
        respuestas,
        isAuthenticated ? token : null
      );

      // Abrir el PDF desde Cloudinary en una nueva pestaña
      if (resultado.pdfUrl) {
        console.log('📄 Abriendo PDF desde Cloudinary:', resultado.pdfUrl);
        window.open(resultado.pdfUrl, '_blank');
      }

      // Mostrar resumen de resultados
      const nivelRiesgo = resultado.respuesta?.nivelRiesgo || 'N/A';
      const puntaje = resultado.respuesta?.puntajeTotal || 0;
      showNotification(`✅ Encuesta completada. Nivel: ${nivelRiesgo} | Puntaje: ${puntaje}`, 'success', 4000);
      navigate('/autoevaluacion');
    } catch (error) {
      console.error('Error completing survey:', error);
      showNotification(`❌ ${error.message}`, 'danger');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleExitSurvey = () => {
    navigate('/autoevaluacion');
  };

  if (loading)
    return (
      <div className={`container py-5 ${styles.loadingContainer}`}>
        <div className={styles.spinner} role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className={styles.loadingText}>Cargando encuesta...</p>
      </div>
    );

  if (error)
    return (
      <div className={`container py-5 ${styles.container}`}>
        <div className={styles.errorContainer}>
          <h4 className={styles.errorTitle}>Error al cargar la encuesta</h4>
          <p className={styles.errorMessage}>{error}</p>
          <button
            className={styles.backButton}
            onClick={() => navigate('/autoevaluacion')}
          >
            Volver a encuestas
          </button>
        </div>
      </div>
    );

  if (!survey)
    return (
      <div className={`container py-5 ${styles.container}`}>
        <div className={styles.notFoundContainer}>
          <h4 className={styles.errorTitle}>Encuesta no encontrada</h4>
          <button
            className={styles.backButton}
            onClick={() => navigate('/autoevaluacion')}
          >
            Volver a encuestas
          </button>
        </div>
      </div>
    );

  const currentQuestion = survey.preguntas[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === survey.preguntas.length - 1;
  const currentAnswer = answers[currentQuestion.orden];
  const allQuestionsAnswered = Object.values(answers).every(
    (answer) => answer !== null
  );

  return (
    <div className={`container py-5 ${styles.container}`}>
      {/* Toast Notification */}
      {notification && (
        <div className={styles.toastContainer}>
          <div
            className={`${styles.toast} ${
              notification.type === 'success'
                ? styles.toastSuccess
                : styles.toastDanger
            }`}
            role="alert"
          >
            <div className="d-flex">
              <div className={styles.toastBody}>{notification.message}</div>
              <button
                type="button"
                className={styles.toastClose}
                onClick={() => setNotification(null)}
                aria-label="Cerrar notificación"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header de navegación */}
      <div className={styles.navigationHeader}>
        <button
          onClick={handleExitSurvey}
          className={styles.exitButton}
          disabled={isCompleting}
        >
          <span>←</span>
          <span>Salir</span>
        </button>
      </div>

      <SurveyHeader
        title={survey.titulo}
        description={survey.descripcion}
        category={survey.categoria}
        estimatedTime={survey.tiempoEstimado}
      />

      <QuestionCard
        question={currentQuestion}
        answer={currentAnswer}
        onAnswer={(answer) => handleAnswer(currentQuestion.orden, answer)}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={survey.preguntas.length}
      />

      {/* Botones de navegación */}
      <div className={styles.navigationButtons}>
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || isCompleting}
          className={styles.navButton}
        >
          <span>← Anterior</span>
        </button>

        {!isLastQuestion ? (
          <button
            onClick={handleNext}
            disabled={!currentAnswer || isCompleting}
            className={styles.navButton}
          >
            <span>Siguiente →</span>
          </button>
        ) : (
          <button
            onClick={handleCompleteSurvey}
            disabled={!allQuestionsAnswered || isCompleting}
            className={styles.navButton}
          >
            <span>{isCompleting ? 'Procesando...' : 'Finalizar Encuesta'}</span>
          </button>
        )}
      </div>

      {/* Contador de progreso */}
      <div className={styles.progressCounter}>
        {Object.values(answers).filter((answer) => answer !== null).length} de{' '}
        {survey.preguntas.length} preguntas respondidas
      </div>
    </div>
  );
}
