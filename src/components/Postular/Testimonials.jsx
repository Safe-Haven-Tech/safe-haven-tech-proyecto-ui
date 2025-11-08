import React from 'react';
import styles from '../../pages/profesionals/Postulacion.module.css';

const testimonials = [
  {
    id: 1,
    quote:
      'Gracias a SafeHaven pude conectar con personas que necesitaban apoyo especializado. Recomiendo el proceso de postulación.',
    author: 'María R., Psicóloga',
  },
  {
    id: 2,
    quote:
      'El equipo fue muy profesional en la revisión. La visibilidad que obtuve en la plataforma aumentó mi alcance profesional.',
    author: 'Carlos T., Terapeuta familiar',
  },
  {
    id: 3,
    quote:
      'Proceso claro y humano. Me sentí respaldada durante la revisión de mi postulación.',
    author: 'Ana P., Psicoterapeuta',
  },
];

export default function Testimonials() {
  return (
    <section className={styles.testimonials} aria-label="Testimonios">
      <h4 className={styles.sectionTitle} style={{ marginTop: 0 }}>
        Testimonios
      </h4>
      <div className={styles.testimonialsList}>
        {testimonials.map((t) => (
          <article key={t.id} className={styles.testimonialCard}>
            <p className={styles.testimonialText}>"{t.quote}"</p>
            <div className={styles.testimonialMeta}>
              <div className={styles.testimonialAvatar} aria-hidden>
                👤
              </div>
              <span className={styles.testimonialAuthor}>{t.author}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
