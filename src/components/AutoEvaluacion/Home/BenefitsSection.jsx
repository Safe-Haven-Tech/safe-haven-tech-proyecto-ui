import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './BenefitsSection.module.css';

import BookIcon from '../../../assets/icons/Book.svg?react';
import UsersIcon from '../../../assets/icons/Users.svg?react';
import GrowthIcon from '../../../assets/icons/Growth.svg?react';
import AlertIcon from '../../../assets/icons/Alert.svg?react';

const items = [
  {
    icon: <BookIcon />,
    title: 'Conócete mejor',
    description:
      'Reflexiona sobre tus emociones y cómo manejas situaciones cotidianas.',
  },
  {
    icon: <UsersIcon />,
    title: 'Evalúa tus vínculos',
    description: 'Comprende mejor la dinámica con las personas cercanas a ti.',
  },
  {
    icon: <GrowthIcon />,
    title: 'Identifica oportunidades',
    description: 'Encuentra pequeños pasos para fortalecer tu bienestar.',
  },
  {
    icon: <AlertIcon />,
    title: 'Nota importante',
    description:
      'Esto no sustituye la ayuda profesional, pero puede orientarte a dar el siguiente paso.',
  },
];

export default function BenefitsSection() {
  return (
    <section className={`container text-center ${styles.benefitsSection}`}>
      <h2 className={styles.sectionTitle}>
        Lo que descubrirás con tu autoevaluación
      </h2>

      <p className={styles.sectionSubtitle}>
        Responde preguntas sencillas para reflexionar sobre tu bienestar y tus
        relaciones.
      </p>

      <div className={styles.benefitsGrid}>
        {items.map((item, idx) => (
          <div key={idx} className={`card ${styles.benefitCard}`}>
            <div className={styles.iconWrapper}>{item.icon}</div>
            <h5 className={styles.benefitTitle}>{item.title}</h5>
            <p className={styles.benefitDescription}>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
