import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  obtenerNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from '../services/redSocialServices';

export default function NotificationsModal({ open, onClose, onUpdateBadge }) {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await obtenerNotificaciones(1, 50);
        if (!mounted) return;
        const items = Array.isArray(res.notificaciones) ? res.notificaciones : [];
        setNotifs(items);

        // intentar leer contador desde respuesta, si no está calcularlo
        const noLeidas =
          (res.paginacion && (res.paginacion.noLeidas ?? res.paginacion.unreadCount)) ??
          (Array.isArray(items) ? items.filter((i) => !i.leida).length : 0);

        setUnreadCount(noLeidas);
        if (onUpdateBadge) onUpdateBadge(noLeidas);
      } catch (e) {
        console.error('Error obteniendo notificaciones', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [open, onUpdateBadge]);

  const handleOpenNotification = async (n) => {
    try {
      if (!n.leida) {
        await marcarNotificacionLeida(n._id || n.id);
        setNotifs((prev) =>
          prev.map((x) =>
            x._id === n._id || x.id === n.id ? { ...x, leida: true } : x
          )
        );
        // actualizar badge sin usar valor stale
        setUnreadCount((c) => {
          const nc = Math.max(0, c - 1);
          if (onUpdateBadge) onUpdateBadge(nc);
          return nc;
        });
      }
    } catch (e) {
      console.error('Error marcando notificación leída', e);
    }

    // preferir ruta provista por backend
    if (n.ruta) {
      onClose?.();
      return navigate(n.ruta);
    }

    if (n.url) {
      onClose?.();
      return navigate(n.url);
    }

    // reglas por tipo (fallbacks)
    if (n.tipo === 'publicacion' && n.referencia) {
      onClose?.();
      return navigate(`/publicacion/${n.referencia}`);
    }
    if (n.tipo === 'chat' && n.referencia) {
      onClose?.();
      return navigate(`/chat/${n.referencia}`);
    }

    onClose?.();
  };

  const handleMarkAll = async () => {
    try {
      await marcarTodasNotificacionesLeidas();
      setNotifs((prev) => prev.map((n) => ({ ...n, leida: true })));
      setUnreadCount(0);
      if (onUpdateBadge) onUpdateBadge(0);
    } catch (e) {
      console.error('Error marcando todas leídas', e);
    }
  };

  if (!open || !usuario) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        bottom: 90,
        width: 360,
        maxHeight: '60vh',
        zIndex: 2200,
        boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
        borderRadius: 8,
        background: '#fff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '0.6rem 0.8rem',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <strong>Notificaciones</strong>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-sm btn-link" onClick={handleMarkAll}>
            Marcar todas
          </button>
          <button className="btn btn-sm btn-light" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {loading && (
          <div className="p-3 text-center text-muted">Cargando...</div>
        )}
        {!loading && notifs.length === 0 && (
          <div className="p-3 text-muted">Sin notificaciones</div>
        )}
        {!loading &&
          notifs.map((n, i) => {
            const avatar = n.icon || (n.usuarioId && n.usuarioId.fotoPerfil) || null;
            const message = n.descripcion || n.titulo || n.texto || n.mensaje || 'Notificación';
            const when = n.fecha || n.createdAt || null;
            return (
              <div
                key={n._id || n.id || i}
                onClick={() => handleOpenNotification(n)}
                style={{
                  padding: '0.6rem 0.8rem',
                  borderBottom: '1px solid rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  background: n.leida ? '#fff' : '#eef6ff',
                }}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      background: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {avatar ? (
                      <img
                        src={avatar}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 18 }}>🔔</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: n.leida ? 500 : 700 }}>
                      {message}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {n.subtexto ||
                        (when ? new Date(when).toLocaleString() : '')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}