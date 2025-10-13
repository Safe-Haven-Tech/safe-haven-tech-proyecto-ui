import React from 'react';
import styles from './WelcomeSection.module.css';

const WelcomeSection = React.memo(() => {
  return (
    <div className={styles.welcomeSection}>
      {/* 🎨 NUEVO: Envolver todo el contenido en contentBox */}
      <div className={styles.contentBox}>
        <h1 className={styles.welcomeTitle}>Bienvenido a SafeHaven</h1>

        <p className={styles.welcomeText}>
          Tu espacio seguro para el crecimiento personal y el bienestar
          emocional.
        </p>

        <div className={styles.featuresContainer}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <i className="bi bi-shield-check"></i>
            </div>
            <span className={styles.featureText}>Seguro</span>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <i className="bi bi-people"></i>
            </div>
            <span className={styles.featureText}>Confiable</span>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <i className="bi bi-heart"></i>
            </div>
            <span className={styles.featureText}>Comprensivo</span>
          </div>
        </div>
      </div>
    </div>
  );
});

WelcomeSection.displayName = 'WelcomeSection';

export default WelcomeSection;
