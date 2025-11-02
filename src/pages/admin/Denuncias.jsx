import React, { useEffect, useState } from 'react';
import styles from './PostulacionesAdmin.module.css';
import { useAuth } from '../../hooks/useAuth';
import {
  adminListPostulaciones,
  adminGetPostulacionById,
  adminDecidirPostulacion
} from '../../services/postulacionService';
import PostulacionRow from '../../components/Admin/Postulacion/PostulacionRow';
import PostulacionDetailModal from '../../components/Admin/Postulacion/PostulacionDetail.modal';

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
  const [focusMotivo, setFocusMotivo] = useState(false);

  const fetchList = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminListPostulaciones(token, { page, limit: meta.limit, estado: estado || undefined, q: q || undefined });
      const data = res?.data || res?.postulaciones || [];
      const m = res?.meta || res?.paginacion || {};
      setItems(data);
      setMeta({ page: m.page || page, limit: m.limit || meta.limit, total: m.total || 0, pages: m.pages || m.totalPaginas || 1 });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error cargando postulaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(1); }, []); // eslint-disable-line

  const onSearch = (e) => {
    e.preventDefault();
    fetchList(1);
  };

  // ahora openDetail acepta opciones { focusMotivo: boolean }
  const openDetail = async (id, options = {}) => {
    setLoading(true);
    try {
      const res = await adminGetPostulacionById(token, id);
      const payload = res?.data || res?.postulacion || res;
      setSelected(payload);
      setModalOpen(true);
      setFocusMotivo(!!options.focusMotivo);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error cargando detalle');
    } finally {
      setLoading(false);
    }
  };

  const onDecidir = async (id, accion, motivo = '') => {
    setLoading(true);
    setError(null);
    try {
      await adminDecidirPostulacion(token, id, accion, motivo);
      // esperar OK -> refrescar lista y cerrar modal si abierto
      await fetchList(meta.page);
      if (modalOpen) {
        setModalOpen(false);
        setSelected(null);
      }
      setFocusMotivo(false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al actualizar postulación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminRoot}>
      <h1 className={styles.title}>Gestión de Postulaciones</h1>

      <form className={styles.filters} onSubmit={onSearch}>
        <input className={styles.input} placeholder="Buscar por nombre, correo o texto" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={styles.select} value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
        </select>
        <button type="submit" className={styles.btn}>Buscar</button>
        <button type="button" className={styles.btnSecondary} onClick={() => { setQ(''); setEstado(''); fetchList(1); }}>Limpiar</button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Especialidad</th>
              <th>Estado</th>
              <th>Creada</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="5" className={styles.center}>Cargando...</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan="5" className={styles.center}>No hay postulaciones</td></tr>}
            {!loading && items.map((p) => (
              <PostulacionRow
                key={p._id}
                postulacion={p}
                onView={() => openDetail(p._id)}
                onQuickDecidir={async (accion) => {
                  if (accion === 'aceptar') {
                    if (!confirm('Confirmar aprobación?')) return;
                    await onDecidir(p._id, 'aceptar');
                  } else if (accion === 'denegar' || accion === 'rechazar') {
                    // abrir modal para ingresar motivo
                    openDetail(p._id, { focusMotivo: true });
                  }
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <button disabled={meta.page <= 1 || loading} onClick={() => fetchList(meta.page - 1)}>Anterior</button>
        <span> página {meta.page} de {meta.pages} </span>
        <button disabled={meta.page >= meta.pages || loading} onClick={() => fetchList(meta.page + 1)}>Siguiente</button>
      </div>

      {modalOpen && selected && (
        <PostulacionDetailModal
          postulacion={selected}
          onClose={() => { setModalOpen(false); setSelected(null); setFocusMotivo(false); }}
          onDecidir={onDecidir}
          loading={loading}
          autoFocusRejection={focusMotivo}
        />
      )}
    </div>
  );
}