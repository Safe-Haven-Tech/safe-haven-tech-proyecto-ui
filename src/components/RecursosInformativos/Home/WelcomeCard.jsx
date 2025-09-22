/* filepath: f:\SafeHaven\safe-haven-tech-proyecto-ui\src\components\RecursosInformativos\Home\WelcomeCard.jsx */
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './WelcomeCard.module.css';

// Importar la imagen de autoevaluaciones (ajusta la ruta según tu proyecto)
import evaluationWelcome from '../../../assets/ResourcesHome.png';

// Importamos los SVGs como imágenes normales
import LightningIcon from '../../../assets/icons/Lightning.svg';
import BookIcon from '../../../assets/icons/Book.svg';

export default function WelcomeCard({
  title = "Autoevaluaciones de Salud Mental",
  subtitle = "Conoce tu bienestar emocional",
  description = "Completa evaluaciones profesionales diseñadas para ayudarte a entender tu estado mental y emocional actual.",
  fullWidth = false,
}) {
  const miniBoxes = [
    {
      icon: LightningIcon,
      title: 'Fácil búsqueda',
      description: 'Encuentra rápidamente evaluaciones específicas.',
    },
    {
      icon: BookIcon,
      title: 'Contenido variado',
      description: 'Diferentes tipos de autoevaluaciones disponibles.',
    },
  ];

  return (
    <div
      className={`card shadow-lg ${styles.welcomeCard} ${
        fullWidth ? styles.welcomeCardFullWidth : ''
      }`}
      style={{
        '--welcome-image': `url(${evaluationWelcome})`
      }}
    >
      {/* Fondos decorativos */}
      <div className={`${styles.decorativeShape} ${styles.shape1}`} />
      <div className={`${styles.decorativeShape} ${styles.shape2}`} />
      <div className={`${styles.decorativeShape} ${styles.shape3}`} />
      <div className={`${styles.decorativeShape} ${styles.shape4}`} />

      {/* Contenido principal */}
      <div className={styles.mainContainer}>
        {/* Texto */}
        <div className={styles.textContainer}>
          <h1 className={styles.title}>
            {title}
          </h1>

          <h4 className={styles.subtitle}>
            {subtitle}
          </h4>

          <p className={styles.description}>
            {description}
          </p>

          {/* Mini-cajas con iconos */}
          <div className={styles.miniBoxesContainer}>
            {miniBoxes.map((box, idx) => (
              <div key={idx} className={styles.miniBox}>
                <div className={styles.miniBoxIcon}>
                  <img
                    src={box.icon}
                    alt={box.title}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                <div className={styles.miniBoxContent}>
                  <h6>{box.title}</h6>
                  <p>{box.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}