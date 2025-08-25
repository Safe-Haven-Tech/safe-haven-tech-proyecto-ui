import React from 'react';
import { styles } from '../../utils/stylesLogin';

const WelcomeSection = React.memo(() => {
  return (
    <div className="text-center" style={styles.welcomeSection}>
      <h1 className="fw-bold mb-3" style={styles.welcomeTitle}>
        ¡Bienvenido a SafeHaven!
      </h1>
      <p className="mb-3" style={styles.welcomeText}>
        Tu espacio seguro para encontrar apoyo, recursos y conexiones que te
        ayuden en tu bienestar mental.
      </p>
      <div className="d-flex justify-content-center gap-3">
        <div className="text-center">
          <div
            className="d-flex align-items-center justify-content-center mx-auto mb-1"
            style={styles.featureIcon}
          >
            <i
              className="fas fa-heart text-white"
              style={{ fontSize: '1.1rem' }}
            ></i>
          </div>
          <small
            className="text-white fw-semibold"
            style={{ fontSize: '0.8rem' }}
          >
            Apoyo
          </small>
        </div>
        <div className="text-center">
          <div
            className="d-flex align-items-center justify-content-center mx-auto mb-1"
            style={styles.featureIcon}
          >
            <i
              className="fas fa-users text-white"
              style={{ fontSize: '1.1rem' }}
            ></i>
          </div>
          <small
            className="text-white fw-semibold"
            style={{ fontSize: '0.8rem' }}
          >
            Comunidad
          </small>
        </div>
        <div className="text-center">
          <div
            className="d-flex align-items-center justify-content-center mx-auto mb-1"
            style={styles.featureIcon}
          >
            <i
              className="fas fa-lightbulb text-white"
              style={{ fontSize: '1.1rem' }}
            ></i>
          </div>
          <small
            className="text-white fw-semibold"
            style={{ fontSize: '0.8rem' }}
          >
            Recursos
          </small>
        </div>
      </div>
    </div>
  );
});

export default WelcomeSection;
