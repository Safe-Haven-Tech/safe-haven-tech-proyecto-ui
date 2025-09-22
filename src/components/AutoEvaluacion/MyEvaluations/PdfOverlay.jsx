import React from 'react';
import styles from './PdfOverlay.module.css';

const PdfOverlay = () => (
  <div 
    className={styles.overlay}
    role="dialog"
    aria-modal="true"
    aria-labelledby="pdf-loading-text"
    tabIndex={-1}
  >
    <div className={styles.content}>
      {/* Spinner personalizado */}
      <div 
        className={styles.spinner}
        role="status"
        aria-hidden="true"
      />
      
      {/* Texto de carga */}
      <p 
        className={styles.loadingText}
        id="pdf-loading-text"
      >
        Generando PDF...
      </p>
      
      {/* Puntos de carga animados */}
      <div className={styles.dots} aria-hidden="true">
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
      
      {/* Texto oculto para lectores de pantalla */}
      <span className="visually-hidden">
        Por favor espere mientras se genera su PDF. Este proceso puede tomar unos momentos.
      </span>
    </div>
  </div>
);

export default PdfOverlay;