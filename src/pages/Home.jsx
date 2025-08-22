import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import background from '../assets/FondoLogin.png';

// Sistema de colores consistente con Login
const colors = {
  primary: '#22c55e',
  primaryHover: '#16a34a',
  secondary: '#64748b',
  white: '#ffffff',
  lightGray: '#f8fafc',
  darkGray: '#334155',
  background: '#ffffff',
};

// Estilos para la sección de bienvenida
const styles = {
  welcomeSection: {
    minHeight: '60vh',
    backgroundImage : background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 0',
  },
  welcomeContainer: {
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto',
  },
  welcomeTitle: {
    fontSize: '3.5rem',
    fontWeight: 800,
    color: colors.primary,
    marginBottom: '1.5rem',
    lineHeight: 1.2,
  },
  welcomeSubtitle: {
    fontSize: '1.3rem',
    color: colors.darkGray,
    marginBottom: '2rem',
    lineHeight: 1.6,
  },
  welcomeDescription: {
    fontSize: '1.1rem',
    color: colors.secondary,
    marginBottom: '3rem',
    lineHeight: 1.7,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    border: 'none',
    borderRadius: '12px',
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: colors.white,
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
  },
};

// Componente de la sección de bienvenida
const WelcomeSection = () => {
  return (
    <section style={styles.welcomeSection}>
      <div className="container">
        <div style={styles.welcomeContainer}>
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
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = colors.primary;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
              }}
            >
              <i className="fas fa-heart me-2"></i>
              Comenzar Autoevaluación
            </a>
            <a
              href="/recursos"
              className="btn btn-lg btn-outline-success"
              style={{
                borderColor: colors.primary,
                color: colors.primary,
                borderRadius: '12px',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 600,
                textDecoration: 'none',
                border: `2px solid ${colors.primary}`,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.primary;
                e.target.style.color = colors.white;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = colors.primary;
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

        {/* Aquí irán las próximas secciones */}
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
