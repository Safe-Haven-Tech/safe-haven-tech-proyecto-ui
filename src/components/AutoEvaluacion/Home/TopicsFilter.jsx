/* filepath: f:\SafeHaven\safe-haven-tech-proyecto-ui\src\components\AutoEvaluacion\Home\TopicsFilter.jsx */
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './TopicsFilter.module.css';

// Agregamos "Todas" como primera opción
const topics = [
  'Todas',
  'Bienestar emocional',
  'Salud mental',
  'Relaciones cercanas',
  'Autoestima y autoconcepto',
  'Habilidades sociales',
  'Salud y hábitos',
  'Orientación emocional',
  'Prevención y señales de alerta',
  'Estrés',
  'Ansiedad',
  'Depresión',
  'Otro',
];

export default function TopicsFilter({ onSelect }) {
  // Por defecto seleccionamos "Todas"
  const [selectedTopic, setSelectedTopic] = useState('Todas');

  const handleClick = (topic) => {
    setSelectedTopic(topic);
    if (onSelect) onSelect(topic);
  };

  return (
    <section className={`container ${styles.topicsSection}`}>
      <h3 className={styles.sectionTitle}>Selecciona un tópico</h3>

      <div className={styles.topicsContainer}>
        {topics.map((topic, idx) => (
          <button
            key={idx}
            className={`${styles.topicBtn} ${
              selectedTopic === topic ? styles.topicBtnActive : ''
            }`}
            onClick={() => handleClick(topic)}
          >
            {topic}
          </button>
        ))}
      </div>
    </section>
  );
}
