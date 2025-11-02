import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './WelcomeCard.module.css';


// Importamos los SVGs como imágenes normales
import LightningIcon from '../../assets/icons/Lightning.svg';
import BookIcon from '../../assets/icons/Book.svg';
import LockIcon from '../../assets/icons/Lock.svg';

export default function WelcomeCard({
  title,
  subtitle,
  description,
  fullWidth = false,
}) {
  const miniBoxes = [
    {
      icon: LightningIcon,
      title: 'Profesionales verificados',
      description: 'Perfiles revisados con formación y experiencia en violencia en relaciones afectivas.',
    },
    {
      icon: BookIcon,
      title: 'Derivaciones y recursos',
      description: 'Acceso a redes legales, sociales y servicios complementarios para acompañamiento integral.',
    },
    {
      icon: LockIcon,
      title: 'Confidencialidad y seguridad',
      description: 'Comunicación y datos protegidos; opciones para contacto seguro y manejo privado de información.',
    },
  ];

  return (
    <div
      className={`card shadow-lg ${styles.welcomeCard} ${
        fullWidth ? styles.welcomeCardFullWidth : ''
      }`}
      style={{
        
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

        {/* Área derecha: invitación a profesionales (reemplaza la imagen) */}
        <div className={styles.imageSpace} aria-hidden={false}>
          <div className={styles.applyCard} role="region" aria-label="Invitación a profesionales">
            <h3 className={styles.applyTitle}>¿Eres profesional? Únete a nuestra comunidad</h3>
            <p className={styles.applyText}>
              Si trabajas en apoyo a personas que han vivido violencia en relaciones afectivas,
              puedes postular para formar parte de nuestro directorio verificado.
            </p>
            <div className={styles.applyActions}>
              <a href="/postular" className={styles.applyButton}>Postular ahora</a>
           
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}