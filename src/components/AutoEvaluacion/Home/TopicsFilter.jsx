// src/components/AutoEvaluacion/TopicsFilter.jsx
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

// Agregamos "Todas" como primera opción
const topics = [
  'Todas',
  'Bienestar emocional',
  'Relaciones cercanas',
  'Autoestima y autoconcepto',
  'Habilidades sociales',
  'Salud y hábitos',
  'Orientación emocional',
  'Prevención y señales de alerta',
];

export default function TopicsFilter({ onSelect }) {
  // Por defecto seleccionamos "Todas"
  const [selectedTopic, setSelectedTopic] = useState('Todas');

  const handleClick = (topic) => {
    setSelectedTopic(topic);
    if (onSelect) onSelect(topic);
  };

  return (
    <section
      className="container my-5 p-4"
      style={{
        borderRadius: '1.5rem',
        background: '#FAF8FF', // Fondo suave
        boxShadow: '0 6px 18px rgba(90,78,124,0.08)',
      }}
    >
      <h3
        className="fw-bold mb-4 text-center"
        style={{
          fontFamily: "'Poppins', sans-serif",
          background: 'linear-gradient(90deg, #5A4E7C, #A17CCA)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Selecciona un tópico
      </h3>

      <div className="d-flex flex-wrap justify-content-center gap-3">
        {topics.map((topic, idx) => (
          <button
            key={idx}
            className={`btn topic-btn ${selectedTopic === topic ? 'active' : ''}`}
            onClick={() => handleClick(topic)}
          >
            {topic}
          </button>
        ))}
      </div>

      <style>{`
        .topic-btn {
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          border: 1px solid #A17CCA;
          background: #f7f5fb;
          color: #5A4E7C;
          transition: all 0.3s ease;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .topic-btn:hover {
          transform: translateY(-3px);
          background: #e6e0f5;
        }
        .topic-btn.active {
          background: linear-gradient(90deg, #5A4E7C, #A17CCA);
          color: #fff;
          box-shadow: 0 4px 12px rgba(90, 78, 124, 0.3);
        }
      `}</style>
    </section>
  );
}
