import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRecursos, incrementarVisitas } from '../../../services/informationalResourcesService';


// Función para obtener el icono según el tipo de recurso
const getResourceIcon = (tipo) => {
  const iconMap = {
    'articulo': 'bi-file-text',
    'guia': 'bi-book',
    'manual': 'bi-journal-bookmark',
    'video': 'bi-play-circle',
    'infografia': 'bi-image',
  };
  return iconMap[tipo] || 'bi-file-earmark';
};

// Función para obtener el color según el tipo de recurso
const getResourceColor = (tipo) => {
  const colorMap = {
    'articulo': '#3498db',
    'guia': '#2ecc71',
    'manual': '#9b59b6',
    'video': '#e74c3c',
    'infografia': '#f39c12',
  };
  return colorMap[tipo] || '#5A4E7C';
};

export default function ResourcesSection({ selectedTopic, batchSize = 6 }) {
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
          limite: 50, // Cargamos más recursos inicialmente
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
        : resources.filter((resource) => 
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
        { length: Math.min(batchSize, displayedResources.length - (visibleCount - batchSize)) },
        (_, i) => visibleCount - batchSize + i
      );
      setAnimateIndexes(newIndexes);

      const timer = setTimeout(() => setAnimateIndexes([]), 600);
      return () => clearTimeout(timer);
    }
  }, [displayedResources, visibleCount, filteredResources.length, batchSize]);

  // Actualizar showLoadMore correctamente
  useEffect(() => {
    setShowLoadMore(visibleCount < filteredResources.length);
  }, [visibleCount, filteredResources.length]);

  const handleLoadMore = () => setVisibleCount((prev) => prev + batchSize);

  const handleResourceClick = async (resourceId) => {
    try {
      // Incrementar visitas antes de navegar
      await incrementarVisitas(resourceId);
      navigate(`/recurso/${resourceId}`);
    } catch (error) {
      console.error('Error al incrementar visitas:', error);
      // Navegar de todas formas
      navigate(`/recurso/${resourceId}`);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="row g-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="col-lg-4 col-md-6">
              <div
                className="card h-100"
                style={{
                  borderRadius: '1rem',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                <div
                  className="placeholder-glow"
                  style={{
                    height: '200px',
                    background: '#f8f9fa',
                    borderRadius: '1rem 1rem 0 0',
                  }}
                >
                  <div className="placeholder w-100 h-100"></div>
                </div>
                <div className="card-body p-3">
                  <div className="placeholder-glow">
                    <div className="placeholder w-75 mb-2"></div>
                    <div className="placeholder w-100 mb-2"></div>
                    <div className="placeholder w-50"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (displayedResources.length === 0) {
    return (
      <div className="container text-center py-5">
        <div
          className="mx-auto mb-4"
          style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #E8DAEF, #D5DBDB)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <i
            className="bi bi-search"
            style={{
              fontSize: '2rem',
              color: '#8E7AA6',
            }}
          ></i>
        </div>
        <h4
          className="fw-bold mb-3"
          style={{
            color: '#5A4E7C',
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          No se encontraron recursos
        </h4>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          {selectedTopic
            ? `No hay recursos disponibles para el tópico "${selectedTopic}"`
            : 'No hay recursos disponibles en este momento'}
        </p>
        {selectedTopic && (
          <button
            onClick={() => window.location.reload()}
            className="btn btn-outline-primary mt-3"
            style={{
              borderColor: '#A17CCA',
              color: '#A17CCA',
              borderRadius: '25px',
              padding: '10px 25px',
            }}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Recargar recursos
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row g-4">
        {displayedResources.map((resource, index) => {
          const isAnimating = animateIndexes.includes(index);
          const resourceColor = getResourceColor(resource.tipo);
          const resourceIcon = getResourceIcon(resource.tipo);
          
          return (
            <div
              key={resource._id}
              className={`col-lg-4 col-md-6 ${isAnimating ? 'animate__animated animate__fadeInUp' : ''}`}
              style={{
                animationDelay: isAnimating ? `${(index % batchSize) * 100}ms` : '0ms',
              }}
            >
              <div
                className="card h-100 resource-card"
                style={{
                  borderRadius: '1rem',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
                onClick={() => handleResourceClick(resource._id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
              >
                {/* Imagen principal */}
                <div
                  className="position-relative"
                  style={{
                    height: '200px',
                    background: resource.imagenPrincipal
                      ? `url(${resource.imagenPrincipal}) center/cover`
                      : `linear-gradient(135deg, ${resourceColor}15, ${resourceColor}25)`,
                    borderRadius: '1rem 1rem 0 0',
                  }}
                >
                  {/* Badge de tipo */}
                  <div
                    className="position-absolute top-0 start-0 m-3 px-3 py-1"
                    style={{
                      background: resourceColor,
                      color: 'white',
                      borderRadius: '15px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    }}
                  >
                    <i className={`${resourceIcon} me-1`}></i>
                    {resource.tipo}
                  </div>

                  {/* Badge destacado */}
                  {resource.destacado && (
                    <div
                      className="position-absolute top-0 end-0 m-3"
                      style={{
                        background: '#FFD700',
                        color: '#333',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <i className="bi bi-star-fill" style={{ fontSize: '0.8rem' }}></i>
                    </div>
                  )}

                  {/* Overlay para recursos sin imagen */}
                  {!resource.imagenPrincipal && (
                    <div
                      className="position-absolute top-50 start-50 translate-middle"
                    >
                      <i
                        className={resourceIcon}
                        style={{
                          fontSize: '3rem',
                          color: resourceColor,
                          opacity: '0.3',
                        }}
                      ></i>
                    </div>
                  )}
                </div>

                <div className="card-body p-4">
                  {/* Título */}
                  <h5
                    className="card-title fw-bold mb-2"
                    style={{
                      color: '#2c3e50',
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '1.1rem',
                      lineHeight: '1.3',
                      height: '2.6em',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {resource.titulo}
                  </h5>

                  {/* Descripción */}
                  <p
                    className="card-text text-muted mb-3"
                    style={{
                      fontSize: '0.9rem',
                      lineHeight: '1.4',
                      height: '4.2em',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: '3',
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {resource.resumen || resource.descripcion}
                  </p>

                  {/* Tópicos */}
                  {resource.topicos && resource.topicos.length > 0 && (
                    <div className="mb-3">
                      <div className="d-flex flex-wrap gap-1">
                        {resource.topicos.slice(0, 2).map((topico, idx) => (
                          <span
                            key={idx}
                            className="badge"
                            style={{
                              background: `${resourceColor}20`,
                              color: resourceColor,
                              fontSize: '0.7rem',
                              fontWeight: '500',
                              padding: '4px 8px',
                              borderRadius: '8px',
                            }}
                          >
                            {topico}
                          </span>
                        ))}
                        {resource.topicos.length > 2 && (
                          <span
                            className="badge"
                            style={{
                              background: '#f8f9fa',
                              color: '#666',
                              fontSize: '0.7rem',
                              fontWeight: '500',
                              padding: '4px 8px',
                              borderRadius: '8px',
                            }}
                          >
                            +{resource.topicos.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer con estadísticas */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-3">
                      <small className="text-muted d-flex align-items-center">
                        <i className="bi bi-eye me-1"></i>
                        {resource.visitas || 0}
                      </small>
                      {resource.calificacion && resource.calificacion.promedio > 0 && (
                        <small className="text-warning d-flex align-items-center">
                          <i className="bi bi-star-fill me-1"></i>
                          {resource.calificacion.promedio.toFixed(1)}
                        </small>
                      )}
                    </div>
                    <div
                      className="text-end"
                      style={{
                        color: resourceColor,
                        fontSize: '0.9rem',
                        fontWeight: '600',
                      }}
                    >
                      Ver recurso
                      <i className="bi bi-arrow-right ms-1"></i>
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
        <div className="text-center mt-5">
          <button
            onClick={handleLoadMore}
            className="btn btn-lg fw-semibold px-5 py-3"
            style={{
              background: 'linear-gradient(90deg, #5A4E7C, #A17CCA)',
              border: 'none',
              borderRadius: '25px',
              color: 'white',
              fontSize: '1rem',
              fontFamily: "'Poppins', sans-serif",
              boxShadow: '0 4px 15px rgba(90, 78, 124, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(90, 78, 124, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(90, 78, 124, 0.3)';
            }}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Cargar más recursos
          </button>
        </div>
      )}
    </div>
  );
}