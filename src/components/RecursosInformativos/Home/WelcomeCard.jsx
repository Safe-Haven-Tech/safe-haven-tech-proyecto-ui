import React from 'react';
import styles from './WelcomeCard.module.css';

import evaluationWelcome from '../../../assets/ResourcesHome.png';

import BookIcon from '../../../assets/icons/Book.svg?react';
import SearchIcon from '../../../assets/icons/Search.svg?react';
import TrustedIcon from '../../../assets/icons/Trusted.svg?react';
import AlertIcon from '../../../assets/icons/Alert.svg?react';

export default function WelcomeCard({
  title = 'Autoevaluaciones de Salud Mental',
  subtitle = 'Conoce tu bienestar emocional',
  description = 'Completa evaluaciones profesionales diseñadas para ayudarte a entender tu estado mental y emocional actual.',
  fullWidth = false,
}) {
  const miniBoxes = [
    {
      icon: <BookIcon />,
      title: 'Contenido especializado',
      description: 'Información curada por profesionales de la salud mental.',
    },
    {
      icon: <SearchIcon />,
      title: 'Encuentra lo que necesitas',
      description:
        'Herramientas de búsqueda avanzada para encontrar recursos específicos.',
    },
    {
      icon: <TrustedIcon />,
      title: 'Información confiable',
      description: 'Recursos verificados y actualizados constantemente.',
    },
    {
      icon: <AlertIcon />,
      title: 'Nota importante',
      description:
        'Nuestros recursos están diseñados para complementar, no reemplazar, la atención profesional de salud mental.',
    },
  ];

  return (
    <div
      className={`card shadow-lg ${styles.welcomeCard} ${
        fullWidth ? styles.welcomeCardFullWidth : ''
      }`}
      style={{
        '--welcome-image': `url(${evaluationWelcome})`,
      }}
    >
      <div className={`${styles.decorativeShape} ${styles.shape1}`} />
      <div className={`${styles.decorativeShape} ${styles.shape2}`} />
      <div className={`${styles.decorativeShape} ${styles.shape3}`} />
      <div className={`${styles.decorativeShape} ${styles.shape4}`} />

      <div className={styles.mainContainer}>
        <div className={styles.textContainer}>
          <h1 className={styles.title}>{title}</h1>
          <h4 className={styles.subtitle}>{subtitle}</h4>
          <p className={styles.description}>{description}</p>

          <div className={styles.miniBoxesContainer}>
            {miniBoxes.map((box, idx) => (
              <div key={idx} className={styles.miniBox}>
                <div className={styles.miniBoxIcon} aria-hidden>
                  {box.icon}
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