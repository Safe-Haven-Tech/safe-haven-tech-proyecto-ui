import React, { useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import styles from './AdminPanel.module.css';

const StatCard = ({ icon, number, label, loading = false }) => (
  <div className={styles.statCard} role="article" aria-label={label}>
    <div className={styles.statIcon} aria-hidden="true">
      {icon}
    </div>
    <div className={styles.statContent}>
      <div className={styles.statNumber}>
        {loading ? 'Cargando...' : number}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  </div>
);

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
              ¡Hola, {usuario.nombreCompleto || usuario.nombreUsuario}!
            </h1>
            <p className={styles.welcomeSubtitle}>Panel de administración</p>
            <p className={styles.welcomeDescription}>
              En este panel puedes gestionar contenido y atender reportes. Las
              acciones que realices aquí afectan a toda la comunidad.
            </p>
          </div>
        </div>
      </header>

      {/* Funcionalidades Principales */}
      <section
        className={styles.functionsSection}
        aria-labelledby="functions-title"
      >
        <h2 id="functions-title" className={styles.sectionTitle}>
          Acciones principales
        </h2>

        <div className={styles.functionsGrid}>
          <button
            type="button"
            className={`${styles.functionCard} ${styles.functionCardLight}`}
            onClick={() => handleNavigation('recursos-informativos')}
            aria-label="Gestión de Recursos Informativos"
            title="Gestión de Recursos Informativos"
          >
            <div className={styles.functionContent}>
              <h3 className={styles.functionTitle}>Recursos informativos</h3>
              <p className={styles.functionDescription}>
                Crear, editar y validar guías y artículos para la comunidad.
              </p>
            </div>
            <div className={styles.functionArrow}>→</div>
          </button>

          <button
            type="button"
            className={`${styles.functionCard} ${styles.functionCardLight}`}
            onClick={() => handleNavigation('encuestas')}
            aria-label="Gestión de encuestas de autoevaluación"
            title="Gestión de encuestas de autoevaluación"
          >
            <div className={styles.functionContent}>
              <h3 className={styles.functionTitle}>
                Encuestas y autoevaluación
              </h3>
              <p className={styles.functionDescription}>
                Diseña y publica cuestionarios para evaluar el bienestar de los
                usuarios.
              </p>
            </div>
            <div className={styles.functionArrow}>→</div>
          </button>

          <button
            type="button"
            className={`${styles.functionCard} ${styles.functionCardLight}`}
            onClick={() => handleNavigation('usuarios')}
            aria-label="Gestión de Usuarios"
            title="Gestión de Usuarios"
          >
            <div className={styles.functionContent}>
              <h3 className={styles.functionTitle}>Usuarios</h3>
              <p className={styles.functionDescription}>
                Buscar, moderar y actualizar perfiles y permisos del equipo.
              </p>
            </div>
            <div className={styles.functionArrow}>→</div>
          </button>

          <button
            type="button"
            className={`${styles.functionCard} ${styles.functionCardLight}`}
            onClick={() => handleNavigation('reportes')}
            aria-label="Gestión de Reportes y Denuncias"
            title="Gestión de Reportes y Denuncias"
          >
            <div className={styles.functionContent}>
              <h3 className={styles.functionTitle}>Reportes y denuncias</h3>
              <p className={styles.functionDescription}>
                Revisa y resuelve contenidos o conductas reportadas por la
                comunidad.
              </p>
            </div>
            <div className={styles.functionArrow}>→</div>
          </button>

          <button
            type="button"
            className={`${styles.functionCard} ${styles.functionCardLight}`}
            onClick={() => handleNavigation('postulaciones')}
            aria-label="Gestión de postulaciones profesionales"
            title="Gestión de postulaciones profesionales"
          >
            <div className={styles.functionContent}>
              <h3 className={styles.functionTitle}>
                Postulaciones profesionales
              </h3>
              <p className={styles.functionDescription}>
                Revisa solicitudes de profesionales que desean ofrecer
                servicios.
              </p>
            </div>
            <div className={styles.functionArrow}>→</div>
          </button>
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;
