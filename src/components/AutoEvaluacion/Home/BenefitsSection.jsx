// src/components/AutoEvaluacion/BenefitsSection.jsx
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import BookIcon from '../../../assets/icons/Book.svg?react';
import UsersIcon from '../../../assets/icons/Users.svg?react';
import GrowthIcon from '../../../assets/icons/Growth.svg?react';
import AlertIcon from '../../../assets/icons/Alert.svg?react';

const items = [
  {
    icon: <BookIcon width={50} height={50} style={{ color: '#8E7AA6' }} />,
    title: 'Conócete mejor',
    description:
      'Reflexiona sobre tus emociones y cómo manejas situaciones cotidianas.',
  },
  {
    icon: <UsersIcon width={50} height={50} style={{ color: '#8E7AA6' }} />,
    title: 'Evalúa tus vínculos',
    description: 'Comprende mejor la dinámica con las personas cercanas a ti.',
  },
  {
    icon: <GrowthIcon width={50} height={50} style={{ color: '#8E7AA6' }} />,
    title: 'Identifica oportunidades',
    description: 'Encuentra pequeños pasos para fortalecer tu bienestar.',
  },
  {
    icon: <AlertIcon width={50} height={50} style={{ color: '#8E7AA6' }} />,
    title: 'Nota importante',
    description:
      'Esto no sustituye la ayuda profesional, pero puede orientarte a dar el siguiente paso.',
  },
];

export default function BenefitsSection() {
  return (
    <section
      className="container text-center my-5 p-4"
      style={{
        borderRadius: '1.5rem',
        background: '#FAF8FF', // Fondo suave para diferenciar
        boxShadow: '0 6px 18px rgba(90,78,124,0.08)',
      }}
    >
      <h2
        className="fw-bold mb-3"
        style={{
          fontFamily: "'Poppins', sans-serif",
          background: 'linear-gradient(90deg, #5A4E7C, #A17CCA)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Lo que descubrirás con tu autoevaluación
      </h2>
      <p
        className="text-muted mb-5"
        style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1rem' }}
      >
        Responde preguntas sencillas para reflexionar sobre tu bienestar y tus
        relaciones.
      </p>

      <div className="row g-4">
        {items.map((item, idx) => (
          <div key={idx} className="col-12 col-md-6 col-lg-3">
            <div
              className="card h-100 border-0 p-3 benefits-card"
              style={{
                borderRadius: '1rem',
                background: 'rgba(255,255,255,0.85)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                className="mb-3 icon-wrapper"
                style={{ transition: 'transform 0.3s ease' }}
              >
                {item.icon}
              </div>
              <h5
                className="fw-bold"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {item.title}
              </h5>
              <p
                className="text-muted"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '0.95rem',
                }}
              >
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .benefits-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }
        .benefits-card:hover .icon-wrapper {
          transform: scale(1.1);
        }
      `}</style>
    </section>
  );
}
