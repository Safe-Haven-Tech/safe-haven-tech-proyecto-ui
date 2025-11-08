import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FeedPublicaciones.module.css';
import {
  fetchPublicaciones,
  deletePublicacion,
} from '../../services/publicacionesService';
import PublicacionCard from '../../components/Publicaciones/PublicacionCard';

/**
 * Toast
 */
const Toast = ({ message, show, onClose, timeout = 3500 }) => {
  useEffect(() => {
    if (!show) return undefined;
    const t = setTimeout(onClose, timeout);
    return () => clearTimeout(t);
  }, [show, onClose, timeout]);

  if (!show || !message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        background: 'rgba(96,60,126,0.95)',
        color: '#fff',
        padding: '10px 16px',
        borderRadius: 10,
        boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
        zIndex: 1200,
        fontWeight: 600,
      }}
    >
      {message}
    </div>
  );
};

const LIMITE_POR_PAGINA = 10;

/**
 * Feed de publicaciones con paginación por scroll (IntersectionObserver).
 * - Implementa eliminación optimista de publicaciones.
 * - Gestiona limpieza de observers y peticiones pendientes.
 */
const FeedPublicaciones = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  const observer = useRef(null);
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);
  const navigate = useNavigate();

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      // Marca componente desmontado y limpia recursos
      isMountedRef.current = false;
      if (observer.current) observer.current.disconnect();
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  /**
   * Carga publicaciones para la página actual.
   * Utiliza AbortController para permitir cancelación al desmontar o cambiar página.
   */
  useEffect(() => {
    const cargar = async () => {
      if (!hasMore) return;
      setLoading(true);
      setError('');
      // Cancelar petición anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        // El servicio puede o no respetar signal; la llamada queda protegida por abort/flag.
        const data = await fetchPublicaciones({
          pagina,
          limite: LIMITE_POR_PAGINA,
          tipo: 'perfil',
          signal: controller.signal,
        });
        if (!isMountedRef.current) return;
        const nuevas = data.publicaciones || [];
        setPublicaciones((prev) => {
          const ids = new Set(prev.map((p) => p._id));
          const unicas = nuevas.filter((p) => !ids.has(p._id));
          return [...prev, ...unicas];
        });
        setHasMore(nuevas.length === LIMITE_POR_PAGINA);
      } catch (err) {
        if (!isMountedRef.current) return;
        if (err.name === 'AbortError') {
          // petición cancelada: no mostrar error
        } else {
          setError(err?.message || 'Error al cargar publicaciones');
        }
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina]);

  /**
   * Reinicia el estado del feed al montar (prepara para carga desde página 1).
   */
  useEffect(() => {
    setPublicaciones([]);
    setPagina(1);
    setHasMore(true);
    setError('');
    // No lanzamos carga aquí explícitamente; el efecto de `pagina` lo hará.
  }, []);

  /**
   * Ref callback para el último elemento observado; incrementa página cuando aparece en viewport.
   * Se asegura de desconectar y reasignar observer correctamente.
   */
  const ultimoElementoRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new window.IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasMore) {
          setPagina((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  /**
   * Eliminación optimista:
   * - Remueve inmediatamente del estado para respuesta UI ágil.
   * - Intenta eliminar en backend.
   * - Si falla, restaura la publicación y muestra toast de error.
   */
  const handleEliminarPost = async (id) => {
    const token = localStorage.getItem('token');
    const prev = publicaciones;
    // Optimista: actualiza UI inmediatamente
    setPublicaciones((p) => p.filter((item) => item._id !== id));

    try {
      await deletePublicacion(id, token);
      setToast({ show: true, message: 'Publicación eliminada' });
    } catch (err) {
      // Restaurar estado previo en caso de error
      if (isMountedRef.current) {
        setPublicaciones(prev);
        setToast({
          show: true,
          message: err?.message || 'Error al eliminar publicación',
        });
      }
    }
  };

  return (
    <div className={styles.feedContainer}>
      {publicaciones.map((pub, idx) => {
        const isUltimo = idx === publicaciones.length - 1;
        const wrapperProps = isUltimo ? { ref: ultimoElementoRef } : {};
        return (
          <div key={pub._id} {...wrapperProps}>
            <PublicacionCard publicacion={pub} onDelete={handleEliminarPost} />
          </div>
        );
      })}

      <button
        className={styles.fabCrearPost}
        title="Crear nueva publicación"
        onClick={() => navigate('/crear-post')}
        aria-label="Crear nueva publicación"
      >
        <i className="bi bi-plus-lg" />
      </button>

      {loading && <div className={styles.loading}>Cargando...</div>}
      {error && <div className={styles.error}>{error}</div>}
      {!hasMore && !loading && (
        <div className={styles.endMessage}>No hay más publicaciones.</div>
      )}

      <Toast
        message={toast.message}
        show={toast.show}
        onClose={() => setToast({ show: false, message: '' })}
      />
    </div>
  );
};

export default FeedPublicaciones;
