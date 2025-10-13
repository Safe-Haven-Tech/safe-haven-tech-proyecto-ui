/* filepath: f:\SafeHaven\safe-haven-tech-proyecto-ui\src\components\RecursosInformativos\Home\ResourcesSection.jsx */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './ResourcesSection.module.css';
import {
  fetchRecursos,
  incrementarVisitas,
} from '../../../services/informationalResourcesService';

// Función para obtener el icono según el tipo de recurso
const getResourceIcon = (tipo) => {
  const iconMap = {
    articulo: 'bi-file-text',
    guia: 'bi-book',
    manual: 'bi-journal-bookmark',
    video: 'bi-play-circle',
    infografia: 'bi-image',
  };
  return iconMap[tipo] || 'bi-file-earmark';
};

// Función para obtener la clase de color según el tipo de recurso
const getResourceColorClass = (tipo) => {
  const colorClassMap = {
    articulo: styles.colorArticulo,
    guia: styles.colorGuia,
    manual: styles.colorManual,
    video: styles.colorVideo,
    infografia: styles.colorInfografia,
  };
  return colorClassMap[tipo] || styles.colorDefault;
};

export default function ResourcesSection({ selectedTopic, batchSize = 9 }) {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const [animateIndexes, setAnimateIndexes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoadMore, setShowLoadMore] = useState(true);

  // Cargar recursos
  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        const response = await fetchRecursos({
          limite: 50,
          ordenarPor: 'fechaCreacion',
        });
        setResources(response.recursos || []);
      } catch (error) {
        console.error('Error al cargar recursos:', error);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  // Filtrado por tópico
  const filteredResources = useMemo(
    () =>
      !selectedTopic || selectedTopic === 'Todos'
        ? resources
        : resources.filter(
            (resource) =>
              resource.topicos && resource.topicos.includes(selectedTopic)
          ),
    [resources, selectedTopic]
  );

  // Mostrar visible
  const displayedResources = useMemo(
    () => filteredResources.slice(0, visibleCount),
    [filteredResources, visibleCount]
  );

  // Resetear al cambiar tópico
  useEffect(() => {
    setVisibleCount(batchSize);
    setAnimateIndexes([]);
  }, [selectedTopic, filteredResources, batchSize]);

  // Animación al cargar más
  useEffect(() => {
    if (visibleCount > batchSize && displayedResources.length > 0) {
      const newIndexes = Array.from(
        {
          length: Math.min(
            batchSize,
            displayedResources.length - (visibleCount - batchSize)
          ),
        },
        (_, i) => visibleCount - batchSize + i
      );
      setAnimateIndexes(newIndexes);

      const timer = setTimeout(() => setAnimateIndexes([]), 600);
      return () => clearTimeout(timer);
    }
  }, [displayedResources, visibleCount, filteredResources.length, batchSize]);

  // Actualizar showLoadMore
  useEffect(() => {
    setShowLoadMore(visibleCount < filteredResources.length);
  }, [visibleCount, filteredResources.length]);

  const handleLoadMore = () => setVisibleCount((prev) => prev + batchSize);

  const handleResourceClick = async (resourceId) => {
    try {
      await incrementarVisitas(resourceId);
      navigate(`/recurso/${resourceId}`);
    } catch (error) {
      console.error('Error al incrementar visitas:', error);
      navigate(`/recurso/${resourceId}`);
    }
  };

  // Loading state - Mostrando 9 skeletons (3x3)
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.resourcesGrid}>
          {[...Array(9)].map((_, index) => (
            <div key={index} className={styles.resourceColumn}>
              <div className={`card h-100 ${styles.skeletonCard}`}>
                <div className={styles.skeletonImage}>
                  <div className="placeholder w-100 h-100"></div>
                </div>
                <div className={styles.skeletonBody}>
                  <div className="placeholder-glow">
                    <div
                      className={`${styles.skeletonLine} ${styles.wide}`}
                    ></div>
                    <div
                      className={`${styles.skeletonLine} ${styles.full}`}
                    ></div>
                    <div
                      className={`${styles.skeletonLine} ${styles.half}`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No resources state
  if (displayedResources.length === 0) {
    return (
      <div className={styles.noResourcesContainer}>
        <div className={styles.noResourcesIcon}>
          <i className="bi bi-search"></i>
        </div>
        <h4 className={styles.noResourcesTitle}>No se encontraron recursos</h4>
        <p className={styles.noResourcesText}>
          {selectedTopic
            ? `No hay recursos disponibles para el tópico "${selectedTopic}"`
            : 'No hay recursos disponibles en este momento'}
        </p>
        {selectedTopic && (
          <button
            onClick={() => window.location.reload()}
            className={`btn btn-outline-primary ${styles.reloadButton}`}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Recargar recursos
          </button>
        )}
      </div>
    );
  }

  // Main content - Grid personalizado sin Bootstrap
  return (
    <div className={styles.resourcesSection}>
      <div className={styles.resourcesGrid}>
        {displayedResources.map((resource, index) => {
          const isAnimating = animateIndexes.includes(index);
          const resourceColorClass = getResourceColorClass(resource.tipo);
          const resourceIcon = getResourceIcon(resource.tipo);

          return (
            <div
              key={resource._id}
              className={`${styles.resourceColumn} ${isAnimating ? styles.newResourceCard : ''}`}
              style={{
                animationDelay: isAnimating
                  ? `${(index % batchSize) * 100}ms`
                  : '0ms',
              }}
            >
              <div
                className={`card h-100 ${styles.resourceCard} ${resourceColorClass}`}
                onClick={() => handleResourceClick(resource._id)}
                role="button"
                tabIndex={0}
                aria-label={`Ver recurso: ${resource.titulo}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleResourceClick(resource._id);
                  }
                }}
              >
                {/* Imagen principal */}
                <div
                  className={`${styles.resourceImage} ${!resource.imagenPrincipal ? styles.resourceImageGradient : ''}`}
                  style={
                    resource.imagenPrincipal
                      ? {
                          backgroundImage: `url(${resource.imagenPrincipal})`,
                        }
                      : {}
                  }
                >
                  {/* Badge de tipo */}
                  <div className={styles.typeBadge}>
                    <i className={resourceIcon}></i>
                    {resource.tipo}
                  </div>

                  {/* Badge destacado */}
                  {resource.destacado && (
                    <div className={styles.featuredBadge}>
                      <i className="bi bi-star-fill"></i>
                    </div>
                  )}

                  {/* Overlay para recursos sin imagen */}
                  {!resource.imagenPrincipal && (
                    <div className={styles.resourceOverlayIcon}>
                      <i className={resourceIcon}></i>
                    </div>
                  )}
                </div>

                <div className={`card-body ${styles.cardBody}`}>
                  {/* Título */}
                  <h5 className={styles.resourceTitle}>{resource.titulo}</h5>

                  {/* Descripción */}
                  <p className={styles.resourceDescription}>
                    {resource.resumen || resource.descripcion}
                  </p>

                  {/* Tópicos */}
                  {resource.topicos && resource.topicos.length > 0 && (
                    <div className={styles.topicsContainer}>
                      {resource.topicos.slice(0, 2).map((topico, idx) => (
                        <span key={idx} className={styles.topicBadge}>
                          {topico}
                        </span>
                      ))}
                      {resource.topicos.length > 2 && (
                        <span className={styles.topicBadgeExtra}>
                          +{resource.topicos.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer con estadísticas */}
                  <div className={styles.cardFooter}>
                    <div className={styles.statsContainer}>
                      <small className={styles.statItem}>
                        <i className="bi bi-eye"></i>
                        {resource.visitas || 0}
                      </small>
                      {resource.calificacion &&
                        resource.calificacion.promedio > 0 && (
                          <small className={styles.ratingItem}>
                            <i className="bi bi-star-fill"></i>
                            {resource.calificacion.promedio.toFixed(1)}
                          </small>
                        )}
                    </div>
                    <div className={styles.viewLink}>
                      Ver recurso
                      <i className="bi bi-arrow-right"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón Cargar más */}
      {showLoadMore && (
        <div className={styles.loadMoreContainer}>
          <button
            onClick={handleLoadMore}
            className={`btn btn-lg ${styles.loadMoreButton}`}
            aria-label="Cargar más recursos disponibles"
          >
            <i className="bi bi-plus-circle me-2"></i>
            Cargar más recursos
          </button>
        </div>
      )}
    </div>
  );
}
