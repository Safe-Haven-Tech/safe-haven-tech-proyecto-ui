import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import evaluationWelcome from '../../../assets/ResourcesHome.png';

// Importamos los SVGs como imágenes normales
import BookIcon from '../../../assets/icons/Book.svg';
import LockIcon from '../../../assets/icons/Lock.svg';

// Puedes usar iconos de Bootstrap o crear/importar nuevos SVGs para estos
const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#5A4E7C"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="#5A4E7C"/>
  </svg>
);

export default function WelcomeCard({
  title,
  subtitle,
  description,
  fullWidth = false,
}) {
  const shapes = [
    {
      top: '-10%',
      left: '-5%',
      width: '20%',
      height: '60%',
      color: 'rgba(90, 78, 124, 0.08)',
      borderRadius: '50% / 30%',
    },
    {
      bottom: '-15%',
      right: '-10%',
      width: '25%',
      height: '55%',
      color: 'rgba(161, 124, 202, 0.1)',
      borderRadius: '40% / 50%',
    },
    {
      top: '15%',
      right: '5%',
      width: '18%',
      height: '30%',
      color: 'rgba(233, 213, 229, 0.12)',
      borderRadius: '50% / 40%',
    },
    {
      top: '5%',
      left: '35%',
      width: '10%',
      height: '25%',
      color: 'rgba(200, 180, 220, 0.15)',
      borderRadius: '45% / 55%',
    },
  ];

  const miniBoxes = [
    {
      icon: <SearchIcon />,
      title: 'Fácil búsqueda',
      description: 'Encuentra el contenido que necesitas por tópico.',
    },
    {
      icon: <img src={BookIcon} alt="Book" style={{ width: '24px', height: '24px' }} />,
      title: 'Contenido variado',
      description: 'Artículos, guías, videos e infografías.',
    },

  ];

  return (
    <div
      className={`card shadow-lg ${fullWidth ? 'w-100' : 'mx-4'}`}
      style={{
        position: 'relative',
        borderRadius: fullWidth ? '0' : '1.5rem',
        background: 'linear-gradient(135deg, #FBE8F5, #E6F0FA, #D0E6FF)',
        color: '#333',
        minHeight: '400px',
        overflow: 'hidden',
      }}
    >
      {/* Fondos decorativos */}
      {shapes.map((shape, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            top: shape.top,
            bottom: shape.bottom,
            left: shape.left,
            right: shape.right,
            width: shape.width,
            height: shape.height,
            borderRadius: shape.borderRadius,
            background: shape.color,
          }}
        />
      ))}

      {/* Contenido principal */}
      <div
        className="d-flex h-100 flex-column flex-md-row position-relative"
        style={{ zIndex: 1 }}
      >
        {/* Texto */}
        <div
          className="p-4 p-md-5 d-flex flex-column justify-content-center"
          style={{
            flex: 1,
            maxWidth: '60%', // Limita el ancho del contenedor de texto
          }}
        >
          <h1
            className="fw-bold"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
              background: 'linear-gradient(90deg, #5A4E7C, #A17CCA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem',
            }}
          >
            {title}
          </h1>

          <h4
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: '600',
              fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
              color: '#6B5FA5',
              marginBottom: '1rem',
            }}
          > 
            {subtitle}
          </h4>

          <p
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              color: '#555',
              marginBottom: '1rem',
            }}
          >
            {description}
          </p>

          {/* Mini-cajas con iconos */}
          <div className="d-flex gap-3 mt-3 flex-wrap">
            {miniBoxes.map((box, idx) => (
              <div
                key={idx}
                className="flex-grow-1"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  borderRadius: '1rem',
                  padding: '1rem',
                  minWidth: '140px',
                  maxWidth: '220px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <div style={{ width: '24px', height: '24px' }}>
                  {box.icon}
                </div>
                <div>
                  <strong>{box.title}</strong>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>
                    {box.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Imagen */}
        <div
          className="d-none d-xl-block"
          style={{
            position: 'absolute',
            left: '72.5rem',
            bottom: '-13.5rem',
            width: '800px',
            height: '800px',
            zIndex: 2,
          }}
        >
          <img
            src={evaluationWelcome}
            alt="Bienvenida"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      </div>
    </div>
  );
}