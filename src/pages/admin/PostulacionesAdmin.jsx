import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import styles from './ResourcesManagement.module.css';
import {
  adminListPostulaciones,
  adminGetPostulacionById,
  adminDecidirPostulacion,
} from '../../services/postulacionService';
import PostulacionDetailModal from '../../components/Admin/Postulacion/PostulacionDetail.modal';

const STAT_FETCH_LIMIT = 10000;

const ConfirmModal = ({
  show,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}) => {
  if (!show) return null;
  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 1202 }}
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button
            className={styles.closeButton}
            onClick={onCancel}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className={styles.modalContent}>
          <p style={{ whiteSpace: 'pre-wrap' }}>{message}</p>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            {cancelText}
          </button>
          <button className={styles.saveButton} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoModal = ({ show, title, message, onClose, okText = 'Aceptar' }) => {
  if (!show) return null;
  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 1202 }}
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className={styles.modalContent}>
          <p style={{ whiteSpace: 'pre-wrap' }}>{message}</p>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.saveButton} onClick={onClose}>
            {okText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PostulacionesAdmin() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(null);

  // Estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    porEstado: { pendiente: 0, aprobada: 0, rechazada: 0 },
  });
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(true);

  // UI modals (confirm + info)
  const [confirmState, setConfirmState] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
  });
  const [infoState, setInfoState] = useState({
    show: false,
    title: '',
    message: '',
    onClose: null,
  });

  const fetchList = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminListPostulaciones(token, {
          page,
          limit: meta.limit,
          estado: estado || undefined,
          q: q || undefined,
        });
        const data = res?.data || res?.postulaciones || [];
        const m = res?.meta || res?.paginacion || {};
        setItems(Array.isArray(data) ? data : []);
        setMeta({
          page: m.page || page,
          limit: m.limit || meta.limit,
          total: m.total || 0,
          pages: m.pages || m.totalPaginas || 1,
        });
      } catch (err) {
        console.error(err);
        setError(err?.message || 'Error cargando postulaciones');
      } finally {
        setLoading(false);
      }
    },
    [token, meta.limit, estado, q]
  );

  const fetchStats = useCallback(async () => {
    setLoadingEstadisticas(true);
    try {
      const res = await adminListPostulaciones(token, {
        page: 1,
        limit: STAT_FETCH_LIMIT,
      });
      const list = res?.data || res?.postulaciones || [];
      const arr = Array.isArray(list) ? list : [];
      const totals = { pendiente: 0, aprobada: 0, rechazada: 0 };
      for (const p of arr) {
        const e = (p.estado || p.status || '').toString().toLowerCase();
        if (e === 'aprobada' || e === 'aprobado' || e === 'aceptada')
          totals.aprobada += 1;
        else if (e === 'rechazada' || e === 'rechazado') totals.rechazada += 1;
        else totals.pendiente += 1;
      }
      setEstadisticas({ total: arr.length, porEstado: totals });
    } catch (err) {
      // fallback: calcular sobre la página actual
      const totals = { pendiente: 0, aprobada: 0, rechazada: 0 };
      for (const p of items) {
        const e = (p.estado || p.status || '').toString().toLowerCase();
        if (e === 'aprobada' || e === 'aprobado' || e === 'aceptada')
          totals.aprobada += 1;
        else if (e === 'rechazada' || e === 'rechazado') totals.rechazada += 1;
        else totals.pendiente += 1;
      }
      setEstadisticas({ total: meta.total || items.length, porEstado: totals });
    } finally {
      setLoadingEstadisticas(false);
    }
  }, [token, items, meta.total]);

  useEffect(() => {
    fetchList(1);
  }, [fetchList]);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onSearch = (e) => {
    e && e.preventDefault && e.preventDefault();
    fetchList(1);
  };

  const openDetail = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetPostulacionById(token, id);
      const payload = res?.data || res?.postulacion || res;
      setSelected(payload);
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Error cargando detalle');
    } finally {
      setLoading(false);
    }
  };

  // Acción real que realiza la decisión (aceptar/denegar)
  const decidirPostulacion = async (id, accion, motivo = '') => {
    setConfirmState((s) => ({ ...s, show: false, onConfirm: null }));
    setLoading(true);
    setError(null);
    try {
      await adminDecidirPostulacion(token, id, accion, motivo);
      await fetchList(meta.page);
      await fetchStats();
      if (modalOpen) {
        setModalOpen(false);
        setSelected(null);
      }
      setInfoState({
        show: true,
        title: 'Operación exitosa',
        message:
          accion === 'aceptar'
            ? 'La postulación fue aceptada.'
            : 'La postulación fue denegada.',
        onClose: null,
      });
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Error al actualizar postulación');
      setInfoState({
        show: true,
        title: 'Error',
        message: err?.message || 'Error al ejecutar la acción.',
        onClose: null,
      });
    } finally {
      setLoading(false);
    }
  };

  // Solicita confirmación para aceptar
  const requestAccept = (id) => {
    setConfirmState({
      show: true,
      title: 'Confirmar aceptación',
      message: '¿Confirmar aprobación de esta postulación?',
      onConfirm: () => decidirPostulacion(id, 'aceptar', ''),
    });
  };

  // Solicita confirmación para denegar (se espera que motivo ya venga desde modal)
  const requestDeny = (id, motivo) => {
    if (!motivo || motivo.trim().length === 0) {
      setInfoState({
        show: true,
        title: 'Motivo requerido',
        message: 'Debes indicar un motivo para denegar la postulación.',
        onClose: null,
      });
      return;
    }
    setConfirmState({
      show: true,
      title: 'Confirmar denegación',
      message: '¿Confirmar denegación de esta postulación?',
      onConfirm: () => decidirPostulacion(id, 'denegar', motivo.trim()),
    });
  };

  const handlePage = (n) => {
    fetchList(n);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent} style={{ width: '100%' }}>
          <div className={styles.headerLeft}>
            <div className={styles.headerTitle}>
              <h1>Gestión de Postulaciones</h1>
              <p>Revisar y decidir postulaciones</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className={styles.searchBox} style={{ minWidth: 220 }}>
              <input
                className={styles.searchInput}
                placeholder="Buscar por nombre, correo o texto"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <select
              className={styles.filterSelect}
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </select>

            <button className={styles.createButton} onClick={onSearch}>
              Buscar
            </button>
            <button
              className={styles.createButton}
              style={{ background: '#6b7280' }}
              onClick={() => {
                setQ('');
                setEstado('');
                fetchList(1);
              }}
            >
              Limpiar
            </button>
          </div>
        </div>
      </header>

      {/* Estadísticas */}
      <section className={styles.statsSection} style={{ marginBottom: 16 }}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {loadingEstadisticas ? '—' : estadisticas.total}
              </div>
              <div className={styles.statLabel}>Total postulaciones</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {loadingEstadisticas ? '—' : estadisticas.porEstado.pendiente}
              </div>
              <div className={styles.statLabel}>Pendientes</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {loadingEstadisticas ? '—' : estadisticas.porEstado.aprobada}
              </div>
              <div className={styles.statLabel}>Aprobadas</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {loadingEstadisticas ? '—' : estadisticas.porEstado.rechazada}
              </div>
              <div className={styles.statLabel}>Rechazadas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Listado en tarjetas*/}
      <section className={styles.resourcesSection}>
        {error && <div className={styles.error}>{error}</div>}
        {loading && <p className={styles.loading}>Cargando...</p>}
        {!loading && items.length === 0 && (
          <p className={styles.noResources}>No hay postulaciones</p>
        )}

        {!loading && items.length > 0 && (
          <>
            <div className={styles.resourcesGrid}>
              {items.map((p) => {
                const solicitante = p.usuario || p.solicitante || p.autor || {};
                const nombre =
                  solicitante.nombre ||
                  solicitante.username ||
                  p.nombreSolicitante ||
                  'Solicitante';
                const especialidad =
                  p.especialidad || p.categoria || p.area || '—';
                const estadoTexto = p.estado || p.status || 'pendiente';
                return (
                  <article key={p._id || p.id} className={styles.resourceCard}>
                    <div className={styles.resourceHeader}>
                      <span className={styles.resourceType}>
                        {especialidad}
                      </span>
                      <span
                        className={styles.featuredBadge}
                        style={{ marginLeft: 8 }}
                      >
                        {estadoTexto}
                      </span>
                    </div>

                    <div className={styles.resourceContent}>
                      <h3 className={styles.resourceTitle}>{nombre}</h3>
                      <p className={styles.resourceDescription}>
                        {p.resumen ||
                          p.mensaje ||
                          p.descripcion ||
                          p.observaciones || <em>Sin descripción</em>}
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
                        Creada:{' '}
                        {new Date(
                          p.createdAt || p.fecha || Date.now()
                        ).toLocaleString()}
                        {p.email && (
                          <div style={{ marginTop: 6 }}>Email: {p.email}</div>
                        )}
                      </div>

                      <div
                        className={styles.resourceActions}
                        style={{ display: 'flex', gap: 8 }}
                      >
                        <button
                          className={styles.editButton}
                          onClick={() => openDetail(p._id || p.id)}
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
                disabled={meta.page <= 1 || loading}
                onClick={() => handlePage(meta.page - 1)}
              >
                Anterior
              </button>
              <div className={styles.paginationInfo}>
                Página {meta.page} de {meta.pages} — {meta.total} resultados
              </div>
              <button
                className={styles.paginationButton}
                disabled={meta.page >= meta.pages || loading}
                onClick={() => handlePage(meta.page + 1)}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </section>

      {modalOpen && selected && (
        <PostulacionDetailModal
          postulacion={selected}
          onClose={() => {
            setModalOpen(false);
            setSelected(null);
          }}
          onRequestAccept={(id) => requestAccept(id)}
          onRequestDeny={(id, motivo) => requestDeny(id, motivo)}
        />
      )}

      <ConfirmModal
        show={confirmState.show}
        title={confirmState.title}
        message={confirmState.message}
        onCancel={() =>
          setConfirmState((s) => ({ ...s, show: false, onConfirm: null }))
        }
        onConfirm={() => {
          if (typeof confirmState.onConfirm === 'function')
            confirmState.onConfirm();
          else setConfirmState((s) => ({ ...s, show: false }));
        }}
        confirmText="Confirmar"
        cancelText="Cancelar"
      />

      <InfoModal
        show={infoState.show}
        title={infoState.title}
        message={infoState.message}
        onClose={() =>
          setInfoState({ show: false, title: '', message: '', onClose: null })
        }
        okText="Aceptar"
      />
    </div>
  );
}
