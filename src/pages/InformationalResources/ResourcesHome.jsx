import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import WelcomeCard from '../../components/RecursosInformativos/Home/WelcomeCard';
import BenefitsSection from '../../components/RecursosInformativos/Home/BenefitsSection';
import TopicsFilter from '../../components/RecursosInformativos/Home/TopicsFilter';
import ResourcesSection from '../../components/RecursosInformativos/Home/ResourcesSection';

export default function InformationalResourcesHome() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  
  return (
    <>
      {/* Welcome Card */}
      <div className="w-100" style={{ marginTop: '80px' }}>
        <WelcomeCard
          title="¡Bienvenido a los recursos informativos!"
          subtitle="Accede a información confiable y recursos educativos para tu bienestar."
          description="Explora artículos, guías, manuales y contenido multimedia especializado que te ayudará a comprender mejor temas de salud mental, bienestar emocional y autocuidado."
          fullWidth
        />
      </div>



      <div className="container py-5">
        {/* Benefits Section */}
        <BenefitsSection />

        {/* Topics Filter */}
        <div className="my-5">
          <TopicsFilter onSelect={setSelectedTopic} />
        </div>

        {/* Recursos */}
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
            Recursos disponibles
          </h3>
          <ResourcesSection selectedTopic={selectedTopic} />
        </div>
      </div>
    </>
  );
}