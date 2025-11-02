// ...existing code...
import React, { useState, useMemo, useEffect } from 'react';
import avatar from '../../assets/perfil_placeholder.png';
import { obtenerConexiones } from '../../services/userServices';
import styles from './ChatList.module.css';

const getId = (p) => {
  if (!p && p !== 0) return undefined;
  if (typeof p === 'string' || typeof p === 'number') return String(p);
  if (p._id) return String(p._id);
  if (p.id) return String(p.id);
  return undefined;
};

// debounce hook
const useDebouncedValue = (value, delay = 300) => {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return deb;
};

const truncate = (str = '', max = 60) => (str.length > max ? str.slice(0, max - 1) + '…' : str);

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString();
};

const ChatList = ({
  chats = [],
  loading = false,
  onOpen = () => {},
  onCreateChat = () => {},
  currentUserId,
  selectedChatId = null,
  token // required to call obtenerConexiones
}) => {
  const [query, setQuery] = useState('');
  const myId = getId(currentUserId);

  // modal state for add user
  const [showAddModal, setShowAddModal] = useState(false);
  const [connQuery, setConnQuery] = useState('');
  const debConnQuery = useDebouncedValue(connQuery, 350);
  const [connLoading, setConnLoading] = useState(false);
  const [connections, setConnections] = useState([]);
  const [connError, setConnError] = useState(null);

  const loadConnections = async (q = '') => {
    if (!token) {
      setConnError('No autenticado');
      setConnections([]);
      return;
    }
    setConnLoading(true);
    setConnError(null);
    try {
      const list = await obtenerConexiones(token, { type: 'both', query: q, limit: 100 });
      setConnections(list || []);
    } catch (err) {
      console.error('Error cargando conexiones:', err);
      setConnError(err.message || 'Error cargando usuarios');
      setConnections([]);
    } finally {
      setConnLoading(false);
    }
  };

  useEffect(() => {
    if (!showAddModal) return;
    // load on open and on query change (debounced)
    loadConnections(debConnQuery);
    // eslint-disable-next-line
  }, [showAddModal, debConnQuery]);

  const filtered = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return chats;
    return chats.filter(c => {
      const participantes = Array.isArray(c.participantes) ? c.participantes : [];
      const other = participantes.find(p => getId(p) !== myId) || participantes[0] || {};
      const nombre = (other.nombreCompleto || other.nombreUsuario || '').toLowerCase();
      const ultimo = (c.ultimoMensaje && (c.ultimoMensaje.contenido || c.ultimoMensaje)) ? String(c.ultimoMensaje.contenido || c.ultimoMensaje).toLowerCase() : '';
      return nombre.includes(q) || ultimo.includes(q);
    });
  }, [chats, query, myId]);

  const handleSelectConnection = async (user) => {
    try {
      await onCreateChat(user._id || user.id || user);
      setShowAddModal(false);
    } catch (err) {
      console.error('create chat failed', err);
      alert(err.message || 'No se pudo crear el chat');
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchRow}>
        <input
          className={`${styles.searchInput} form-control`}
          placeholder="Buscar usuarios o mensajes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className={`${styles.addBtn} btn btn-outline-secondary`}
          title="Nuevo chat"
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-plus-lg"></i>
        </button>
      </div>

      {!loading && filtered.length === 0 && <div className="text-center text-muted py-3">No tienes conversaciones</div>}

      <ul className={`${styles.list} list-group list-group-flush`}>
        {filtered.map(chat => {
          const participantes = Array.isArray(chat.participantes) ? chat.participantes : [];
          const other = participantes.find(p => getId(p) !== myId) || participantes[0] || {};
          const last = chat.ultimoMensaje || {};
          const lastContent = last.contenido || last || '';
          const lastDate = last.fecha || last.date || last.createdAt || null;
          const unread = Number(chat.unreadCount || chat.noLeidos || 0);
          const isActive = String(chat._id) === String(selectedChatId);

          return (
            <li
              key={chat._id}
              className={`${styles.item} list-group-item ${isActive ? 'bg-light' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => onOpen(chat)}
            >
              <div className="d-flex align-items-start">
                <img
                  src={other?.fotoPerfil || avatar}
                  alt=""
                  width="44"
                  height="44"
                  className={styles.avatar}
                />
                <div className={styles.meta}>
                  <div className={styles.rowTop}>
                    <div className={styles.name}>{other?.nombreCompleto || other?.nombreUsuario || 'Usuario'}</div>
                    <div className={styles.time}>{formatTime(lastDate)}</div>
                  </div>

                  <div className="d-flex align-items-center">
                    <div className={styles.preview}>{truncate(String(lastContent || 'Sin mensajes'), 80)}</div>
                    {unread > 0 && (
                      <span className={styles.unreadBadge} title={`${unread} sin leer`}>{unread}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-end ms-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={(e) => { e.stopPropagation(); onOpen(chat); }}
                >
                  Abrir
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {showAddModal && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-sm" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Seleccionar usuario</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <input
                    className="form-control form-control-sm"
                    placeholder="Buscar seguidores / seguidos..."
                    value={connQuery}
                    onChange={(e) => setConnQuery(e.target.value)}
                  />
                </div>

                {connLoading && <div className="text-center text-muted py-2">Cargando...</div>}
                {connError && <div className="text-danger small">{connError}</div>}
                {!connLoading && connections.length === 0 && <div className="text-center text-muted py-2">No se encontraron usuarios</div>}

                <ul className="list-group">
                  {connections.map(u => (
                    <li
                      key={u._id || u.id}
                      className="list-group-item d-flex align-items-center justify-content-between"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center" onClick={() => handleSelectConnection(u)}>
                        <img src={u.fotoPerfil || avatar} alt="" width="40" height="40" className="rounded me-2" />
                        <div>
                          <div className="fw-bold small">{u.nombreCompleto || u.nombreUsuario}</div>
                          <div className="small text-muted">@{u.nombreUsuario}</div>
                        </div>
                      </div>
                      <div>
                        <button className="btn btn-sm btn-primary" onClick={() => handleSelectConnection(u)}>Chatear</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
