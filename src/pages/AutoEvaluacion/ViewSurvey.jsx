// src/pages/AutoEvaluacion/ViewSurvey.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchEncuestaById,
  completarEncuesta,
} from '../../services/surveysServices';

import { useAuth } from '../../hooks/useAuth';
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

  // Estado para notificaciones tipo toast
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

        // Inicializamos todas las respuestas en null
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

      const blob = await completarEncuesta(
        id,
        respuestas,
        isAuthenticated ? token : null
      );

      if (blob instanceof Blob) {
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl, '_blank');
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
      }

      showNotification('✅ Encuesta completada exitosamente');
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
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">
          <h4>Error al cargar la encuesta</h4>
          <p>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/autoevaluacion')}
          >
            Volver a encuestas
          </button>
        </div>
      </div>
    );

  if (!survey)
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          <h4>Encuesta no encontrada</h4>
          <button
            className="btn btn-primary"
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
    <div
      className="container py-5"
      style={{ maxWidth: '800px', marginTop: '80px' }}
    >
      {notification && (
        <div className="toast-container position-fixed top-0 end-0 p-3">
          <div
            className={`toast show align-items-center text-bg-${notification.type}`}
            role="alert"
          >
            <div className="d-flex">
              <div className="toast-body">{notification.message}</div>
              <button
                type="button"
                className="btn-close me-2 m-auto"
                onClick={() => setNotification(null)}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Botones Salir / Reiniciar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          onClick={handleExitSurvey}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            border: '1px solid #6c757d',
            backgroundColor: 'white',
            color: '#6c757d',
            cursor: isCompleting ? 'not-allowed' : 'pointer',
          }}
          disabled={isCompleting}
        >
          ← Salir
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
      <div className="d-flex justify-content-between mt-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || isCompleting}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '12px',
            fontWeight: 'bold',
            color: 'white',
            background: 'linear-gradient(135deg, #5A4E7C, #A17CCA)',
            border: 'none',
            cursor:
              currentQuestionIndex === 0 || isCompleting
                ? 'not-allowed'
                : 'pointer',
            opacity: currentQuestionIndex === 0 || isCompleting ? 0.5 : 1,
            transition: 'all 0.3s ease',
          }}
        >
          ← Anterior
        </button>

        {!isLastQuestion ? (
          <button
            onClick={handleNext}
            disabled={!currentAnswer || isCompleting}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '12px',
              fontWeight: 'bold',
              color: 'white',
              background: 'linear-gradient(135deg, #5A4E7C, #A17CCA)',
              border: 'none',
              cursor:
                !currentAnswer || isCompleting ? 'not-allowed' : 'pointer',
              opacity: !currentAnswer || isCompleting ? 0.5 : 1,
              transition: 'all 0.3s ease',
            }}
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={handleCompleteSurvey}
            disabled={!allQuestionsAnswered || isCompleting}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '12px',
              fontWeight: 'bold',
              color: 'white',
              background: 'linear-gradient(135deg, #5A4E7C, #A17CCA)',
              border: 'none',
              cursor:
                !allQuestionsAnswered || isCompleting
                  ? 'not-allowed'
                  : 'pointer',
              opacity: !allQuestionsAnswered || isCompleting ? 0.5 : 1,
              transition: 'all 0.3s ease',
            }}
          >
            {isCompleting ? ' Procesando...' : ' Finalizar Encuesta'}
          </button>
        )}
      </div>

      <div
        style={{
          textAlign: 'center',
          marginTop: '1rem',
          fontSize: '0.85rem',
          color: '#6c757d',
        }}
      >
        {Object.values(answers).filter((answer) => answer !== null).length} de{' '}
        {survey.preguntas.length} preguntas respondidas
      </div>
    </div>
  );
}
