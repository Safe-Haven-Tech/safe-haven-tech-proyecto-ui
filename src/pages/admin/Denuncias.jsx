import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ResourcesManagement.module.css';
import { fetchDenuncias } from '../../services/DenunciasServices';
import { fetchPublicacionPorId } from '../../services/publicacionesService';

function getUsuarioRolFromToken(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1] || '';
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    const padded = b64 + (pad ? '='.repeat(4 - pad) : '');
    const decoded = JSON.parse(atob(padded));
    return decoded.rol || null;
  } catch {
    return null;
  }
}

const TIPO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'publicacion', label: 'Publicación' },
  { value: 'comentario', label: 'Comentario' },
  { value: 'usuario', label: 'Usuario' },
];

export default function DenunciasPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const usuarioRol = getUsuarioRolFromToken(token);

  // datos
  const [allDenuncias, setAllDenuncias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // filtros + paginación
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo: '',
    estado: '',
    pagina: 1,
    limite: 12,
  });

  // estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    porTipo: { publicacion: 0, comentario: 0, usuario: 0 },
  });
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(true);

  const requestRef = useRef(0);

  const fetchAll = useCallback(async () => {
    if (usuarioRol !== 'administrador') return;
    const reqId = ++requestRef.current;
    try {
      setLoading(true);
      setError('');
      const data = await fetchDenuncias(undefined, token);
      if (requestRef.current !== reqId) return;
      const list = Array.isArray(data) ? data : [];
      setAllDenuncias(list);

      const pubIds = [
        ...new Set(
          list
            .filter(
              (d) =>
                (d?.tipoDenuncia || d?.tipo) === 'publicacion' &&
                d?.publicacionId
            )
            .map((d) =>
              d.publicacionId && typeof d.publicacionId === 'object'
                ? d.publicacionId._id || d.publicacionId.id
                : d.publicacionId
            )
            .filter(Boolean)
        ),
      ];
      if (pubIds.length > 0) {
        const cache = new Map();
        await Promise.all(
          pubIds.map((id) =>
            fetchPublicacionPorId(id, token)
              .then((p) => cache.set(id, p))
              .catch(() => cache.set(id, null))
          )
        );
        if (requestRef.current !== reqId) return;
        setAllDenuncias((prev) =>
          prev.map((d) => {
            const pid =
              d?.publicacionId && typeof d.publicacionId === 'object'
                ? d.publicacionId._id || d.publicacionId.id
                : d?.publicacionId;
            if (pid && cache.has(pid))
              return { ...d, _publicacion: cache.get(pid) };
            return d;
          })
        );
      }
    } catch (err) {
      if (requestRef.current !== reqId) return;
      console.error(err);
      setError(err?.message || 'Error al cargar denuncias');
    } finally {
      if (requestRef.current === reqId) setLoading(false);
    }
  }, [token, usuarioRol]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // calcular estadísticas globales
  useEffect(() => {
    setLoadingEstadisticas(true);
    const totals = { publicacion: 0, comentario: 0, usuario: 0 };
    for (const d of allDenuncias) {
      const t = (d?.tipoDenuncia || d?.tipo || '').toString();
      if (t === 'publicacion') totals.publicacion += 1;
      else if (t === 'comentario') totals.comentario += 1;
      else if (t === 'usuario') totals.usuario += 1;
    }
    setEstadisticas({ total: allDenuncias.length, porTipo: totals });
    setLoadingEstadisticas(false);
  }, [allDenuncias]);

  // filtrado y paginación en cliente
  const filtered = useMemo(() => {
    const q = (filtros.busqueda || '').trim().toLowerCase();
    return allDenuncias.filter((d) => {
      if (!d) return false;

      // ocultar denuncias ya resueltas
      const estadoVal = (d?.estado || d?.status || '').toString().toLowerCase();
      if (estadoVal === 'resuelta' || estadoVal === 'resuelto') return false;

      // filtro por tipo si se especifica
      if (filtros.tipo && (d?.tipoDenuncia || d?.tipo) !== filtros.tipo)
        return false;

      // filtro por estado si el usuario lo seleccionó
      if (filtros.estado) {
        const buscEstado = (filtros.estado || '').toString().toLowerCase();
        if (buscEstado !== estadoVal) return false;
      }

      if (!q) return true;

      const hay =
        (d?.motivo || '').toString().toLowerCase().includes(q) ||
        (d?.titulo || d?.asunto || '').toString().toLowerCase().includes(q) ||
        (d?.descripcion || '').toString().toLowerCase().includes(q) ||
        (d?._publicacion &&
          (d._publicacion.titulo || '').toString().toLowerCase().includes(q)) ||
        (d?.usuarioDenunciado &&
          (d.usuarioDenunciado.username || '')
            .toString()
            .toLowerCase()
            .includes(q)) ||
        (d?.usuarioDenunciado &&
          (d.usuarioDenunciado.nombre || '')
            .toString()
            .toLowerCase()
            .includes(q));
      return hay;
    });
  }, [allDenuncias, filtros]);

  const paginacion = useMemo(() => {
    const total = filtered.length;
    const totalPaginas = Math.max(1, Math.ceil(total / filtros.limite));
    const pagina = Math.min(Math.max(1, filtros.pagina), totalPaginas);
    const start = (pagina - 1) * filtros.limite;
    const items = filtered.slice(start, start + filtros.limite);
    return { total, totalPaginas, pagina, items };
  }, [filtered, filtros]);

  const handlePageChange = (n) => {
    setFiltros((p) => ({ ...p, pagina: n }));
  };

  const handleInputChange = (campo, valor) =>
    setFiltros((prev) => ({ ...prev, [campo]: valor, pagina: 1 }));

  if (usuarioRol !== 'administrador') {
    return (
      <div className={styles.container}>
        <div style={{ padding: 20 }}>
          <div className="alert alert-danger">
            Acceso denegado. Solo administradores pueden ver las denuncias.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent} style={{ width: '100%' }}>
          <div className={styles.headerLeft}>
            <div className={styles.headerTitle}>
              <h1>Denuncias</h1>
              <p>Revisión y seguimiento de reportes de usuarios</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className={styles.searchBox} style={{ minWidth: 220 }}>
              <input
                className={styles.searchInput}
                placeholder="Buscar motivo, título, descripción..."
                value={filtros.busqueda}
                onChange={(e) => handleInputChange('busqueda', e.target.value)}
              />
            </div>

            <select
              value={filtros.tipo}
              onChange={(e) => handleInputChange('tipo', e.target.value)}
              className={styles.filterSelect}
            >
              {TIPO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={filtros.estado}
              onChange={(e) => handleInputChange('estado', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Estado</option>
              <option value="abierto">Abierto</option>
              <option value="resuelto">Resuelto</option>
              <option value="pendiente">Pendiente</option>
            </select>

            <button
              className={styles.createButton}
              onClick={() => fetchAll()}
              title="Recargar denuncias"
            >
              Recargar
            </button>
          </div>
        </div>
      </header>

      <section className={styles.statsSection} style={{ marginBottom: 16 }}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {loadingEstadisticas ? '—' : estadisticas.total}
              </div>
              <div className={styles.statLabel}>Total denuncias</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {loadingEstadisticas ? '—' : estadisticas.porTipo.publicacion}
              </div>
              <div className={styles.statLabel}>Publicaciones</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {loadingEstadisticas ? '—' : estadisticas.porTipo.comentario}
              </div>
              <div className={styles.statLabel}>Comentarios</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {loadingEstadisticas ? '—' : estadisticas.porTipo.usuario}
              </div>
              <div className={styles.statLabel}>Usuarios</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.resourcesSection}>
        {loading && <p className={styles.loading}>Cargando...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && paginacion.total === 0 && (
          <p className={styles.noResources}>
            No hay denuncias para el filtro seleccionado.
          </p>
        )}

        {!loading && !error && (paginacion.items || []).length > 0 && (
          <>
            <div className={styles.resourcesGrid}>
              {(paginacion.items || []).filter(Boolean).map((d, idx) => {
                const key = d?._id || d?.id || `missing-${idx}`;
                const tipo = (d?.tipoDenuncia || d?.tipo || '—').toString();
                const titulo = d?.titulo || d?.asunto || `Denuncia ${key}`;
                const descripcion = d?.descripcion;
                const objetivo = (() => {
                  if ((d?.tipoDenuncia || d?.tipo) === 'publicacion') {
                    const p = d?._publicacion;
                    if (p && (p._id || p.id)) {
                      return (
                        <a
                          href={`/publicaciones/${p._id || p.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/publicaciones/${p._id || p.id}`);
                          }}
                        >
                          {p.titulo || 'Publicación'}
                        </a>
                      );
                    }
                  }
                  if ((d?.tipoDenuncia || d?.tipo) === 'usuario') {
                    const u = d?.usuarioDenunciado || d?.usuario || {};
                    if (u && (u._id || u.id)) {
                      return (
                        <a
                          href={`/usuarios/${u._id || u.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/usuarios/${u._id || u.id}`);
                          }}
                        >
                          {u.nombre || u.username || 'Usuario'}
                        </a>
                      );
                    }
                  }
                  return '—';
                })();

                return (
                  <article
                    key={key}
                    className={styles.resourceCard}
                    data-tipo={tipo}
                  >
                    <div className={styles.resourceHeader}>
                      <span className={styles.resourceType}>{tipo}</span>
                      <span
                        className={styles.featuredBadge}
                        style={{ marginLeft: 8 }}
                      >
                        {d?.motivo || 'Sin motivo'}
                      </span>
                    </div>

                    <div className={styles.resourceContent}>
                      <h3 className={styles.resourceTitle}>{titulo}</h3>
                      <p className={styles.resourceDescription}>
                        {descripcion ? (
                          descripcion.length > 160 ? (
                            descripcion.slice(0, 160) + '…'
                          ) : (
                            descripcion
                          )
                        ) : (
                          <em>Sin descripción</em>
                        )}
                      </p>
                    </div>

                    <div
                      className={styles.resourceMeta}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ color: '#6b7280', fontSize: 13 }}>
                        Objetivo: {objetivo}
                        <div style={{ marginTop: 6 }}>
                          Fecha:{' '}
                          {new Date(
                            d?.fecha || d?.createdAt || Date.now()
                          ).toLocaleString()}
                        </div>
                      </div>

                      <div
                        className={styles.resourceActions}
                        style={{ display: 'flex', gap: 8 }}
                      >
                        <button
                          className={styles.editButton}
                          onClick={() => {
                            const id = d?._id || d?.id;
                            if (id) navigate(`/admin/reportes/${id}`);
                          }}
                          aria-label={`Ver denuncia ${d?._id || d?.id || ''}`}
                        >
                          Ver
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className={styles.pagination} style={{ marginTop: 20 }}>
              <button
                className={styles.paginationButton}
                disabled={paginacion.pagina <= 1}
                onClick={() => handlePageChange(paginacion.pagina - 1)}
              >
                Anterior
              </button>
              <div className={styles.paginationInfo}>
                Página {paginacion.pagina} de {paginacion.totalPaginas} —{' '}
                {paginacion.total} resultados
              </div>
              <button
                className={styles.paginationButton}
                disabled={paginacion.pagina >= paginacion.totalPaginas}
                onClick={() => handlePageChange(paginacion.pagina + 1)}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
