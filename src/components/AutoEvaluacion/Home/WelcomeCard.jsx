import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './WelcomeCard.module.css';
import evaluationWelcome from '../../../assets/EvaluationWelcome.png';

// Importar todos los SVG como componentes React
import LightningIcon from '../../../assets/icons/Lightning.svg?react';
import BookIcon from '../../../assets/icons/Book.svg?react';
import LockIcon from '../../../assets/icons/Lock.svg?react';

import UsersIcon from '../../../assets/icons/Users.svg?react';
import GrowthIcon from '../../../assets/icons/Growth.svg?react';
import AlertIcon from '../../../assets/icons/Alert.svg?react';

export default function WelcomeCard({
  title,
  subtitle,
  description,
  fullWidth = false,
}) {
  const miniBoxes = [
    {
      icon: <BookIcon aria-hidden="true" />,
      title: 'Conócete mejor',
      description:
        'Reflexiona sobre tus emociones y cómo manejas situaciones cotidianas.',
    },
    {
      icon: <UsersIcon aria-hidden="true" />,
      title: 'Evalúa tus vínculos',
      description: 'Comprende mejor la dinámica con las personas cercanas a ti.',
    },
    {
      icon: <GrowthIcon aria-hidden="true" />,
      title: 'Identifica oportunidades',
      description: 'Encuentra pequeños pasos para fortalecer tu bienestar.',
    },
    {
      icon: <AlertIcon aria-hidden="true" />,
      title: 'Nota importante',
      description:
        'Esto no sustituye la ayuda profesional, pero puede orientarte a dar el siguiente paso.',
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
      {/* Fondos decorativos */}
      <div className={`${styles.decorativeShape} ${styles.shape1}`} />
      <div className={`${styles.decorativeShape} ${styles.shape2}`} />
      <div className={`${styles.decorativeShape} ${styles.shape3}`} />
      <div className={`${styles.decorativeShape} ${styles.shape4}`} />

      {/* Contenido principal */}
      <div className={styles.mainContainer}>
        {/* Texto */}
        <div className={styles.textContainer}>
          <h1 className={styles.title}>{title}</h1>

          <h4 className={styles.subtitle}>{subtitle}</h4>

          <p className={styles.description}>{description}</p>

          {/* Mini-cajas con iconos */}
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