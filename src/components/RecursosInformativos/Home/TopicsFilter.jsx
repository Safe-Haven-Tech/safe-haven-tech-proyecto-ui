/* filepath: f:\SafeHaven\safe-haven-tech-proyecto-ui\src\components\RecursosInformativos\Home\TopicsFilter.jsx */
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './TopicsFilter.module.css';
import { fetchTopicosDisponibles } from '../../../services/informationalResourcesService';

export default function TopicsFilter({ onSelect }) {
  const [selectedTopic, setSelectedTopic] = useState('Todos');
  const [topics, setTopics] = useState(['Todos']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const topicosData = await fetchTopicosDisponibles();
        setTopics(['Todos', ...topicosData]);
      } catch (error) {
        console.error('Error al cargar tópicos:', error);
        setTopics([
          'Todos',
          'Bienestar emocional',
          'Relaciones cercanas',
          'Autoestima y autoconcepto',
          'Habilidades sociales',
          'Salud y hábitos',
          'Orientación emocional',
          'Prevención y señales de alerta',
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, []);

  const handleClick = (topic) => {
    setSelectedTopic(topic);
    onSelect(topic === 'Todos' ? null : topic);
  };

  if (loading) {
    return (
      <section className={`container ${styles.topicsSection}`}>
        <div className={styles.loadingContainer}>
          <div
            className={`spinner-border ${styles.loadingSpinner}`}
            role="status"
            aria-label="Cargando tópicos"
          >
            <span className="visually-hidden">Cargando tópicos...</span>
          </div>
          <p className={styles.loadingText}>Cargando tópicos disponibles...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`container ${styles.topicsSection}`}
      role="region"
      aria-labelledby="topics-title"
    >
      <h3 id="topics-title" className={styles.sectionTitle}>
        Filtra recursos por tipo
      </h3>

      <div
        className={styles.topicsContainer}
        role="group"
        aria-label="Filtros de tópicos disponibles"
      >
        {topics.map((topic, idx) => (
          <button
            key={topic}
            onClick={() => handleClick(topic)}
            className={`${styles.topicBtn} ${
              selectedTopic === topic ? styles.topicBtnActive : ''
            }`}
            aria-pressed={selectedTopic === topic}
            aria-label={`${selectedTopic === topic ? 'Seleccionado: ' : ''}${topic}${topic === 'Todos' ? ' - Mostrar todos los recursos' : ' - Filtrar por ' + topic}`}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            {topic}
            {selectedTopic === topic && (
              <i
                className={`bi bi-check-circle-fill ${styles.checkIcon}`}
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </div>

      {/* Información adicional */}
      <div className={styles.additionalInfo}>
        <p className={styles.infoText}>
          <i className={`bi bi-funnel ${styles.infoIcon}`} aria-hidden="true" />
          <span>
            Selecciona un tópico para filtrar los recursos disponibles
          </span>
        </p>
      </div>
    </section>
  );
}
