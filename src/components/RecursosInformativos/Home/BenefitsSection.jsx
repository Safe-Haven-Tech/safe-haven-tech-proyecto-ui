import React from 'react';

// Iconos SVG personalizados
const BookIcon = ({ width, height, style }) => (
  <svg width={width} height={height} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
  </svg>
);

const SearchIcon = ({ width, height, style }) => (
  <svg width={width} height={height} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const DownloadIcon = ({ width, height, style }) => (
  <svg width={width} height={height} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
  </svg>
);

const TrustedIcon = ({ width, height, style }) => (
  <svg width={width} height={height} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
  </svg>
);

const items = [
  {
    icon: <BookIcon width={50} height={50} style={{ color: '#8E7AA6' }} />,
    title: 'Contenido especializado',
    description:
      'Accede a artículos, guías y manuales especializados en salud mental.',
  },
  {
    icon: <SearchIcon width={50} height={50} style={{ color: '#8E7AA6' }} />,
    title: 'Encuentra lo que necesitas',
    description: 'Utiliza filtros por tópico de contenido para localizar información específica.',
  },

  {
    icon: <TrustedIcon width={50} height={50} style={{ color: '#8E7AA6' }} />,
    title: 'Información confiable',
    description:
      'Todo el contenido está basado en evidencia científica y mejores prácticas profesionales.',
  },
];

export default function BenefitsSection() {
  return (
    <section
      className="container my-5 p-5"
      style={{
        borderRadius: '1.5rem',
        background: 'linear-gradient(135deg, #FAF8FF 0%, #F3F0FF 100%)',
        boxShadow: '0 8px 24px rgba(90,78,124,0.12)',
      }}
    >
      <h3
        className="fw-bold mb-5 text-center"
        style={{
          fontFamily: "'Poppins', sans-serif",
          background: 'linear-gradient(90deg, #5A4E7C, #A17CCA)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '2rem',
        }}
      >
        ¿Por qué consultar nuestros recursos?
      </h3>

      <div className="row g-4">
        {items.map((item, idx) => (
          <div key={idx} className={`${idx === 2 ? 'col-md-6 offset-md-3' : 'col-md-6'}`}>
            <div
              className="h-100 p-4 d-flex align-items-start"
              style={{
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '1rem',
                border: '1px solid rgba(161,124,202,0.2)',
                transition: 'all 0.3s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(90,78,124,0.15)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
              }}
            >
              <div className="me-3 flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h5
                  className="fw-bold mb-2"
                  style={{
                    color: '#5A4E7C',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '1.1rem',
                  }}
                >
                  {item.title}
                </h5>
                <p
                  className="mb-0"
                  style={{
                    color: '#444',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                  }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje adicional */}
      <div
        className="mt-4 p-3 text-center"
        style={{
          background: 'rgba(161,124,202,0.1)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(161,124,202,0.3)',
        }}
      >
        <p
          className="mb-0 fst-italic"
          style={{
            color: '#5A4E7C',
            fontSize: '0.9rem',
            fontWeight: '500',
          }}
        >
          <i className="bi bi-info-circle me-2"></i>
          Recuerda que estos recursos son complementarios y no sustituyen la consulta profesional.
        </p>
      </div>
    </section>
  );
}