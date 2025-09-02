import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import background from '../../assets/FondoLogin.png';

const colors = {
  primary: '#603c7eff', // Morado principal
  primaryHover: '#4c1d95', // Morado oscuro
  secondary: '#9333ea', // Morado claro
  white: '#ffffff',
  lightGray: '#f8fafc',
  darkGray: '#334155',
  background: '#ffffff',
  lightPurple: '#f3e8ff', // Nuevo color para efectos sutiles
  warmGray: '#4b5563', // Nuevo color para textos secundarios
};

// Estilos para la sección de bienvenida
const styles = {
  welcomeSection: {
    minHeight: '70vh',
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.1)), url(${background})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 0',
  },
  welcomeTitle: {
    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', // Tamaño responsivo
    fontWeight: 800,
    color: colors.primary,
    marginBottom: '1.5rem',
    lineHeight: 1.2,
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
  },
  welcomeSubtitle: {
    fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
    color: colors.warmGray,
    marginBottom: '2rem',
    lineHeight: 1.6,
    maxWidth: '90%',
    margin: '0 auto 2rem auto',
  },
  welcomeDescription: {
    fontSize: '1.1rem',
    color: colors.darkGray,
    marginBottom: '2.5rem',
    lineHeight: 1.7,
    maxWidth: '85%',
    margin: '0 auto 2.5rem auto',
  },
  ctaButton: {
    backgroundColor: colors.primary,
    border: 'none',
    borderRadius: '8px',
    padding: '0.8rem 1.8rem',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: colors.white,
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(107, 33, 168, 0.2)',
  },
};

// Componente de la sección de bienvenida
const WelcomeSection = () => {
  return (
    <section style={styles.welcomeSection}>
      <div className="container">
        <div
          style={{
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '2.5rem 2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
          }}
        >
          <h1 style={styles.welcomeTitle}>Bienvenido a SafeHaven</h1>
          <p style={styles.welcomeSubtitle}>
            Tu espacio seguro para el bienestar mental
          </p>
          <p style={styles.welcomeDescription}>
            Descubre recursos, conecta con una comunidad de apoyo y encuentra
            las herramientas que necesitas para cuidar tu salud mental. Estamos
            aquí para acompañarte en cada paso de tu camino hacia el bienestar.
          </p>
          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
            <a
              href="/autoevaluacion"
              className="btn btn-lg"
              style={styles.ctaButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.primaryHover;
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = colors.primary;
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <i className="fas fa-heart me-2"></i>
              Comenzar Autoevaluación
            </a>
            <a
              href="/recursos"
              className="btn btn-lg"
              style={{
                ...styles.ctaButton,
                backgroundColor: 'transparent',
                border: `2px solid ${colors.primary}`,
                color: colors.primary,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.lightPurple;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <i className="fas fa-book me-2"></i>
              Explorar Recursos
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

// Componente principal del Home
const Home = () => {
  return (
    <div className="min-vh-100" style={{ backgroundColor: colors.background }}>
      {/* Espaciado para el navbar fijo */}
      <div style={{ paddingTop: '80px' }}>
        {/* Sección de Bienvenida */}
        <WelcomeSection />

        {/* Sección futura */}
        <div style={{ minHeight: '200px', backgroundColor: colors.lightGray }}>
          <div className="container py-5">
            <div className="text-center">
              <h3 style={{ color: colors.secondary }}>
                Próximas secciones en desarrollo...
              </h3>
              <p style={{ color: colors.secondary }}>
                Aquí agregaremos más contenido según tus especificaciones
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
