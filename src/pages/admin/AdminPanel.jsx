/* filepath: f:\SafeHaven\safe-haven-tech-proyecto-ui\src\pages\admin\AdminPanel.jsx */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import styles from './AdminPanel.module.css';

const AdminPanel = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();


  // Verificar que el usuario sea administrador
  useEffect(() => {
    if (!usuario) {
      navigate('/login');
      return;
    }
    
    if (usuario.rol !== 'administrador') {
      navigate('/'); // Redirigir si no es admin
      return;
    }
  }, [usuario, navigate]);



  // Funciones de navegación (placeholders)
  const handleNavigation = (section) => {
    console.log(`Navegando a: ${section}`);
    // navigate(`/admin/${section}`);
  };

  if (!usuario || usuario.rol !== 'administrador') {
    return null; // O un loading spinner
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
              Gestiona usuarios, contenido y configuraciones desde este panel centralizado.
            </p>
          </div>

        </div>
      </header>


      {/* Funcionalidades Principales */}
      <section className={styles.functionsSection}>
        <h2 className={styles.sectionTitle}> Funcionalidades</h2>

      </section>

      {/* Acciones Rápidas */}
      <section className={styles.quickActionsSection}>
        <h2 className={styles.sectionTitle}>Acciones Rápidas</h2>

      </section>

    </div>
  );
};

export default AdminPanel;