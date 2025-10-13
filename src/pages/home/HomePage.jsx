import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './HomePage.module.css';
import background from '../../assets/FondoLogin.png';
import placeholderImage from '../../assets/perfil_placeholder.png';
import { fetchPublicacionesPerfil, fetchPublicaciones } from '../../services/publicacionesService';

// Utilidad para acortar texto
const acortarTexto = (texto, max = 100) =>
  texto && texto.length > max ? texto.slice(0, max) + '...' : texto;

// Utilidad para obtener un thumbnail de video
const getVideoThumbnail = (url) =>
  new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.currentTime = 0.5;
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        resolve(URL.createObjectURL(blob));
        URL.revokeObjectURL(video.src);
      }, 'image/jpeg', 0.8);
    };
    video.onerror = () => resolve('');
  });

// Componente de la sección de bienvenida
const WelcomeSection = () => {
  return (
    <section
      className={styles.welcomeSection}
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="container">
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>Bienvenido a SafeHaven</h1>
          <p className={styles.welcomeSubtitle}>
            Tu espacio seguro para el bienestar mental
          </p>
          <p className={styles.welcomeDescription}>
            Descubre recursos, conecta con una comunidad de apoyo y encuentra
            las herramientas que necesitas para cuidar tu salud mental. Estamos
            aquí para acompañarte en cada paso de tu camino hacia el bienestar.
          </p>
          <div className={styles.ctaContainer}>
            <a
              href="/autoevaluacion"
              className={`btn btn-lg ${styles.ctaButton}`}
              role="button"
              aria-label="Comenzar proceso de autoevaluación de bienestar mental"
            >
              Comenzar Autoevaluación
            </a>
            <a
              href="/recursos"
              className={`btn btn-lg ${styles.ctaButton} ${styles.ctaButtonSecondary}`}
              role="button"
              aria-label="Explorar recursos de apoyo y bienestar mental"
            >
              Explorar Recursos
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

// Componente de sección futura
const FutureSection = () => {
  return (
    <div className={styles.futureSection}>
      <div className="container">
        <div className={`text-center ${styles.futureSectionContent}`}>
          <h3 className={styles.futureSectionTitle}>
            Próximas secciones en desarrollo...
          </h3>
          <p className={styles.futureSectionText}>
            Aquí agregaremos más contenido según tus especificaciones
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar la preview de multimedia (imagen o video)
const MultimediaPreview = ({ url }) => {
  const [thumb, setThumb] = useState('');
  useEffect(() => {
    if (!url) return;
    const ext = url.split('.').pop().toLowerCase();
    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) {
      getVideoThumbnail(url).then((t) => setThumb(t));
    }
  }, [url]);
  const ext = url ? url.split('.').pop().toLowerCase() : '';
  if (!url) {
    return (
      <img
        src="/default-image.png"
        alt="preview"
        className="card-img-top"
        style={{
          height: 220,
          objectFit: 'cover',
          borderRadius: '12px 12px 0 0',
          background: '#fafafa',
        }}
      />
    );
  }
  if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) {
    return thumb ? (
      <img
        src={thumb}
        alt="preview video"
        className="card-img-top"
        style={{
          height: 220,
          objectFit: 'cover',
          borderRadius: '12px 12px 0 0',
          background: '#fafafa',
        }}
      />
    ) : (
      <div
        style={{
          height: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafafa',
          borderRadius: '12px 12px 0 0',
        }}
      >
        <span className="text-muted">Cargando preview...</span>
      </div>
    );
  }
  return (
    <img
      src={url}
      alt="preview"
      className="card-img-top"
      style={{
        height: 220,
        objectFit: 'cover',
        borderRadius: '12px 12px 0 0',
        background: '#fafafa',
      }}
    />
  );
};

const PublicacionesSection = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarPublicaciones = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchPublicacionesPerfil({ pagina: 1, limite: 30 });
        setPublicaciones(data.publicaciones || []);
      } catch (err) {
        setError(err.message || 'Error al cargar publicaciones');
      } finally {
        setLoading(false);
      }
    };
    cargarPublicaciones();
  }, []);

  // Mostrar solo las primeras 6 publicaciones (2 filas de 3)
  const publicacionesPreview = publicaciones.slice(0, 6);

  return (
    <section className="container my-5">
      <h2 className="mb-4 text-center" style={{ color: '#603c7e' }}>
        Publicaciones recientes de la comunidad
      </h2>
      {loading && <div className="text-center">Cargando publicaciones...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && publicacionesPreview.length === 0 && (
        <div className="text-center text-muted">No hay publicaciones disponibles.</div>
      )}
      <div className="row">
        {publicacionesPreview.map((pub) => (
          <div key={pub._id} className="col-md-4 mb-4">
            <div
              className="card h-100 shadow-sm border-0"
              style={{
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(96,60,126,0.13)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(96,60,126,0.10)';
              }}
            >
              <a href={`/publicacion/${pub._id}`}>
                <MultimediaPreview
                  url={
                    pub.multimedia && pub.multimedia.length > 0
                      ? pub.multimedia[0]
                      : '/default-image.png'
                  }
                />
              </a>
              <div className="card-body">
                <a
                  href={`/perfil/${pub.autorId?.nombreUsuario}`}
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginBottom: 8 }}
                  aria-label={`Ir al perfil de ${pub.autorId?.nombreCompleto || pub.autorId?.nombreUsuario || 'usuario'}`}
                >
                  <img
                    src={pub.autorId?.fotoPerfil || placeholderImage}
                    alt="Avatar"
                    className="rounded-circle me-2"
                    style={{ width: 32, height: 32, objectFit: 'cover', border: '2px solid #603c7e' }}
                  />
                  <span className="fw-bold" style={{ color: '#603c7e', fontSize: '1rem' }}>
                    {pub.autorId?.anonimo ? 'Anónimo' : (pub.autorId?.nombreCompleto || pub.autorId?.nombreUsuario)}
                  </span>
                  <span className="ms-auto text-muted" style={{ fontSize: '0.85rem' }}>
                    {new Date(pub.fecha).toLocaleDateString()}
                  </span>
                </a>
                <p className="mt-2 mb-2" style={{ fontSize: '1rem', color: '#334155', minHeight: 40 }}>
                  {acortarTexto(pub.contenido || '', 100)}
                </p>
                <div className="d-flex align-items-center mt-1">
                  <span className="me-3" style={{ color: '#603c7e', fontWeight: 'bold', fontSize: '0.95rem' }}>
                    <i className="bi bi-heart-fill" style={{ marginRight: 4 }}></i>
                    {Array.isArray(pub.likes) ? pub.likes.length : 0}
                  </span>
                  <span className="me-3" style={{ color: '#603c7e', fontSize: '0.95rem' }}>
                    {pub.comentarios?.length !== undefined
                      ? `${pub.comentarios.length} comentarios`
                      : '0 comentarios'}
                  </span>
                </div>
                {pub.etiquetasUsuarios && pub.etiquetasUsuarios.length > 0 && (
                  <div className="mt-2">
                    {pub.etiquetasUsuarios.map((user, idx) => (
                      <span key={idx} className="badge bg-secondary me-1">
                        @{user.nombreCompleto}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-end mt-2">
                  <a
                    href={`/publicacion/${pub._id}`}
                    className="btn btn-sm btn-outline-primary"
                    style={{ borderRadius: 8, fontWeight: 500 }}
                  >
                    Ver más
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Botón ver más publicaciones después de 3 filas */}
      {publicaciones.length > 6 && (
        <div className="row justify-content-center mt-3">
          <div className="col-md-4 text-center">
            <a
              href="/publicaciones"
              className="btn btn-lg btn-primary"
              style={{ borderRadius: 12, fontWeight: 600 }}
            >
              Ver más publicaciones
            </a>
          </div>
        </div>
      )}
    </section>
  );
};

// Sección de publicaciones del foro más populares
const ForoPopularesSection = () => {
  const [foroPopulares, setForoPopulares] = useState([]);
  const [loadingForo, setLoadingForo] = useState(true);
  const [errorForo, setErrorForo] = useState('');

  useEffect(() => {
    const cargarForoPopulares = async () => {
      setLoadingForo(true);
      setErrorForo('');
      try {
        const data = await fetchPublicaciones({ pagina: 1, limite: 30, tipo: 'foro' });
        const publicacionesForo = (data.publicaciones || [])
          .filter(pub => pub.tipo === 'foro')
          .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
          .slice(0, 6);
        setForoPopulares(publicacionesForo);
      } catch (err) {
        setErrorForo(err.message || 'Error al cargar publicaciones del foro');
      } finally {
        setLoadingForo(false);
      }
    };
    cargarForoPopulares();
  }, []);

  return (
    <section className="container my-5">
      <h2 className="mb-4 text-center" style={{ color: '#603c7e' }}>
        Foro: Temas más populares
      </h2>
      <div className={styles.foroSectionContainer}>
        <div className={styles.foroHeaderRow}>
          <span></span>
          <span>Tema</span>
          <span>Autor</span>
          <span>Likes</span>
          <span>Comentarios</span>
        </div>
        {loadingForo && (
          <div className={styles.foroLoading}>Cargando publicaciones del foro...</div>
        )}
        {errorForo && (
          <div className={`alert alert-danger ${styles.foroError}`}>{errorForo}</div>
        )}
        {!loadingForo && foroPopulares.length === 0 && (
          <div className={styles.foroEmpty}>No hay publicaciones del foro.</div>
        )}
        {foroPopulares.map((pub, idx) => (
          <a
            key={pub._id}
            href={`/publicacion/${pub._id}`}
            className={`${styles.foroRow} ${idx % 2 === 0 ? '' : styles.foroRowAlt}`}
          >
            <span className={styles.foroIcon}>
              <i className="bi bi-chat-dots"></i>
            </span>
            <span className={styles.foroTema}>
              {acortarTexto(pub.contenido || 'Sin título', 70)}
            </span>
            <span className={styles.foroAutor}>
              <img
                src={pub.autorId?.fotoPerfil || placeholderImage}
                alt="Avatar"
                className={styles.foroAutorImg}
              />
              <span className={styles.foroAutorNombre}>
                {pub.autorId?.anonimo
                  ? 'Anónimo'
                  : pub.autorId?.nombreCompleto ||
                    pub.autorId?.nombreUsuario ||
                    'Usuario'}
              </span>
            </span>
            <span className={styles.foroLikes}>
              <i className="bi bi-heart-fill" style={{ marginRight: 4 }}></i>
              {Array.isArray(pub.likes) ? pub.likes.length : 0}
            </span>
            <span className={styles.foroComentarios}>
              <i className="bi bi-chat-left-text" style={{ marginRight: 4 }}></i>
              {pub.comentarios?.length !== undefined
                ? pub.comentarios.length
                : '0'}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
};

// Componente principal del Home
const HomePage = () => {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.navbarSpacer}>
        <WelcomeSection />
        <PublicacionesSection />
        <ForoPopularesSection />
        <FutureSection />
      </div>
    </div>
  );
};

export default HomePage;