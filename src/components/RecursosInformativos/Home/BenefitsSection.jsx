/* filepath: f:\SafeHaven\safe-haven-tech-proyecto-ui\src\components\RecursosInformativos\Home\BenefitsSection.jsx */
import React from 'react';
import styles from './BenefitsSection.module.css';

// Iconos SVG personalizados (ajusta la importación según tu setup)
import BookIcon from '../../../assets/icons/Book.svg?react';
import SearchIcon from '../../../assets/icons/Search.svg?react';
import TrustedIcon from '../../../assets/icons/Trusted.svg?react';
import AlertIcon from '../../../assets/icons/Alert.svg?react';

const items = [
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

export default function BenefitsSection() {
  return (
    // 🎯 REMOVIDO: container text-center y clases Bootstrap
    <section className={styles.benefitsSection}>
      <h2 className={styles.sectionTitle}>
        ¿Por qué elegir nuestros recursos informativos?
      </h2>

      <p className={styles.sectionSubtitle}>
        Accede a información curada y herramientas diseñadas para apoyar tu
        bienestar mental.
      </p>

      <div className={styles.benefitsGrid}>
        {items.map((item, idx) => (
          // 🎯 REMOVIDO: clase "card" de Bootstrap
          <div key={idx} className={styles.benefitCard}>
            <div className={styles.iconWrapper}>{item.icon}</div>
            <h5 className={styles.benefitTitle}>{item.title}</h5>
            <p className={styles.benefitDescription}>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
