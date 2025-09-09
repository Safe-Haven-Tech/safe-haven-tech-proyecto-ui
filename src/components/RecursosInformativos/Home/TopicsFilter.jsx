import React, { useState, useEffect } from 'react';
import { fetchTopicosDisponibles } from '../../../services/informationalResourcesService';

export default function TopicsFilter({ onSelect }) {
  const [selectedTopic, setSelectedTopic] = useState('Todos');
  const [topics, setTopics] = useState(['Todos']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const topicosData = await fetchTopicosDisponibles();
        // Agregamos "Todos" como primera opción
        setTopics(['Todos', ...topicosData]);
      } catch (error) {
        console.error('Error al cargar tópicos:', error);
        // Fallback con tópicos predeterminados si falla la API
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
    // Enviamos null si es "Todos", de lo contrario el tópico seleccionado
    onSelect(topic === 'Todos' ? null : topic);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div
          className="spinner-border"
          style={{ color: '#A17CCA' }}
          role="status"
        >
          <span className="visually-hidden">Cargando tópicos...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="container">
      <h3
        className="fw-bold mb-4 text-center"
        style={{
          fontFamily: "'Poppins', sans-serif",
          background: 'linear-gradient(90deg, #5A4E7C, #A17CCA)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '1.8rem',
        }}
      >
        Explora por tópico
      </h3>

      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="d-flex flex-wrap justify-content-center gap-3">
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => handleClick(topic)}
                className="btn fw-semibold px-4 py-2"
                style={{
                  borderRadius: '25px',
                  border: selectedTopic === topic 
                    ? '2px solid #A17CCA' 
                    : '2px solid #E0E0E0',
                  background: selectedTopic === topic 
                    ? 'linear-gradient(90deg, #5A4E7C, #A17CCA)' 
                    : 'white',
                  color: selectedTopic === topic ? 'white' : '#5A4E7C',
                  fontSize: '0.9rem',
                  fontFamily: "'Poppins', sans-serif",
                  transition: 'all 0.3s ease',
                  boxShadow: selectedTopic === topic 
                    ? '0 4px 12px rgba(90, 78, 124, 0.3)' 
                    : '0 2px 6px rgba(0,0,0,0.1)',
                  minWidth: 'fit-content',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (selectedTopic !== topic) {
                    e.currentTarget.style.borderColor = '#A17CCA';
                    e.currentTarget.style.color = '#A17CCA';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 15px rgba(161, 124, 202, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTopic !== topic) {
                    e.currentTarget.style.borderColor = '#E0E0E0';
                    e.currentTarget.style.color = '#5A4E7C';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
                  }
                }}
              >
                {topic}
                {selectedTopic === topic && (
                  <i 
                    className="bi bi-check-circle-fill ms-2" 
                    style={{ fontSize: '0.8rem' }}
                  ></i>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="text-center mt-4">
        <p
          style={{
            color: '#666',
            fontSize: '0.9rem',
            fontStyle: 'italic',
            margin: 0,
          }}
        >
          <i className="bi bi-funnel me-1"></i>
          Selecciona un tópico para filtrar los recursos disponibles
        </p>
      </div>
    </section>
  );
}