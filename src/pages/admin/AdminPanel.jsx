import React, { useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import styles from './AdminPanel.module.css';

const AdminPanel = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario) {
      navigate('/login');
      return;
    }
    if (usuario.rol !== 'administrador') {
      navigate('/');
      return;
    }
  }, [usuario, navigate]);

  const handleNavigation = (section) => {
    navigate(`/admin/${section}`);
  };

  if (!usuario || usuario.rol !== 'administrador') {
    return null;
  }

  return (
    <div className={styles.adminContainer}>
      {/* Header de Bienvenida */}
      <header className={styles.welcomeHeader}>
        <div className={styles.welcomeContent}>
          <div className={styles.welcomeText}>
            <h1 className={styles.welcomeTitle}>
              ¡Bienvenido, {usuario.nombreCompleto || usuario.nombreUsuario}!
            </h1>
            <p className={styles.welcomeSubtitle}>
              Panel de Administración de SafeHaven
            </p>
            <p className={styles.welcomeDescription}>
              Gestiona usuarios, contenido y configuraciones desde este panel
              centralizado.
            </p>
          </div>
        </div>
      </header>

      {/* Funcionalidades Principales */}
      <section className={styles.functionsSection}>
        <h2 className={styles.sectionTitle}>Funcionalidades</h2>
        <div className={styles.functionsGrid}>
          {/* Gestión de Recursos Informativos */}
          <div
            className={`${styles.functionCard} ${styles.functionCardLight}`}
            onClick={() => handleNavigation('recursos-informativos')}
            aria-label="Gestión de Recursos Informativos"
            role="button"
            tabIndex={0}
          >
            <div className={styles.functionContent}>
              <h3 className={styles.functionTitle}>
                Gestión de Recursos Informativos
              </h3>
              <p className={styles.functionDescription}>
                Administra y gestiona todos los recursos informativos de la
                plataforma.
              </p>
            </div>
            <div className={styles.functionArrow}>→</div>
          </div>
          {/* Gestión de encuestas de autoevaluacion */}
          <div
            className={`${styles.functionCard} ${styles.functionCardLight}`}
            onClick={() => handleNavigation('encuestas')}
            aria-label="Gestión de encuestas de autoevaluación"
            role="button"
            tabIndex={0}
          >
            <div className={styles.functionContent}>
              <h3 className={styles.functionTitle}>
                Gestión de encuestas de autoevaluación
              </h3>
              <p className={styles.functionDescription}>
                Administra y gestiona todas las encuestas de la plataforma.
              </p>
            </div>
            <div className={styles.functionArrow}>→</div>
          </div>

          {/* Gestión de Recursos Usuarios */}
          <div
            className={`${styles.functionCard} ${styles.functionCardLight}`}
            onClick={() => handleNavigation('usuarios')}
            aria-label="Gestión de Usuarios"
            role="button"
            tabIndex={0}
          >
            <div className={styles.functionContent}>
              <h3 className={styles.functionTitle}>Gestión de Usuarios</h3>
              <p className={styles.functionDescription}>
                Administra y gestiona todos los usuarios de la plataforma.
              </p>
            </div>
            <div className={styles.functionArrow}>→</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;
