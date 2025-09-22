import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './HomePage.module.css';
import background from '../../assets/FondoLogin.png';

// Componente de la sección de bienvenida
const WelcomeSection = () => {
  return (
    <section
      className={styles.welcomeSection}
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="container">
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>
            Bienvenido a SafeHaven
          </h1>
          
          <p className={styles.welcomeSubtitle}>
            Tu espacio seguro para el bienestar mental
          </p>
          
          <p className={styles.welcomeDescription}>
            Descubre recursos, conecta con una comunidad de apoyo y encuentra
            las herramientas que necesitas para cuidar tu salud mental. Estamos
            aquí para acompañarte en cada paso de tu camino hacia el bienestar.
          </p>
          
          <div className={styles.ctaContainer}>
            <a
              href="/autoevaluacion"
              className={`btn btn-lg ${styles.ctaButton}`}
              role="button"
              aria-label="Comenzar proceso de autoevaluación de bienestar mental"
            >
              
              Comenzar Autoevaluación
            </a>
            
            <a
              href="/recursos"
              className={`btn btn-lg ${styles.ctaButton} ${styles.ctaButtonSecondary}`}
              role="button"
              aria-label="Explorar recursos de apoyo y bienestar mental"
            >
              
              Explorar Recursos
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

// Componente de sección futura
const FutureSection = () => {
  return (
    <div className={styles.futureSection}>
      <div className="container">
        <div className={`text-center ${styles.futureSectionContent}`}>
          <h3 className={styles.futureSectionTitle}>
            Próximas secciones en desarrollo...
          </h3>
          <p className={styles.futureSectionText}>
            Aquí agregaremos más contenido según tus especificaciones
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente principal del Home
const HomePage = () => {
  return (
    <div className={styles.homeContainer}>
      {/* Espaciado para el navbar fijo */}
      <div className={styles.navbarSpacer}>
        {/* Sección de Bienvenida */}
        <WelcomeSection />

        {/* Sección futura */}
        <FutureSection />
      </div>
    </div>
  );
};

export default HomePage;