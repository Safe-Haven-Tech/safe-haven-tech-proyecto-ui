import React from 'react';
import styles from './BenefitsSection.module.css';

const IconSupport = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" aria-hidden>
    <path d="M12 2a7 7 0 00-7 7v3a7 7 0 007 7 7 7 0 007-7V9a7 7 0 00-7-7z" fill="#efe6fb"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#6b5fa5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconReferral = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" aria-hidden>
    <rect x="3" y="6" width="18" height="12" rx="2" fill="#f7f3ff"/>
    <path d="M8 10h8M8 14h5" stroke="#a17cca" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" aria-hidden>
    <path d="M12 3l7 3v5c0 4-2.5 7-7 9-4.5-2-7-5-7-9V6l7-3z" fill="#f0ecfb"/>
    <path d="M12 8v4" stroke="#5a4e7c" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" fill="#fbf7ff"/>
    <path d="M12 7v5l3 1" stroke="#8e7aa6" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const items = [
  {
    icon: <IconSupport />,
    title: 'Acompañamiento especializado',
    description:
      'Profesionales formados en atención a personas que han sufrido violencia en relaciones afectivas.',
  },
  {
    icon: <IconReferral />,
    title: 'Derivaciones seguras',
    description: 'Acceso a redes y servicios complementarios (legal, social, protección).',
  },
  {
    icon: <IconShield />,
    title: 'Confidencialidad priorizada',
    description: 'Información y contacto manejados con criterios de seguridad y privacidad.',
  },
  {
    icon: <IconClock />,
    title: 'Disponibilidad flexible',
    description: 'Modalidades presencial y online; horarios adaptables según necesidad.',
  },
];

export default function BenefitsSection() {
  return (
    <section className={`container ${styles.benefitsSection}`} aria-labelledby="professionals-benefits-title">
      <h2 id="professionals-benefits-title" className={styles.sectionTitle}>
        ¿Por qué elegir a estos profesionales?
      </h2>

      <p className={styles.sectionSubtitle}>
        Encuentra apoyo con enfoque en seguridad emocional y medidas prácticas para tu bienestar.
      </p>

      <div className={styles.benefitsGrid}>
        {items.map((item, idx) => (
          <div key={idx} className={`card ${styles.benefitCard}`} role="article" aria-label={item.title}>
            <div className={styles.iconWrapper}>{item.icon}</div>
            <h5 className={styles.benefitTitle}>{item.title}</h5>
            <p className={styles.benefitDescription}>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}