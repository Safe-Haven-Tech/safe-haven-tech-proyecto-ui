import React, { useState, useEffect } from 'react';
import styles from './QuestionCard.module.css';

const ScaleQuestion = ({ question, answer, onAnswer }) => {
  const scaleLength = question.opciones ? question.opciones.length : 10;
  const scaleValues =
    question.opciones || Array.from({ length: scaleLength }, (_, i) => i + 1);

  return (
    <div className={styles.scaleContainer}>
      <div className={styles.scaleButtons}>
        {scaleValues.map((value, index) => {
          const label = question.opciones
            ? question.opciones[index]
            : index === 0
              ? 'Nunca'
              : index === scaleValues.length - 1
                ? 'Siempre'
                : '';

          const isLongLabel = label && label.length > 8;

          return (
            <div key={index} className={styles.scaleOption} title={label}>
              <button
                type="button"
                onClick={() => onAnswer(value)}
                className={`${styles.scaleButton} ${
                  answer === value ? styles.selected : ''
                }`}
                title={label}
                aria-label={`Opción ${typeof value === 'number' ? value : index + 1}${label ? `: ${label}` : ''}`}
              >
                {typeof value === 'number' ? value : index + 1}
              </button>
              {label && (
                <small
                  className={`${styles.scaleLabel} ${
                    isLongLabel ? styles.scaleLabelLong : ''
                  }`}
                  title={label}
                >
                  {label}
                </small>
              )}
            </div>
          );
        })}
      </div>

      {answer && (
        <div className={styles.selectedIndicator}>Seleccionado: {answer}</div>
      )}
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
    <div className={`card border-0 shadow-sm ${styles.questionCard}`}>
      <div className={styles.cardInner}>
        {/* Header */}
        <div className={styles.questionHeader}>
          <div className={styles.questionInfo}>
            <i
              className={`bi ${getQuestionIcon(question.tipo)} ${styles.questionIcon}`}
              style={{ color: questionColor }}
            ></i>
            <div>
              <h6
                className={styles.questionNumber}
                style={{ color: questionColor }}
              >
                Pregunta {questionNumber} de {totalQuestions}
              </h6>
              <small className={styles.questionType}>
                {question.tipo.replace('_', ' ')}
              </small>
            </div>
          </div>

          <div className={styles.headerBadges}>
            <span
              className={`${styles.obligatoryBadge} ${
                question.obligatoria ? styles.required : styles.optional
              }`}
            >
              {question.obligatoria ? 'Obligatoria' : 'Opcional'}
            </span>
            {!isValid && question.obligatoria && (
              <i
                className={`bi bi-exclamation-triangle-fill ${styles.warningIcon}`}
              ></i>
            )}
          </div>
        </div>

        {/* Cuerpo */}
        <div className={styles.questionBody}>
          <h5 className={styles.questionText}>{question.enunciado}</h5>

          <div className="question-content">
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
              <div className={styles.unsupportedAlert}>
                <i
                  className={`bi bi-exclamation-triangle ${styles.alertIcon}`}
                ></i>
                <div className={styles.alertContent}>
                  <div className={styles.alertTitle}>
                    Tipo de pregunta no soportado: {question.tipo}
                  </div>
                  <p className={styles.alertText}>
                    Contacta al administrador para resolver este problema.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
