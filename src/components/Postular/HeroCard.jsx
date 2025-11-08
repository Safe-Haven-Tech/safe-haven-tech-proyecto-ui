import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../pages/profesionals/Postulacion.module.css';
//import Illo from './DecorativeSVGs';

export default function HeroCard({ onStart }) {
  const { usuario } = useAuth();

  const displayName = usuario?.nombreCompleto
    ? String(usuario.nombreCompleto).split(' ')[0]
    : usuario?.nombreUsuario || 'Bienvenido';

  const handleCTAClick = () => {
    if (typeof onStart === 'function') return onStart();
    const target =
      document.getElementById('postulacion-form') ||
      document.querySelector('form');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section className={styles.hero} aria-hidden={false}>
      <div
        style={{
          display: 'flex',
          gap: 20,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 260 }}>
          <h1 className={styles.title}>
            {usuario
              ? `Hola, ${displayName}`
              : 'Postúlate para nuestro listado de profesionales'}
          </h1>
          <p className={styles.lead}>
            Comparte tu formación y experiencia para que las personas que han
            sufrido violencia reciban atención segura y profesional. Completa el
            formulario y nuestro equipo revisará tu postulación.
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button className={styles.btnPrimary} onClick={handleCTAClick}>
              Completar postulación
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
