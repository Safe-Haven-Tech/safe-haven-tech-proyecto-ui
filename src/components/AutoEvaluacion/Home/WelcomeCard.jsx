import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './WelcomeCard.module.css';
import evaluationWelcome from '../../../assets/EvaluationWelcome.png';

// Importamos los SVGs como imágenes normales
import LightningIcon from '../../../assets/icons/Lightning.svg';
import BookIcon from '../../../assets/icons/Book.svg';
import LockIcon from '../../../assets/icons/Lock.svg';

export default function WelcomeCard({
  title,
  subtitle,
  description,
  fullWidth = false,
}) {
  const miniBoxes = [
    {
      icon: LightningIcon,
      title: 'Feedback inmediato',
      description: 'Sabrás tu estado emocional al instante.',
    },
    {
      icon: BookIcon,
      title: 'Recursos confiables',
      description: 'Accede a guías y apoyo confiable.',
    },
    {
      icon: LockIcon,
      title: 'Seguro y privado',
      description: 'Tus respuestas son completamente confidenciales.',
    },
  ];

  return (
    <div
      className={`card shadow-lg ${styles.welcomeCard} ${
        fullWidth ? styles.welcomeCardFullWidth : ''
      }`}
      style={{
        '--welcome-image': `url(${evaluationWelcome})` // 🎯 NUEVO: Pasamos la imagen como variable CSS
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

        {/* 🎯 REMOVIDO: imageContainer e welcomeImage ya no son necesarios */}
        {/* La imagen ahora es parte del fondo del card */}
      </div>
    </div>
  );
}