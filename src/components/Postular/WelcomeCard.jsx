import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../pages/profesionals/Postulacion.module.css';
import avatarPlaceholder from '../../assets/perfil_placeholder.png';

export default function WelcomeCard({ onStart }) {
  const { usuario } = useAuth();

  const handleStart = () => {
    if (typeof onStart === 'function') return onStart();
    const el =
      document.getElementById('postulacion-form') ||
      document.querySelector('form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // focus the first input if available
      const firstInput = el.querySelector('input, textarea, select, button');
      if (firstInput) firstInput.focus();
    }
  };

  const displayName = usuario?.nombreCompleto
    ? String(usuario.nombreCompleto).split(' ')[0]
    : usuario?.nombreUsuario || null;

  return (
    <aside className={styles.welcomeCard} aria-labelledby="welcome-title">
      <div className={styles.welcomeInner}>
        <img
          src={usuario?.fotoPerfil || avatarPlaceholder}
          alt={
            usuario
              ? usuario.nombreCompleto || usuario.nombreUsuario
              : 'Avatar usuario'
          }
          className={styles.welcomeAvatar}
        />
        <div className={styles.welcomeText}>
          <h3 id="welcome-title" className={styles.welcomeTitle}>
            {displayName ? `Hola, ${displayName}` : 'Bienvenido'}
          </h3>
          <p className={styles.welcomeDesc}>
            Gracias por querer formar parte del listado de profesionales de
            SafeHaven. Completa este formulario con honestidad—tu información
            será revisada por nuestro equipo.
          </p>
          <div style={{ marginTop: 12 }}>
            <button className={styles.btnPrimary} onClick={handleStart}>
              Completar postulación
            </button>
          </div>
        </div>
      </div>

      <div className={styles.welcomeFooter}>
        <small className={styles.confidentialNote}>
          Tus datos serán tratados con confidencialidad. Tiempo estimado de
          revisión: 3–5 días hábiles.
        </small>
      </div>
    </aside>
  );
}
