import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FeedPublicaciones.module.css';
import { fetchPublicaciones, deletePublicacion } from '../../services/publicacionesService';
import PublicacionCard from '../../components/Publicaciones/PublicacionCard';

const LIMITE_POR_PAGINA = 10;

const FeedPublicaciones = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const observer = useRef();
  const navigate = useNavigate();

  // Cargar publicaciones solo cuando cambia la página
  useEffect(() => {
    const cargar = async () => {
      if (!hasMore) return;
      setLoading(true);
      setError('');
      try {
        // Solicita solo publicaciones de tipo "perfil"
        const data = await fetchPublicaciones({ pagina, limite: LIMITE_POR_PAGINA, tipo: 'perfil' });
        const nuevas = data.publicaciones || [];
        setPublicaciones(prev => {
          const ids = new Set(prev.map(p => p._id));
          const unicas = nuevas.filter(p => !ids.has(p._id));
          return [...prev, ...unicas];
        });
        setHasMore(nuevas.length === LIMITE_POR_PAGINA);
      } catch (err) {
        setError(err.message || 'Error al cargar publicaciones');
      } finally {
        setLoading(false);
      }
    };
    cargar();
    // eslint-disable-next-line
  }, [pagina]);

  // Inicializa el estado al montar
  useEffect(() => {
    setPublicaciones([]);
    setPagina(1);
    setHasMore(true);
    // No llamamos cargarPublicaciones aquí, solo reiniciamos el estado
  }, []);

  // Scroll infinito usando Intersection Observer
  const ultimoElementoRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPagina(prev => prev + 1); // Solo incrementa la página
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Maneja la eliminación de una publicación del estado
  const handleEliminarPost = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await deletePublicacion(id, token);
      setPublicaciones(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert(err.message || 'Error al eliminar publicación');
    }
  };

  return (
    <div className={styles.feedContainer}>
      {publicaciones.map((pub, idx) => {
        if (idx === publicaciones.length - 1) {
          return (
            <div ref={ultimoElementoRef} key={pub._id}>
              <PublicacionCard publicacion={pub} onDelete={handleEliminarPost} />
            </div>
          );
        }
        return (
          <div key={pub._id}>
            <PublicacionCard publicacion={pub} onDelete={handleEliminarPost} />
          </div>
        );
      })}

      {/* Botón flotante para crear publicación */}
      <button
        className={styles.fabCrearPost}
        title="Crear nueva publicación"
        onClick={() => navigate('/crear-post')}
      >
        <i className="bi bi-plus-lg"></i>
      </button>

      {loading && <div className={styles.loading}>Cargando...</div>}
      {error && <div className={styles.error}>{error}</div>}
      {!hasMore && !loading && (
        <div className={styles.endMessage}>No hay más publicaciones.</div>
      )}
    </div>
  );
};

export default FeedPublicaciones;