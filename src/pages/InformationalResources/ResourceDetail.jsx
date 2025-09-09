import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchRecursoById, incrementarCompartidos, incrementarVisitas, calificarRecurso } from '../../services/informationalResourcesService';
import { useAuth } from '../../hooks/useAuth';

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

export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, token } = useAuth();
  
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  
  // Estados para el modal de imagen
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [imageTitle, setImageTitle] = useState('');

  // Ref para controlar el incremento de visitas
  const visitaIncrementada = useRef(false);

  useEffect(() => {
    const loadResource = async () => {
      if (!id) {
        setError('ID del recurso no proporcionado');
        setLoading(false);
        return;
      }

      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        setError('ID del recurso tiene formato inválido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetchRecursoById(id);
        
        if (response.status !== 200 || !response.data) {
          setError(response.mensaje || 'Recurso no encontrado');
          setLoading(false);
          return;
        }

        setResource(response.data);

        // Si el usuario está autenticado, obtener su calificación actual
        if (usuario && response.data.calificacion && response.data.calificacion.votos) {
          const miCalificacion = response.data.calificacion.votos.find(
            voto => voto.usuario && voto.usuario._id === usuario.id
          );
          if (miCalificacion) {
            setUserRating(miCalificacion.calificacion);
          }
        }

        // Incrementar visitas solo una vez usando ref
        const visitaKey = `visita_${id}`;
        const yaVisitado = sessionStorage.getItem(visitaKey);
        
        if (!yaVisitado && !visitaIncrementada.current) {
          visitaIncrementada.current = true;
          
          try {
            await incrementarVisitas(id);
            sessionStorage.setItem(visitaKey, 'true');
            
            // Actualizar contador local
            setResource(prev => ({
              ...prev,
              visitas: (prev.visitas || 0) + 1
            }));
            
          } catch (visitasError) {
            console.error('Error al incrementar visitas:', visitasError);
            visitaIncrementada.current = false; // Resetear en caso de error
          }
        }

      } catch (error) {
        console.error('Error cargando recurso:', error);
        setError('Error al cargar el recurso');
      } finally {
        setLoading(false);
      }
    };

    loadResource();
  }, [id, usuario]);

  // Resetear flag cuando cambie el ID
  useEffect(() => {
    visitaIncrementada.current = false;
  }, [id]);

  const handleShare = async () => {
    try {
      const url = window.location.href;
      
      if (navigator.share) {
        await navigator.share({
          title: resource.titulo,
          text: resource.resumen,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Enlace copiado al portapapeles');
      }
      
      // Incrementar contador de compartidos (no bloquear si falla)
      incrementarCompartidos(id)
        .then(() => {
          // Actualizar el recurso para mostrar el nuevo contador
          setResource(prev => ({
            ...prev,
            compartidos: (prev.compartidos || 0) + 1
          }));
        })
        .catch(() => {
          // Silenciar errores de compartidos
        });
      
    } catch (error) {
      if (error.name !== 'AbortError') { 
        alert('Error al compartir. El enlace se ha copiado al portapapeles.');
        try {
          await navigator.clipboard.writeText(window.location.href);
        } catch (clipboardError) {
          console.error('Error al copiar al portapapeles:', clipboardError);
        }
      }
    }
  };

  const handleRating = async (rating) => {
    if (!usuario || !token) return;
    
    try {
      setSubmittingRating(true);
      await calificarRecurso(id, rating, token);
      setUserRating(rating);
      
      // Recargar el recurso para obtener la nueva calificación promedio
      const response = await fetchRecursoById(id);
      if (response.status === 200 && response.data) {
        setResource(response.data);
        // Mantener la calificación del usuario actualizada
        if (response.data.calificacion && response.data.calificacion.votos) {
          const miCalificacion = response.data.calificacion.votos.find(
            voto => voto.usuario && voto.usuario._id === usuario.id
          );
          if (miCalificacion) {
            setUserRating(miCalificacion.calificacion);
          }
        }
      }
    } catch (error) {
      alert('Error al enviar la calificación. Por favor, intenta de nuevo.');
      console.error('Error en handleRating:', error);
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleImageClick = (imageSrc, title = '') => {
    setSelectedImage(imageSrc);
    setImageTitle(title);
    setShowImageModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container py-5" style={{ marginTop: '80px' }}>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center py-5">
              <div
                className="spinner-border mb-3"
                style={{ color: '#A17CCA', width: '3rem', height: '3rem' }}
                role="status"
              >
                <span className="visually-hidden">Cargando recurso...</span>
              </div>
              <h4
                style={{
                  color: '#5A4E7C',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Cargando recurso...
              </h4>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="container py-5" style={{ marginTop: '80px' }}>
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
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
                className="bi bi-exclamation-triangle"
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
              Recurso no encontrado
            </h4>
            <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '2rem' }}>
              {error || 'El recurso que buscas no existe o ha sido eliminado.'}
            </p>
            <button
              onClick={() => navigate('/recursosInformativos')}
              className="btn btn-lg fw-semibold px-4 py-3"
              style={{
                background: 'linear-gradient(90deg, #5A4E7C, #A17CCA)',
                border: 'none',
                borderRadius: '25px',
                color: 'white',
                fontSize: '1rem',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Volver a recursos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const resourceColor = getResourceColor(resource.tipo);
  const resourceIcon = getResourceIcon(resource.tipo);

  return (
    <>
      <div className="container py-5" style={{ marginTop: '80px' }}>
        <div className="row">
          <div className="col-lg-8 mx-auto">
            {/* Botón de regreso */}
            <button
              onClick={() => navigate('/recursosInformativos')}
              className="btn btn-outline-secondary mb-4 d-flex align-items-center"
              style={{
                borderColor: '#A17CCA',
                color: '#A17CCA',
                borderRadius: '25px',
                padding: '8px 20px',
              }}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Volver a recursos
            </button>

            {/* Header del recurso */}
            <div
              className="card mb-4"
              style={{
                borderRadius: '1rem',
                border: 'none',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                overflow: 'hidden',
              }}
            >
              {/* Imagen principal */}
              {resource.imagenPrincipal && (
                <div
                  className="position-relative"
                  style={{
                    height: '300px',
                    background: `url(${resource.imagenPrincipal}) center/cover`,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleImageClick(resource.imagenPrincipal, resource.titulo)}
                >
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))',
                    }}
                  ></div>
                  
                  {/* Badge de tipo sobre la imagen */}
                  <div
                    className="position-absolute top-0 start-0 m-3 px-3 py-2"
                    style={{
                      background: resourceColor,
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    }}
                  >
                    <i className={`${resourceIcon} me-2`}></i>
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
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <i className="bi bi-star-fill"></i>
                    </div>
                  )}

                  {/* Indicador de que se puede ampliar */}
                  <div
                    className="position-absolute bottom-0 end-0 m-3"
                    style={{
                      background: 'rgba(255,255,255,0.8)',
                      borderRadius: '50%',
                      width: '35px',
                      height: '35px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <i className="bi bi-zoom-in" style={{ color: '#333' }}></i>
                  </div>
                </div>
              )}

              <div className="card-body p-4">
                {/* Título y metadatos */}
                <h1
                  className="fw-bold mb-3"
                  style={{
                    color: '#2c3e50',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '2rem',
                    lineHeight: '1.2',
                  }}
                >
                  {resource.titulo}
                </h1>

                {/* Tópicos */}
                {resource.topicos && resource.topicos.length > 0 && (
                  <div className="mb-3">
                    <div className="d-flex flex-wrap gap-2">
                      {resource.topicos.map((topico, idx) => (
                        <span
                          key={idx}
                          className="badge"
                          style={{
                            background: `${resourceColor}20`,
                            color: resourceColor,
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            padding: '6px 12px',
                            borderRadius: '12px',
                          }}
                        >
                          {topico}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estadísticas y metadatos */}
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-eye me-2" style={{ color: '#666' }}></i>
                      <span style={{ color: '#666', fontSize: '0.9rem' }}>
                        {resource.visitas || 0} visualizaciones
                      </span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-share me-2" style={{ color: '#666' }}></i>
                      <span style={{ color: '#666', fontSize: '0.9rem' }}>
                        {resource.compartidos || 0} compartidos
                      </span>
                    </div>
                  </div>
                  {resource.calificacion && resource.calificacion.promedio > 0 && (
                    <div className="col-md-3">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-star-fill me-2" style={{ color: '#FFD700' }}></i>
                        <span style={{ color: '#666', fontSize: '0.9rem' }}>
                          {resource.calificacion.promedio.toFixed(1)} ({resource.calificacion.totalVotos} votos)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Resumen */}
                {resource.resumen && (
                  <div
                    className="p-3 mb-4"
                    style={{
                      background: 'rgba(161,124,202,0.05)',
                      borderLeft: `4px solid ${resourceColor}`,
                      borderRadius: '0 8px 8px 0',
                    }}
                  >
                    <h5
                      className="fw-bold mb-2"
                      style={{
                        color: '#5A4E7C',
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      Resumen
                    </h5>
                    <p
                      style={{
                        color: '#555',
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        margin: 0,
                      }}
                    >
                      {resource.resumen}
                    </p>
                  </div>
                )}

                {/* Descripción completa */}
                <div className="mb-4">
                  <h5
                    className="fw-bold mb-3"
                    style={{
                      color: '#5A4E7C',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    Descripción
                  </h5>
                  <div
                    style={{
                      color: '#555',
                      fontSize: '1rem',
                      lineHeight: '1.7',
                      whiteSpace: 'pre-wrap',
                    }}
                    dangerouslySetInnerHTML={{ __html: resource.descripcion }}
                  />
                </div>

                {/* Archivos adjuntos */}
                {resource.archivosAdjuntos && resource.archivosAdjuntos.length > 0 && (
                  <div className="mb-4">
                    <h5
                      className="fw-bold mb-3"
                      style={{
                        color: '#5A4E7C',
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      Archivos para descargar
                    </h5>
                    <div className="row g-3">
                      {resource.archivosAdjuntos.map((archivo, idx) => (
                        <div key={idx} className="col-md-6">
                          <div
                            className="d-flex align-items-center p-3"
                            style={{
                              background: 'rgba(255,255,255,0.8)',
                              border: '1px solid #e0e0e0',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(161,124,202,0.1)';
                              e.currentTarget.style.borderColor = '#A17CCA';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
                              e.currentTarget.style.borderColor = '#e0e0e0';
                            }}
                          >
                            <i
                              className="bi bi-file-earmark-arrow-down me-3"
                              style={{
                                fontSize: '1.5rem',
                                color: resourceColor,
                              }}
                            ></i>
                            <div className="flex-grow-1">
                              <div
                                className="fw-semibold"
                                style={{ color: '#333', fontSize: '0.9rem' }}
                              >
                                {archivo.nombre}
                              </div>
                              {archivo.tamaño && (
                                <small style={{ color: '#666' }}>
                                  {archivo.tamaño}
                                </small>
                              )}
                            </div>
                            <i
                              className="bi bi-download"
                              style={{ color: resourceColor }}
                            ></i>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Galería de imágenes */}
                {resource.galeria && resource.galeria.length > 0 && (
                  <div className="mb-4">
                    <h5
                      className="fw-bold mb-3"
                      style={{
                        color: '#5A4E7C',
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      Galería
                    </h5>
                    <div className="row g-3">
                      {resource.galeria.map((imagen, idx) => (
                        <div key={idx} className="col-md-4">
                          <div className="position-relative">
                            <img
                              src={imagen}
                              alt={`Galería ${idx + 1}`}
                              className="img-fluid"
                              style={{
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'transform 0.3s ease',
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                              }}
                              onClick={() => handleImageClick(imagen, `Galería ${idx + 1}`)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            />
                            {/* Overlay de zoom */}
                            <div
                              className="position-absolute top-0 end-0 m-2"
                              style={{
                                background: 'rgba(0,0,0,0.6)',
                                borderRadius: '50%',
                                width: '30px',
                                height: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                              }}
                            >
                              <i className="bi bi-zoom-in" style={{ color: 'white', fontSize: '0.8rem' }}></i>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Información adicional */}
                <div className="border-top pt-4">
                  <div className="row g-3">
                    {resource.fuente && (
                      <div className="col-md-6">
                        <strong style={{ color: '#5A4E7C' }}>Fuente:</strong>
                        <span className="ms-2" style={{ color: '#666' }}>
                          {resource.fuente}
                        </span>
                      </div>
                    )}
                    <div className="col-md-6">
                      <strong style={{ color: '#5A4E7C' }}>Fecha de publicación:</strong>
                      <span className="ms-2" style={{ color: '#666' }}>
                        {formatDate(resource.fechaCreacion)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div
              className="card mb-4"
              style={{
                borderRadius: '1rem',
                border: 'none',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              }}
            >
              <div className="card-body p-4">
                <h5
                  className="fw-bold mb-3"
                  style={{
                    color: '#5A4E7C',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Acciones
                </h5>
                
                <div className="d-flex gap-3 flex-wrap">
                  {/* Botón compartir */}
                  <button
                    onClick={handleShare}
                    className="btn btn-outline-primary d-flex align-items-center"
                    style={{
                      borderColor: '#3498db',
                      color: '#3498db',
                      borderRadius: '25px',
                      padding: '10px 20px',
                    }}
                  >
                    <i className="bi bi-share me-2"></i>
                    Compartir
                  </button>

                  {/* Calificación (solo para usuarios autenticados) */}
                  {usuario && (
                    <div className="d-flex align-items-center">
                      <span className="me-2" style={{ color: '#5A4E7C', fontWeight: '600' }}>
                        Calificar:
                      </span>
                      <div className="d-flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRating(star)}
                            disabled={submittingRating}
                            className="btn p-0"
                            style={{
                              border: 'none',
                              background: 'none',
                              fontSize: '1.2rem',
                              color: star <= userRating ? '#FFD700' : '#ddd',
                              cursor: submittingRating ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <i className="bi bi-star-fill"></i>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para mostrar imagen ampliada */}
      {showImageModal && (
        <div
          className="modal fade show d-block"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1050,
          }}
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
              }}
            >
              <div className="modal-header border-0 pb-0">
                <h5
                  className="modal-title text-white"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {imageTitle}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowImageModal(false)}
                  style={{
                    filter: 'invert(1)',
                  }}
                ></button>
              </div>
              <div className="modal-body p-0">
                <img
                  src={selectedImage}
                  alt={imageTitle}
                  className="img-fluid w-100"
                  style={{
                    borderRadius: '8px',
                    maxHeight: '80vh',
                    objectFit: 'contain',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}