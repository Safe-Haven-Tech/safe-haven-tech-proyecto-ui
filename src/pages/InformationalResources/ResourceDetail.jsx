import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './ResourceDetail.module.css';
import {
  fetchRecursoById,
  incrementarCompartidos,
  incrementarVisitas,
  calificarRecurso,
} from '../../services/informationalResourcesService';
import { useAuth } from '../../hooks/useAuth';

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

/**
 * Modal informativo
 */
const InfoModal = ({ show, title, message, onClose, okText = 'Aceptar' }) => {
  if (!show) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.25)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          minWidth: 300,
          maxWidth: 560,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h5 style={{ marginTop: 0, marginBottom: 8, color: '#603c7e' }}>
          {title}
        </h5>
        <div
          style={{ marginBottom: 18, color: '#333', whiteSpace: 'pre-wrap' }}
        >
          {message}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: '#603c7e',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {okText}
          </button>
        </div>
      </div>
    </div>
  );
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

  // Estado para mensajes informativos (reemplaza alert)
  const [infoModal, setInfoModal] = useState({
    show: false,
    title: '',
    message: '',
  });

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

        if (
          usuario &&
          response.data.calificacion &&
          response.data.calificacion.votos
        ) {
          const miCalificacion = response.data.calificacion.votos.find(
            (voto) => voto.usuario && voto.usuario._id === usuario.id
          );
          if (miCalificacion) {
            setUserRating(miCalificacion.calificacion);
          }
        }

        const visitaKey = `visita_${id}`;
        const yaVisitado = sessionStorage.getItem(visitaKey);

        if (!yaVisitado && !visitaIncrementada.current) {
          visitaIncrementada.current = true;

          try {
            await incrementarVisitas(id);
            sessionStorage.setItem(visitaKey, 'true');

            setResource((prev) => ({
              ...prev,
              visitas: (prev.visitas || 0) + 1,
            }));
          } catch (visitasError) {
            console.error('Error al incrementar visitas:', visitasError);
            visitaIncrementada.current = false;
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
        // Mostrar confirmación en la UI en vez de alert
        setInfoModal({
          show: true,
          title: 'Enlace copiado',
          message: 'Enlace copiado al portapapeles',
        });
      }

      incrementarCompartidos(id)
        .then(() => {
          setResource((prev) => ({
            ...prev,
            compartidos: (prev.compartidos || 0) + 1,
          }));
        })
        .catch(() => {
          // Silenciar errores de incremento de métricas
        });
    } catch (error) {
      console.error('Error al compartir:', error);
      // Intentar copiar al portapapeles y notificar en UI
      try {
        await navigator.clipboard.writeText(window.location.href);
        setInfoModal({
          show: true,
          title: 'Error al compartir',
          message:
            'No fue posible usar la API de compartir. El enlace se ha copiado al portapapeles.',
        });
      } catch (clipboardError) {
        console.error('Error al copiar al portapapeles:', clipboardError);
        setInfoModal({
          show: true,
          title: 'Error al compartir',
          message:
            'No se pudo compartir ni copiar el enlace. Intenta manualmente.',
        });
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
            (voto) => voto.usuario && voto.usuario._id === usuario.id
          );
          if (miCalificacion) {
            setUserRating(miCalificacion.calificacion);
          }
        }
      }
    } catch (error) {
      console.error('Error al enviar la calificación:', error);
      setInfoModal({
        show: true,
        title: 'Error',
        message:
          'Error al enviar la calificación. Por favor, intenta de nuevo.',
      });
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
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className={`container py-5 ${styles.resourceDetail}`}>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className={`text-center py-5 ${styles.loadingContainer}`}>
              <div
                className={`spinner-border mb-3 ${styles.loadingSpinner}`}
                role="status"
              >
                <span className="visually-hidden">Cargando recurso...</span>
              </div>
              <h4 className={styles.loadingTitle}>Cargando recurso...</h4>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className={`container py-5 ${styles.resourceDetail}`}>
        <div className="row justify-content-center">
          <div className={`col-lg-8 text-center ${styles.errorContainer}`}>
            <div className={styles.errorIcon}>
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h4 className={styles.errorTitle}>Recurso no encontrado</h4>
            <p className={styles.errorText}>
              {error || 'El recurso que buscas no existe o ha sido eliminado.'}
            </p>
            <button
              onClick={() => navigate('/recursosInformativos')}
              className={`btn btn-lg fw-semibold px-4 py-3 ${styles.backButton}`}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Volver a recursos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const resourceColorClass = getResourceColorClass(resource.tipo);
  const resourceIcon = getResourceIcon(resource.tipo);

  return (
    <>
      <div className={`container py-5 ${styles.resourceDetail}`}>
        <div className="row">
          <div className={`col-lg-8 mx-auto ${styles.resourceContainer}`}>
            {/* Botón de regreso */}
            <button
              onClick={() => navigate('/recursosInformativos')}
              className={`btn btn-outline-secondary mb-4 d-flex align-items-center ${styles.navBackButton}`}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Volver a recursos
            </button>

            {/* Header del recurso */}
            <div
              className={`card mb-4 ${styles.resourceCard} ${resourceColorClass}`}
            >
              {/* Imagen principal */}
              {resource.imagenPrincipal && (
                <div
                  className={styles.heroImage}
                  style={{
                    backgroundImage: `url(${resource.imagenPrincipal})`,
                  }}
                  onClick={() =>
                    handleImageClick(resource.imagenPrincipal, resource.titulo)
                  }
                >
                  <div className={styles.heroImageOverlay}></div>

                  {/* Badge de tipo sobre la imagen */}
                  <div
                    className={styles.typeBadge}
                    style={{ background: `var(--resource-color)` }}
                  >
                    <i className={resourceIcon}></i>
                    {resource.tipo}
                  </div>

                  {/* Badge destacado */}
                  {resource.destacado && (
                    <div className={styles.featuredBadge}>
                      <i className="bi bi-star-fill"></i>
                    </div>
                  )}

                  {/* Indicador de que se puede ampliar */}
                  <div className={styles.zoomIndicator}>
                    <i className="bi bi-zoom-in"></i>
                  </div>
                </div>
              )}

              <div className="card-body p-4">
                {/* Título y metadatos */}
                <h1 className={styles.resourceTitle}>{resource.titulo}</h1>

                {/* Tópicos */}
                {resource.topicos && resource.topicos.length > 0 && (
                  <div className={styles.topicsContainer}>
                    {resource.topicos.map((topico, idx) => (
                      <span
                        key={idx}
                        className={styles.topicBadge}
                        style={{
                          background: `var(--resource-color)20`,
                          color: `var(--resource-color)`,
                        }}
                      >
                        {topico}
                      </span>
                    ))}
                  </div>
                )}

                {/* Estadísticas y metadatos */}
                <div className={`row ${styles.statsRow}`}>
                  <div className="col-md-3">
                    <div className={styles.statItem}>
                      <i className="bi bi-eye"></i>
                      {resource.visitas || 0} visualizaciones
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className={styles.statItem}>
                      <i className="bi bi-share"></i>
                      {resource.compartidos || 0} compartidos
                    </div>
                  </div>
                  {resource.calificacion &&
                    resource.calificacion.promedio > 0 && (
                      <div className="col-md-3">
                        <div className={styles.ratingItem}>
                          <i className="bi bi-star-fill"></i>
                          {resource.calificacion.promedio.toFixed(1)} (
                          {resource.calificacion.totalVotos} votos)
                        </div>
                      </div>
                    )}
                </div>

                {/* Resumen */}
                {resource.resumen && (
                  <div className={styles.summarySection}>
                    <h5 className={styles.summaryTitle}>Resumen</h5>
                    <p className={styles.summaryText}>{resource.resumen}</p>
                  </div>
                )}

                {/* Descripción completa */}
                <div className={styles.descriptionSection}>
                  <h5 className={styles.sectionTitle}>Descripción</h5>
                  <div
                    className={styles.descriptionText}
                    dangerouslySetInnerHTML={{ __html: resource.descripcion }}
                  />
                </div>

                {/* Archivos adjuntos */}
                {resource.archivosAdjuntos &&
                  resource.archivosAdjuntos.length > 0 && (
                    <div className={styles.filesSection}>
                      <h5 className={styles.sectionTitle}>
                        Archivos para descargar
                      </h5>
                      <div className="row g-3">
                        {resource.archivosAdjuntos.map((archivo, idx) => (
                          <div key={idx} className="col-md-6">
                            <div className={styles.fileItem}>
                              <i
                                className={`bi bi-file-earmark-arrow-down ${styles.fileIcon}`}
                                style={{ color: `var(--resource-color)` }}
                              ></i>
                              <div className={styles.fileContent}>
                                <div className={styles.fileName}>
                                  {archivo.nombre}
                                </div>
                                {archivo.tamaño && (
                                  <small className={styles.fileSize}>
                                    {archivo.tamaño}
                                  </small>
                                )}
                              </div>
                              <i
                                className={`bi bi-download ${styles.downloadIcon}`}
                                style={{ color: `var(--resource-color)` }}
                              ></i>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Galería de imágenes */}
                {resource.galeria && resource.galeria.length > 0 && (
                  <div className={styles.gallerySection}>
                    <h5 className={styles.sectionTitle}>Galería</h5>
                    <div className={`row ${styles.galleryGrid}`}>
                      {resource.galeria.map((imagen, idx) => (
                        <div key={idx} className="col-md-4">
                          <div className={styles.galleryImageContainer}>
                            <img
                              src={imagen}
                              alt={`Galería ${idx + 1}`}
                              className={styles.galleryImage}
                              onClick={() =>
                                handleImageClick(imagen, `Galería ${idx + 1}`)
                              }
                            />
                            {/* Overlay de zoom */}
                            <div className={styles.galleryZoomOverlay}>
                              <i className="bi bi-zoom-in"></i>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Información adicional */}
                <div className={styles.additionalInfo}>
                  <div className={`row ${styles.infoGrid}`}>
                    {resource.fuente && (
                      <div className="col-md-6">
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Fuente:</span>
                          <span className={styles.infoValue}>
                            {resource.fuente}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="col-md-6">
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>
                          Fecha de publicación:
                        </span>
                        <span className={styles.infoValue}>
                          {formatDate(resource.fechaCreacion)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className={`card mb-4 ${styles.actionsCard}`}>
              <div className="card-body p-4">
                <h5 className={styles.sectionTitle}>Acciones</h5>

                <div className={styles.actionsContainer}>
                  {/* Botón compartir */}
                  <button
                    onClick={handleShare}
                    className={`btn btn-outline-primary d-flex align-items-center ${styles.shareButton}`}
                  >
                    <i className="bi bi-share me-2"></i>
                    Compartir
                  </button>

                  {/* Calificación (solo para usuarios autenticados) */}
                  {usuario && (
                    <div className={styles.ratingContainer}>
                      <span className={styles.ratingLabel}>Calificar:</span>
                      <div className={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRating(star)}
                            disabled={submittingRating}
                            className={`${styles.starButton} ${
                              star <= userRating
                                ? styles.starActive
                                : styles.starInactive
                            }`}
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
          className={`modal fade show d-block ${styles.imageModal}`}
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`modal-content ${styles.imageModalContent}`}>
              <div className={`modal-header ${styles.imageModalHeader}`}>
                <h5 className={`modal-title ${styles.imageModalTitle}`}>
                  {imageTitle}
                </h5>
                <button
                  type="button"
                  className={`btn-close btn-close-white ${styles.imageModalClose}`}
                  onClick={() => setShowImageModal(false)}
                ></button>
              </div>
              <div className={`modal-body ${styles.imageModalBody}`}>
                <img
                  src={selectedImage}
                  alt={imageTitle}
                  className={`img-fluid w-100 ${styles.imageModalImg}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <InfoModal
        show={infoModal.show}
        title={infoModal.title}
        message={infoModal.message}
        onClose={() => setInfoModal({ show: false, title: '', message: '' })}
      />
    </>
  );
}
