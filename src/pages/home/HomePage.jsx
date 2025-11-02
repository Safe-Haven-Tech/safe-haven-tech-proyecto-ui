import React, { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import background from '../../assets/FondoLogin.png';
import placeholderImage from '../../assets/perfil_placeholder.png';
import { fetchProfessionals } from '../../services/userServices';
import { fetchPublicacionesPerfil, fetchPublicaciones } from '../../services/publicacionesService';

// Utilidad para acortar texto
const acortarTexto = (texto, max = 100) =>
  texto && texto.length > max ? texto.slice(0, max) + '...' : texto;

// Utilidad para obtener un thumbnail de video (cliente)
// Nota: genera un object URL desde un blob; consumer debe usar loading="lazy" en <img>
const getVideoThumbnail = (url) =>
  new Promise((resolve) => {
    const video = document.createElement('video');
    let resolved = false;
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    // intentamos posicionar ligeramente adelante para evitar cuadro negro en algunos servidores
    video.currentTime = 0.5;
    const cleanup = () => {
      try {
        video.src = '';
      } catch (e) {
        console.error('Error al limpiar el video:', e);
      }
    };
    video.onloadeddata = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 180;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const objUrl = URL.createObjectURL(blob);
            resolved = true;
            resolve(objUrl);
          } else {
            resolve('');
          }
          cleanup();
        }, 'image/jpeg', 0.8);
      } catch (e) {
        console.error('Error al procesar el video:', e);
        resolve('');
        cleanup();
      }
    };
    video.onerror = () => {
      if (!resolved) resolve('');
      cleanup();
    };
    // safety timeout
    setTimeout(() => {
      if (!resolved) {
        resolve('');
        cleanup();
      }
    }, 8000);
  });

// -------- Components --------

// Sección bienvenida
const WelcomeSection = () => {
  return (
    <section
      className={styles.welcomeSection}
      style={{ backgroundImage: `url(${background})` }}
      role="region"
      aria-label="Bienvenida"
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
            <Link
              to="/autoevaluacion"
              className={`btn btn-lg ${styles.ctaButton}`}
              role="button"
              aria-label="Comenzar proceso de autoevaluación de bienestar mental"
            >
              Comenzar Autoevaluación
            </Link>
            <Link
              to="/recursosinformativos"
              className={`btn btn-lg ${styles.ctaButton} ${styles.ctaButtonSecondary}`}
              role="button"
              aria-label="Explorar recursos de apoyo y bienestar mental"
            >
              Explorar Recursos
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const ExpertsSection = () => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const extractListFromResponse = (data) => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      // claves posibles que puede devolver el backend
      const possibleKeys = ['usuarios', 'profesionales', 'results', 'items', 'data'];
      for (const key of possibleKeys) {
        if (Array.isArray(data[key])) return data[key];
        // caso data[key] es objeto que contiene array en 'usuarios'
        if (data[key] && Array.isArray(data[key].usuarios)) return data[key].usuarios;
      }
      // caso data.data.usuarios
      if (data.data && Array.isArray(data.data.usuarios)) return data.data.usuarios;
      return [];
    };

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchProfessionals({ pagina: 1, limite: 6 });
        const list = extractListFromResponse(data);
        if (mounted) setExperts(Array.isArray(list) ? list.slice(0, 6) : []);
      } catch (err) {
        if (mounted) setError(err?.message || 'Error al cargar expertos');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="container my-5" aria-labelledby="experts-title">
      <h2 id="experts-title" className="mb-4 text-center" style={{ color: '#603c7e' }}>
        Contacta con expertos
      </h2>

      {loading && (
        <div className="row">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm border-0" style={{ overflow: 'hidden' }}>
                <div style={{ height: 160, background: '#f3f3f3', borderRadius: '12px 12px 0 0' }} />
                <div className="card-body">
                  <div style={{ height: 16, width: '60%', background: '#eee', borderRadius: 6 }} />
                  <div style={{ height: 12, width: '40%', background: '#f1f1f1', marginTop: 8, borderRadius: 6 }} />
                  <div style={{ height: 10 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && experts.length === 0 && !error && (
        <div className="text-center text-muted">No se encontraron profesionales en este momento.</div>
      )}

      <div className={styles.expertsGrid + ' row'}>
        {experts.map((prof) => {
          // normalizar identificador y campos según ejemplo de API
          const idOrNick = prof.nombreUsuario || prof.nickname || prof._id || prof.id;
          // construir link preferente a /perfil/:nombreUsuario
          const profileLink = prof.nombreUsuario
            ? `/perfil/${encodeURIComponent(prof.nombreUsuario)}`
            : idOrNick
            ? `/perfil/${encodeURIComponent(idOrNick)}`
            : '/perfil';

          const fullName = prof.nombreCompleto || prof.nombre || prof.nombreUsuario || 'Profesional';
          const especialidades = prof.infoProfesional?.especialidades || prof.especialidades || [];
          const specialty = Array.isArray(especialidades) && especialidades.length > 0
            ? especialidades.join(', ')
            : (prof.especialidad || prof.specialty || 'Especialidad no especificada');
          const disponible = (prof.infoProfesional && (prof.infoProfesional.disponible ?? prof.infoProfesional?.disponible)) ?? (prof.disponible ?? undefined);

          return (
            <div key={prof._id || prof.id || prof.nombreUsuario || prof.nickname} className="col-md-4 mb-4">
              <div className={styles.expertCard + ' card h-100 shadow-sm border-0'}>
                <div style={{ overflow: 'hidden' }}>
                  <img
                    src={prof.fotoPerfil || prof.avatar || placeholderImage}
                    alt={fullName}
                    loading="lazy"
                    className="card-img-top"
                    style={{ height: 160, objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
                    onError={(e) => { e.currentTarget.src = placeholderImage; }}
                  />
                </div>
                <div className="card-body d-flex flex-column">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div className={styles.expertName}>{fullName}</div>
                      <div className={styles.expertSpecialty}>{specialty}</div>
                    </div>
                    <div>
                      {disponible ? (
                        <span className={styles.expertBadge + ' ' + styles.expertAvailable}>Disponible</span>
                      ) : (
                        <span className={styles.expertBadge}>{disponible === false ? 'No disponible' : 'Consultar'}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: 10, flex: 1 }}>
                    <div style={{ fontSize: '0.95rem', color: '#64748b' }}>
                      {prof.modalidad ? `Modalidad: ${prof.modalidad}` : (prof.modalities ? `Modalidad: ${prof.modalities}` : '')}
                    </div>
                    {prof.idiomas && (
                      <div style={{ marginTop: 6, fontSize: '0.9rem', color: '#94a3b8' }}>
                        Idiomas: {Array.isArray(prof.idiomas) ? prof.idiomas.join(', ') : prof.idiomas}
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-2 mt-3">
                    <Link to={profileLink} className="btn btn-outline-primary btn-sm" aria-label={`Ver perfil de ${fullName}`}>
                     Ver Perfil
                    </Link>

                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {experts.length > 3 && (
        <div className="row justify-content-center mt-3">
          <div className="col-md-4 text-center">
            <Link to="/profesionales" className="btn btn-lg btn-outline-secondary" style={{ borderRadius: 12 }}>
              Ver todos los profesionales
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};

// Skeleton card para carga perezosa
const SkeletonCard = () => (
  <div className="col-md-4 mb-4" aria-hidden="true">
    <div className="card h-100 shadow-sm border-0" style={{ overflow: 'hidden' }}>
      <div style={{ height: 220, background: '#f3f3f3', animation: 'pulse 1.2s infinite', borderRadius: '12px 12px 0 0' }} />
      <div className="card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e9e9e9' }} />
          <div style={{ height: 14, width: '60%', background: '#e9e9e9', borderRadius: 6 }} />
        </div>
        <div style={{ height: 14, width: '90%', background: '#f1f1f1', marginTop: 12, borderRadius: 6 }} />
        <div style={{ height: 14, width: '80%', background: '#f1f1f1', marginTop: 8, borderRadius: 6 }} />
        <div style={{ height: 34 }} />
      </div>
    </div>
  </div>
);

// MultimediaPreview con lazy-generation de thumbnail vía IntersectionObserver
const MultimediaPreview = ({ url }) => {
  const [thumb, setThumb] = useState('');
  const [generating, setGenerating] = useState(false);
  const elRef = useRef(null);

  useEffect(() => {
    if (!url) return;
    const ext = url.split('.').pop().toLowerCase();
    if (!['mp4', 'webm', 'ogg', 'mov'].includes(ext)) {
      // imagen: no thumbnail necesario
      setThumb(url);
      return;
    }
    // video: generarlo solo cuando el elemento esté visible
    let obs;
    const node = elRef.current;
    const startGeneration = async () => {
      if (generating || thumb) return;
      setGenerating(true);
      try {
        const t = await getVideoThumbnail(url);
        setThumb(t || '');
      } finally {
        setGenerating(false);
      }
    };
    if (node && 'IntersectionObserver' in window) {
      obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startGeneration();
              if (obs && node) obs.unobserve(node);
            }
          });
        },
        { rootMargin: '200px' }
      );
      obs.observe(node);
    } else {
      // fallback: generar inmediatamente
      startGeneration();
    }
    return () => {
      if (obs && node) obs.unobserve(node);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, elRef.current]);

  const ext = url ? url.split('.').pop().toLowerCase() : '';

  // muestra placeholder cuando no hay url
  if (!url) {
    return (
      <img
        ref={elRef}
        src="/default-image.png"
        alt="Sin preview disponible"
        loading="lazy"
        className="card-img-top"
        style={{
          height: 220,
          objectFit: 'cover',
          borderRadius: '12px 12px 0 0',
          background: '#fafafa',
        }}
        onError={(e) => {
          e.currentTarget.src = '/default-image.png';
        }}
      />
    );
  }

  if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) {
    return thumb ? (
      <img
        ref={elRef}
        src={thumb}
        alt="Preview de video"
        loading="lazy"
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
        ref={elRef}
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

  // imagen normal
  return (
    <img
      ref={elRef}
      src={url}
      alt="Preview"
      loading="lazy"
      className="card-img-top"
      style={{
        height: 220,
        objectFit: 'cover',
        borderRadius: '12px 12px 0 0',
        background: '#fafafa',
      }}
      onError={(e) => {
        e.currentTarget.src = '/default-image.png';
      }}
    />
  );
};

// Sección publicaciones
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
        setError(err?.message || 'Error al cargar publicaciones');
      } finally {
        setLoading(false);
      }
    };
    cargarPublicaciones();
  }, []);

  const publicacionesPreview = publicaciones.slice(0, 6);

  return (
    <section className="container my-5" aria-labelledby="publicaciones-title">
      <h2 id="publicaciones-title" className="mb-4 text-center" style={{ color: '#603c7e' }}>
        Publicaciones recientes de la comunidad
      </h2>

      {loading && (
        <div className="row">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && publicacionesPreview.length === 0 && (
        <div className="text-center text-muted">No hay publicaciones disponibles. Sé el primero en compartir.</div>
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
            >
              <Link to={`/publicacion/${pub._id}`} aria-label={`Ver publicación ${acortarTexto(pub.contenido || '', 40)}`}>
                <MultimediaPreview
                  url={
                    pub.multimedia && pub.multimedia.length > 0
                      ? pub.multimedia[0]
                      : '/default-image.png'
                  }
                />
              </Link>
              <div className="card-body">
                <Link
                  to={`/perfil/${pub.autorId?.nombreUsuario}`}
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginBottom: 8 }}
                  aria-label={`Ir al perfil de ${pub.autorId?.nombreCompleto || pub.autorId?.nombreUsuario || 'usuario'}`}
                >
                  <img
                    src={pub.autorId?.fotoPerfil || placeholderImage}
                    alt={pub.autorId?.anonimo ? 'Avatar anónimo' : `${pub.autorId?.nombreCompleto || pub.autorId?.nombreUsuario} avatar`}
                    loading="lazy"
                    className="rounded-circle me-2"
                    style={{ width: 32, height: 32, objectFit: 'cover', border: '2px solid #603c7e' }}
                    onError={(e) => {
                      e.currentTarget.src = placeholderImage;
                    }}
                  />
                  <span className="fw-bold" style={{ color: '#603c7e', fontSize: '1rem' }}>
                    {pub.autorId?.anonimo ? 'Anónimo' : (pub.autorId?.nombreCompleto || pub.autorId?.nombreUsuario)}
                  </span>
                  <span className="ms-auto text-muted" style={{ fontSize: '0.85rem' }}>
                    {pub.fecha ? new Date(pub.fecha).toLocaleDateString() : ''}
                  </span>
                </Link>
                <p className="mt-2 mb-2" style={{ fontSize: '1rem', color: '#334155', minHeight: 40 }}>
                  {acortarTexto(pub.contenido || '', 100)}
                </p>
                <div className="d-flex align-items-center mt-1">
                  <span className="me-3" style={{ color: '#603c7e', fontWeight: 'bold', fontSize: '0.95rem' }}>
                    <i className="bi bi-heart-fill" style={{ marginRight: 4 }} aria-hidden="true"></i>
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
                  <Link
                    to={`/publicacion/${pub._id}`}
                    className="btn btn-sm btn-outline-primary"
                    style={{ borderRadius: 8, fontWeight: 500 }}
                  >
                    Ver más
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {publicaciones.length > 6 && (
        <div className="row justify-content-center mt-3">
          <div className="col-md-4 text-center">
            <Link
              to="/publicaciones"
              className="btn btn-lg btn-primary"
              style={{ borderRadius: 12, fontWeight: 600 }}
            >
              Ver más publicaciones
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};

// Sección foro populares
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
        setErrorForo(err?.message || 'Error al cargar publicaciones del foro');
      } finally {
        setLoadingForo(false);
      }
    };
    cargarForoPopulares();
  }, []);

  return (
    <section className="container my-5" aria-labelledby="foro-title">
      <h2 id="foro-title" className="mb-4 text-center" style={{ color: '#603c7e' }}>
        Foro: Temas más populares
      </h2>
      <div className={styles.foroSectionContainer} role="list">
        <div className={styles.foroHeaderRow}>
          <span>Tema</span>
          <span>Autor</span>
          <span>Likes</span>
          <span>Comentarios</span>
          <span></span>
        </div>

        {loadingForo && <div className={styles.foroLoading}>Cargando publicaciones del foro...</div>}
        {errorForo && <div className={`alert alert-danger ${styles.foroError}`}>{errorForo}</div>}
        {!loadingForo && foroPopulares.length === 0 && <div className={styles.foroEmpty}>No hay publicaciones del foro.</div>}

        {foroPopulares.map((pub, idx) => {
          const fullAuthor =
            pub.autorId?.anonimo
              ? 'Anónimo'
              : pub.autorId?.nombreCompleto || pub.autorId?.nombreUsuario || 'Usuario';
          const displayAuthor = pub.autorId?.anonimo ? 'Anónimo' : acortarTexto(fullAuthor, 12);
          return (
            <Link
              key={pub._id}
              to={`/publicacion/${pub._id}`}
              className={`${styles.foroRow} ${idx % 2 === 0 ? '' : styles.foroRowAlt}`}
              role="listitem"
              aria-label={`Abrir tema: ${acortarTexto(pub.contenido || 'Sin título', 80)}`}
            >
              <span className={styles.foroTema}>
                {acortarTexto(pub.contenido || 'Sin título', 70)}
              </span>
              <span className={styles.foroAutor} title={fullAuthor}>
                <img
                  src={pub.autorId?.fotoPerfil || placeholderImage}
                  alt={pub.autorId?.anonimo ? 'Avatar anónimo' : `${fullAuthor} avatar`}
                  loading="lazy"
                  className={styles.foroAutorImg}
                  onError={(e) => {
                    e.currentTarget.src = placeholderImage;
                  }}
                />
                <span className={styles.foroAutorNombre}>
                  {displayAuthor}
                </span>
              </span>

              <span className={styles.foroLikes} aria-hidden="true">
                <i className="bi bi-heart-fill" style={{ marginRight: 4 }}></i>
                {Array.isArray(pub.likes) ? pub.likes.length : 0}
              </span>
              <span className={styles.foroComentarios} aria-hidden="true">
                <i className="bi bi-chat-left-text" style={{ marginRight: 4 }}></i>
                {pub.comentarios?.length !== undefined ? pub.comentarios.length : '0'}
              </span>
              <span></span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

// HomePage principal
const HomePage = () => {
  return (
    <main className={styles.homeContainer}>
      <div className={styles.navbarSpacer}>
        <WelcomeSection />
        <PublicacionesSection />
        <ForoPopularesSection />
        <ExpertsSection />
      </div>
    </main>
  );
};

export default HomePage;
