// src/pages/SelfAssessment/SelfAssessment.jsx
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import WelcomeCard from '../../components/AutoEvaluacion/Home/WelcomeCard';
import BenefitsSection from '../../components/AutoEvaluacion/Home/BenefitsSection';
import TopicsFilter from '../../components/AutoEvaluacion/Home/TopicsFilter';
import SurveysSection from '../../components/AutoEvaluacion/Home/SurveysSection';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function SelfAssessment() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const navigate = useNavigate();
  const { usuario } = useAuth();

  return (
    <>
      {/* Welcome Card */}
      <div className="w-100" style={{ marginTop: '80px' }}>
        <WelcomeCard
          title="¡Bienvenido a las encuestas de autoevaluación!"
          subtitle="Descubre tu estado emocional de manera segura y sencilla."
          description="Realiza las encuestas disponibles, obtén retroalimentación inmediata sobre tu bienestar emocional y accede a recursos confiables que te ayudarán a cuidarte y sentirte acompañado o ayudar a otros"
          fullWidth
        />
      </div>
      {usuario && (
        <div className="d-flex justify-content-center my-4">
          <div
            className="p-4"
            style={{
              background: 'white',
              border: '2px solid #A17CCA',
              borderRadius: '16px',
              maxWidth: '500px',
              boxShadow: '0 6px 12px rgba(0,0,0,0.08)',
              fontFamily: "'Poppins', sans-serif",
              textAlign: 'center',
            }}
          >
            <h5
              className="fw-bold mb-2"
              style={{
                color: '#5A4E7C',
              }}
            >
              Tus autoevaluaciones
            </h5>
            <p
              style={{
                fontSize: '0.95rem',
                color: '#444',
                marginBottom: '20px',
              }}
            >
              Aquí podrás consultar todas las autoevaluaciones que has realizado
              y, si lo deseas, descargarlas para guardarlas o compartirlas.
            </p>
            <button
              onClick={() => navigate('/mis-evaluaciones')}
              className="d-flex align-items-center justify-content-center w-100 fw-semibold px-4 py-3"
              style={{
                background: 'linear-gradient(90deg, #5A4E7C, #A17CCA)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1rem',
                boxShadow: '0 4px 10px rgba(90, 78, 124, 0.3)',
                transition: 'all 0.2s ease-in-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <i className="bi bi-clipboard-check me-2"></i>
              Ver y descargar mis evaluaciones
            </button>
          </div>
        </div>
      )}

      <div className="container py-5">
        {/* Benefits Section */}
        <BenefitsSection />

        {/* Topics Filter */}
        <div className="my-5">
          <TopicsFilter onSelect={setSelectedTopic} />
        </div>

        {/* Encuestas */}
        <div className="my-4">
          <h3
            className="fw-bold mb-4 text-center"
            style={{
              fontFamily: "'Poppins', sans-serif",
              background: 'linear-gradient(90deg, #5A4E7C, #A17CCA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Encuestas disponibles
          </h3>
          <SurveysSection selectedTopic={selectedTopic} />
        </div>
      </div>
    </>
  );
}
