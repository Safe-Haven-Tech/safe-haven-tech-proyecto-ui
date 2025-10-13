import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { fetchPublicaciones, deletePublicacion } from '../../services/publicacionesService';
import styles from './ForoPage.module.css';
import placeholder from '../../assets/perfil_placeholder.png';

const LIMITE_POR_PAGINA = 15;

// Lista de tópicos (ajusta según tus datos)
const TOPICOS_FORO = [
  'violencia física',
  'violencia psicológica',
  'violencia económica',
  'violencia digital',
  'apoyo emocional',
  'recursos legales',
  'experiencias personales',
  'recuperación y autocuidado',
  'familia y entorno',
  'denuncias y procesos legales',
  'prevención',
  'orientación profesional',
  'comunidad y redes de apoyo',
  'otros'
];

function getUsuarioIdFromToken(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.id || decoded._id || null;
  } catch {
    return null;
  }
}

function getUsuarioRolFromToken(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.rol || decoded.role || null;
  } catch {
    return null;
  }
}

function acortarTexto(texto, max = 57) {
  if (!texto) return '';
  return texto.length > max ? texto.slice(0, max) + '...' : texto;
}

const ForoPage = () => {
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('recientes');
  const [temas, setTemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [topicoSeleccionado, setTopicoSeleccionado] = useState('todos');

  const token = localStorage.getItem('token');
  const usuarioId = getUsuarioIdFromToken(token);
  const usuarioRol = getUsuarioRolFromToken(token);

  useEffect(() => {
    const cargarTemas = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchPublicaciones({
          pagina,
          limite: LIMITE_POR_PAGINA,
          tipo: 'foro',
          topico: topicoSeleccionado !== 'todos' ? topicoSeleccionado : undefined
        });
        setTemas(data.publicaciones || []);
        if (data.totalPaginas) {
          setTotalPaginas(data.totalPaginas);
        } else if (data.total) {
          setTotalPaginas(Math.ceil(data.total / LIMITE_POR_PAGINA));
        } else {
          setTotalPaginas(1);
        }
      } catch (err) {
        setError(err.message || 'Error al cargar temas del foro');
      } finally {
        setLoading(false);
      }
    };
    cargarTemas();
  }, [pagina, topicoSeleccionado]);

  // Cierra el menú al hacer click fuera
  useEffect(() => {
    const handleClick = () => setMenuAbierto(null);
    if (menuAbierto) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuAbierto]);

  const handleBusqueda = (e) => setBusqueda(e.target.value);

  let temasFiltrados = temas.filter(t =>
    (t.contenido || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  if (filtro === 'populares') {
    temasFiltrados = temasFiltrados.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
  } else if (filtro === 'sinresponder') {
    temasFiltrados = temasFiltrados.filter(t => !t.comentarios || t.comentarios.length === 0);
  } else {
    temasFiltrados = temasFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }

  const handleBorrarTema = async (id) => {
    try {
      await deletePublicacion(id, token);
      setTemas(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      alert(err.message || 'Error al borrar el tema');
    }
  };

  // Renderiza el menú desplegable como portal
  const renderDropdownMenu = (temaId) => {
    if (menuAbierto !== temaId) return null;
    return ReactDOM.createPortal(
      <ul
        className={`dropdown-menu show ${styles.foroDropdownMenu}`}
        style={{
          position: 'fixed',
          top: menuPos.top,
          left: menuPos.left,
          zIndex: 9999
        }}
      >
        <li>
          <a className="dropdown-item" href={`/editar-post/${temaId}`} onClick={e => e.stopPropagation()}>
            <i className="bi bi-pencil me-2"></i>Editar
          </a>
        </li>
        <li>
          <button
            className="dropdown-item text-danger"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              if (window.confirm('¿Seguro que deseas borrar este tema?')) {
                handleBorrarTema(temaId);
                setMenuAbierto(null);
              }
            }}
          >
            <i className="bi bi-trash me-2"></i>Borrar
          </button>
        </li>
        <li>
          <button
            className="dropdown-item"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              navigator.clipboard.writeText(`${window.location.origin}/publicacion/${temaId}`);
              alert('¡Enlace copiado!');
              setMenuAbierto(null);
            }}
          >
            <i className="bi bi-share me-2"></i>Compartir
          </button>
        </li>
      </ul>,
      document.body
    );
  };

  // Mensaje de bienvenida con estilos de módulo
  const mensajeBienvenida = (
    <div className={styles.foroBienvenida}>
      <span className={styles.foroBienvenidaIcon} role="img" aria-label="Bienvenida"></span>
      <span>
        ¡Bienvenida/o a la comunidad SafeHaven! Este es un espacio seguro para compartir, preguntar y acompañarnos en el proceso de sanar y salir adelante tras situaciones de violencia de género. Recuerda que no estás sola/o, aquí puedes encontrar apoyo, información y experiencias de otras personas que han pasado por lo mismo. Si necesitas ayuda urgente, busca los recursos legales y profesionales en la plataforma.
      </span>
    </div>
  );

  return (
    <div className={styles.foroPageContainer}>
      <div className="container py-4">
        {mensajeBienvenida}
        <div className="row">
          {/* Sidebar de tópicos */}
          <div className="col-12 col-md-3 mb-3">
            <div className={styles.foroTopicosSidebar}>
              <button
                className={`${styles.foroTopicoBtn} ${topicoSeleccionado === 'todos' ? styles.foroTopicoBtnActive : ''}`}
                onClick={() => { setTopicoSeleccionado('todos'); setPagina(1); }}
              >
                Todos los tópicos
              </button>
              {TOPICOS_FORO.map(topico => (
                <button
                  key={topico}
                  className={`${styles.foroTopicoBtn} ${topicoSeleccionado === topico ? styles.foroTopicoBtnActive : ''}`}
                  onClick={() => { setTopicoSeleccionado(topico); setPagina(1); }}
                >
                  {topico.charAt(0).toUpperCase() + topico.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {/* Contenido principal */}
          <div className="col-12 col-md-9">
            <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar en el foro..."
                value={busqueda}
                onChange={handleBusqueda}
                style={{ maxWidth: 400, borderRadius: 8, border: '1.5px solid #e5d1f2' }}
              />
              <select
                className="form-select"
                style={{ maxWidth: 220, borderRadius: 8, border: '1.5px solid #e5d1f2' }}
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
              >
                <option value="recientes">Más recientes</option>
                <option value="populares">Más populares</option>
                <option value="sinresponder">Sin responder</option>
              </select>
              <button
                className="btn btn-primary"
                style={{
                  borderRadius: 10,
                  fontWeight: 600,
                  background: '#8e44ad',
                  border: 'none',
                  minWidth: 160,
      
                }}
                onClick={() => window.location.href = '/crear-foro'}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Crear publicación
              </button>
            </div>

            <div className="mt-3">
              {loading && <div className={styles.foroLoading}>Cargando temas...</div>}
              {error && <div className={`alert alert-danger ${styles.foroError}`}>{error}</div>}
              {!loading && temasFiltrados.length === 0 && (
                <>
                  <div className={styles.foroEmpty}>No hay temas en el foro.</div>
                  <div className={styles.foroEmpty}>Te invitamos a crear la primer publicacion.</div>
                </>
              )}
              {!loading && temasFiltrados.length > 0 && (
                <div className={styles.foroTableContainer}>
                  <div className={styles.foroHeaderRow}>
                    <span>Tema</span>
                    <span>Autor</span>
                    <span>Fecha</span>
                    <span>Likes</span>
                    <span>Comentarios</span>
                    <span></span>
                  </div>
                  {temasFiltrados.map((tema, idx) => {
                    // Badges visuales
                    const esPopular = tema.likes?.length >= 5;
                    const esNuevo = (Date.now() - new Date(tema.fecha)) < 1000 * 60 * 60 * 24 * 2;
                    const sinRespuesta = !tema.comentarios || tema.comentarios.length === 0;

                    return (
                      <div
                        key={tema._id}
                        className={`${styles.foroRow} ${idx % 2 === 0 ? '' : styles.foroRowAlt}`}
                        tabIndex={0}
                        role="button"
                        aria-label={`Ver tema: ${acortarTexto(tema.contenido, 57) || 'Sin título'}`}
                        onClick={() => window.location.href = `/publicacion/${tema._id}`}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') window.location.href = `/publicacion/${tema._id}`;
                        }}
                        style={{ position: 'relative' }}
                      >
                        <span className={styles.foroTema}>
                          {acortarTexto(tema.contenido, 57) || 'Sin título'}
                          {esPopular && (
                            <span className={`${styles.foroBadge} ${styles.foroBadgePopular}`} title="Popular">
                              <i className="bi bi-fire"></i>
                            </span>
                          )}
                          {esNuevo && (
                            <span className={`${styles.foroBadge} ${styles.foroBadgeNuevo}`} title="Nuevo">
                              <i className="bi bi-star-fill"></i>
                            </span>
                          )}
                          {sinRespuesta && (
                            <span className={`${styles.foroBadge} ${styles.foroBadgeSinRespuesta}`} title="Sin respuesta">
                              <i className="bi bi-question-circle"></i>
                            </span>
                          )}
                        </span>
                        <span className={styles.foroAutor}>
                          <img
                            src={tema.autorId?.fotoPerfil || placeholder}
                            alt="Avatar"
                            className={styles.foroAutorImg}
                          />
                          <span className={styles.foroAutorNombre}>
                            {tema.autorId?.anonimo
                              ? 'Anónimo'
                              : tema.autorId?.nombreCompleto ||
                                tema.autorId?.nombreUsuario ||
                                'Usuario'}
                          </span>
                        </span>
                        <span className={styles.foroFecha}>
                          {new Date(tema.fecha).toLocaleDateString()}
                        </span>
                        <span className={styles.foroLikes}>
                          <i className="bi bi-heart-fill" style={{ marginRight: 4 }}></i>
                          {Array.isArray(tema.likes) ? tema.likes.length : 0}
                        </span>
                        <span className={styles.foroComentarios}>
                          <i className="bi bi-chat-left-text" style={{ marginRight: 4 }}></i>
                          {tema.comentarios?.length || 0}
                        </span>
                        {/* Acciones rápidas */}
                        <span
                          className={styles.foroAcciones}
                          onClick={e => e.stopPropagation()}
                          style={{ position: 'relative' }}
                        >
                          {(usuarioId && (tema.autorId?._id === usuarioId || tema.autorId === usuarioId || usuarioRol === 'admin' || usuarioRol === 'administrador')) && (
                            <>
                              <button
                                className={`btn btn-light btn-sm ${styles.foroDropdownBtn}`}
                                type="button"
                                aria-label="Abrir menú de acciones"
                                tabIndex={0}
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setMenuAbierto(menuAbierto === tema._id ? null : tema._id);
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setMenuPos({
                                    top: rect.bottom + window.scrollY,
                                    left: rect.right - 160 + window.scrollX // 160 = ancho aprox del menú
                                  });
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    setMenuAbierto(menuAbierto === tema._id ? null : tema._id);
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setMenuPos({
                                      top: rect.bottom + window.scrollY,
                                      left: rect.right - 160 + window.scrollX
                                    });
                                  }
                                }}
                              >
                                <i className="bi bi-three-dots-vertical"></i>
                              </button>
                              {renderDropdownMenu(tema._id)}
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Paginación */}
              {!loading && temasFiltrados.length > 0 && totalPaginas > 1 && (
                <nav className="d-flex justify-content-center mt-4">
                  <ul className="pagination">
                    <li className={`page-item${pagina === 1 ? ' disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPagina(pagina - 1)}>&laquo;</button>
                    </li>
                    {[...Array(totalPaginas)].map((_, idx) => (
                      <li key={idx} className={`page-item${pagina === idx + 1 ? ' active' : ''}`}>
                        <button className="page-link" onClick={() => setPagina(idx + 1)}>{idx + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item${pagina === totalPaginas ? ' disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPagina(pagina + 1)}>&raquo;</button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForoPage;