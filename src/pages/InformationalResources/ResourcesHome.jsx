import React, { useState, Suspense } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './ResourcesHome.module.css';
import WelcomeCard from '../../components/RecursosInformativos/Home/WelcomeCard';
import BenefitsSection from '../../components/RecursosInformativos/Home/BenefitsSection';
import TopicsFilter from '../../components/RecursosInformativos/Home/TopicsFilter';
import ResourcesSection from '../../components/RecursosInformativos/Home/ResourcesSection';

export default function InformationalResourcesHome() {
  const [selectedTopic, setSelectedTopic] = useState(null);

  const LoadingFallback = ({ text = 'Cargando...' }) => (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
      {text}
    </div>
  );

  const ErrorFallback = ({ error, title = 'Error al cargar' }) => (
    <div className={styles.errorContainer}>
      <div className={styles.errorTitle}>{title}</div>
      <div className={styles.errorMessage}>
        {error?.message || 'Hubo un problema al cargar este contenido'}
      </div>
    </div>
  );

  return (
    <div className={styles.resourcesHome}>
      <div className={styles.navbarSpacer}>
        {/* Welcome Card */}
        <div className={styles.welcomeContainer}>
          <Suspense
            fallback={<LoadingFallback text="Cargando bienvenida..." />}
          >
            <WelcomeCard
              title="¡Bienvenido a los recursos informativos!"
              subtitle="Accede a información confiable y recursos educativos para tu bienestar."
              description="Explora artículos, guías, manuales y contenido multimedia especializado que te ayudará a comprender mejor temas de salud mental, bienestar emocional y autocuidado."
              fullWidth
            />
          </Suspense>
        </div>

        {/* Contenedor principal */}
        <div className={`container ${styles.mainContainer}`}>
          <div className={styles.benefitsSection}>
            <Suspense
              fallback={<LoadingFallback text="Cargando beneficios..." />}
            >
              <BenefitsSection />
            </Suspense>
          </div>

          <hr className={styles.sectionDivider} aria-hidden="true" />

          <div className={styles.topicsSection}>
            <Suspense fallback={<LoadingFallback text="Cargando filtros..." />}>
              <TopicsFilter
                onSelect={setSelectedTopic}
                selectedTopic={selectedTopic}
              />
            </Suspense>
          </div>

          {/* Separador visual */}
          <hr className={styles.sectionDivider} aria-hidden="true" />

          {/* Sección de recursos */}
          <div className={styles.resourcesSection}>
            <h3 className={styles.resourcesTitle}>Recursos disponibles</h3>

            <div className={styles.section}>
              <Suspense
                fallback={<LoadingFallback text="Cargando recursos..." />}
              >
                <ResourcesSection
                  selectedTopic={selectedTopic}
                  onTopicChange={setSelectedTopic}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
