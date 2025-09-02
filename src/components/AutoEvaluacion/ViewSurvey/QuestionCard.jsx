import React, { useState, useEffect } from 'react';

// Componente para preguntas de escala
const ScaleQuestion = ({ question, answer, onAnswer }) => {
  const scaleLength = question.opciones ? question.opciones.length : 10;
  const scaleValues =
    question.opciones || Array.from({ length: scaleLength }, (_, i) => i + 1);

  return (
    <div className="scale-container">
      <div className="text-center mb-4">
        <div
          className="btn-group flex-wrap justify-content-center"
          role="group"
          style={{ gap: '20px' }}
        >
          {scaleValues.map((value, index) => {
            const label = question.opciones
              ? question.opciones[index]
              : index === 0
                ? 'Nunca'
                : index === scaleValues.length - 1
                  ? 'Siempre'
                  : '';

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '60px',
                }}
                title={label} // tooltip para mostrar texto completo
              >
                <button
                  type="button"
                  onClick={() => onAnswer(value)}
                  style={{
                    minWidth: '50px',
                    height: '50px',
                    fontWeight: answer === value ? 'bold' : 'normal',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    transform: answer === value ? 'scale(1.1)' : 'scale(1)',
                    boxShadow:
                      answer === value
                        ? '0 4px 12px rgba(90, 78, 124, 0.3)'
                        : 'none',
                    background:
                      answer === value
                        ? 'linear-gradient(90deg, #5A4E7C, #A17CCA)'
                        : 'transparent',
                    color: answer === value ? 'white' : '#5A4E7C',
                    border: `2px solid ${answer === value ? 'transparent' : '#A17CCA'}`,
                    cursor: 'pointer',
                  }}
                  title={label} // tooltip del botón también
                >
                  {typeof value === 'number' ? value : index + 1}
                </button>
                {label && (
                  <small
                    style={{
                      marginTop: '4px',
                      color: '#6c757d',
                      textAlign: 'center',
                      width: '100%',
                      whiteSpace: 'nowrap', // evita que el texto se rompa
                      overflow: 'hidden', // oculta el exceso
                      textOverflow: 'ellipsis', // agrega "..." si es largo
                    }}
                  >
                    {label}
                  </small>
                )}
              </div>
            );
          })}
        </div>

        {answer && (
          <div className="mt-3">
            <span
              style={{
                background: 'linear-gradient(90deg, #5A4E7C, #A17CCA)',
                color: 'white',
                borderRadius: '12px',
                fontSize: '0.85rem',
                padding: '0.4rem 0.8rem',
              }}
            >
              Seleccionado: {answer}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente principal QuestionCard
export default function QuestionCard({
  question,
  answer,
  onAnswer,
  questionNumber,
  totalQuestions,
}) {
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (question.obligatoria) {
      if (question.tipo === 'opcion_multiple') {
        setIsValid(Array.isArray(answer) && answer.length > 0);
      } else {
        setIsValid(answer !== null && answer !== undefined && answer !== '');
      }
    } else {
      setIsValid(true);
    }
  }, [answer, question.obligatoria, question.tipo]);

  const getQuestionIcon = (tipo) => {
    switch (tipo) {
      case 'opcion_unica':
        return 'bi-ui-radios';
      case 'opcion_multiple':
        return 'bi-ui-checks';
      case 'texto_libre':
        return 'bi-textarea-t';
      case 'escala':
        return 'bi-bar-chart-steps';
      default:
        return 'bi-question-circle';
    }
  };

  const getQuestionColor = (tipo) => {
    switch (tipo) {
      case 'opcion_unica':
        return '#5A4E7C';
      case 'opcion_multiple':
        return '#6F42C1';
      case 'texto_libre':
        return '#20C997';
      case 'escala':
        return '#4b298aff';
      default:
        return '#6C757D';
    }
  };

  const questionColor = getQuestionColor(question.tipo);

  return (
    <div
      className="card border-0 shadow-sm mb-4"
      style={{
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #5A4E7C, #A17CCA)',
        padding: '2px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(90, 78, 124, 0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      }}
    >
      <div
        style={{ borderRadius: '14px', background: 'white', height: '100%' }}
      >
        {/* Header */}
        <div
          className="card-header border-0 d-flex justify-content-between align-items-center"
          style={{
            background:
              'linear-gradient(90deg, rgba(90,78,124,0.1), rgba(161,124,202,0.1))',
            borderRadius: '14px 14px 0 0',
            padding: '1.25rem',
          }}
        >
          <div className="d-flex align-items-center">
            <i
              className={`bi ${getQuestionIcon(question.tipo)} me-3`}
              style={{ fontSize: '1.5rem', color: questionColor }}
            ></i>
            <div>
              <h6 className="mb-0 fw-bold" style={{ color: questionColor }}>
                Pregunta {questionNumber} de {totalQuestions}
              </h6>
              <small className="text-muted text-capitalize">
                {question.tipo.replace('_', ' ')}
              </small>
            </div>
          </div>

          <div className="d-flex align-items-center">
            <span
              style={{
                background: question.obligatoria
                  ? 'linear-gradient(90deg, #5A4E7C, #A17CCA)'
                  : '#6c757d',
                color: 'white',
                borderRadius: '12px',
                fontSize: '0.8rem',
                padding: '0.4rem 0.8rem',
                marginRight: '8px',
              }}
            >
              {question.obligatoria ? 'Obligatoria' : 'Opcional'}
            </span>
            {!isValid && question.obligatoria && (
              <i
                className="bi bi-exclamation-triangle-fill text-warning"
                style={{ fontSize: '1.2rem' }}
              ></i>
            )}
          </div>
        </div>

        {/* Cuerpo */}
        <div className="card-body p-4">
          <h5
            className="mb-4 fw-semibold"
            style={{ lineHeight: '1.6', color: '#2c3e50' }}
          >
            {question.enunciado}
          </h5>

          <div className="question-content">
            {question.tipo === 'opcion_unica' && (
              <SingleOptionQuestion
                question={question}
                answer={answer}
                onAnswer={onAnswer}
              />
            )}
            {question.tipo === 'opcion_multiple' && (
              <MultipleOptionQuestion
                question={question}
                answer={answer}
                onAnswer={onAnswer}
              />
            )}
            {question.tipo === 'texto_libre' && (
              <FreeTextQuestion
                question={question}
                answer={answer}
                onAnswer={onAnswer}
              />
            )}
            {question.tipo === 'escala' && (
              <ScaleQuestion
                question={question}
                answer={answer}
                onAnswer={onAnswer}
              />
            )}
            {![
              'opcion_unica',
              'opcion_multiple',
              'texto_libre',
              'escala',
            ].includes(question.tipo) && (
              <div className="alert alert-warning d-flex align-items-center">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <div>
                  <strong>Tipo de pregunta no soportado:</strong>{' '}
                  {question.tipo}
                  <br />
                  <small>
                    Contacta al administrador para resolver este problema.
                  </small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
