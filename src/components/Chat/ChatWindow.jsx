import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  obtenerMensajes,
  enviarMensaje,
  subirArchivosAMensaje,
  marcarMensajesLeidos,
} from '../../services/chatService';
import MessageInput from './MessageInput';
import styles from './ChatWindow.module.css';

const API_URL = import.meta.env.VITE_API_URL || '';

const SCROLL_BOTTOM_THRESHOLD = 120;

const ChatWindow = ({
  chat,
  onClose = () => {},
  onRefreshChats = () => {},
}) => {
  const { token, usuario } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pagina, setPagina] = useState(1);
  const containerRef = useRef(null);
  const pollingRef = useRef(null);

  const isNearBottom = () => {
    const el = containerRef.current;
    if (!el) return true;
    const distance = el.scrollHeight - (el.scrollTop + el.clientHeight);
    return distance < SCROLL_BOTTOM_THRESHOLD;
  };

  const scrollToBottom = (smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  };

  const loadMessages = async (p = 1, { background = false } = {}) => {
    if (!background) setLoading(true);
    else setIsRefreshing(true);

    const wasAtBottom = isNearBottom();

    try {
      const res = await obtenerMensajes(token, chat._id, p, 50);
      const msgs = res.mensajes || [];
      setMensajes(msgs);
      setPagina(p);

      marcarMensajesLeidos(token, chat._id).catch((err) =>
        console.error('mark read failed', err)
      );
      onRefreshChats();

      if (wasAtBottom || !background) {
        setTimeout(() => scrollToBottom(!background), 100);
      }
    } catch (err) {
      console.error('Error cargando mensajes:', err);
    } finally {
      if (!background) setLoading(false);
      else setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!chat?._id) return;
    loadMessages(1, { background: false });

    pollingRef.current = setInterval(() => {
      loadMessages(1, { background: true });
    }, 7000);

    return () => clearInterval(pollingRef.current);
    // eslint-disable-next-line
  }, [chat._id]);

  const handleSend = async (
    texto,
    files = [],
    esTemporal = false,
    expiraEn = null
  ) => {
    if (!texto && (!files || files.length === 0)) return;

    const optimId = `optim-${Date.now()}`;
    const optimMsg = {
      _id: optimId,
      contenido: texto,
      // normalizar a id simple para mensajes optimistas
      emisorId: usuario?._id || usuario,
      archivosAdjuntos: files.length
        ? files.map((f) => ({ nombre: f.name }))
        : [],
      createdAt: new Date().toISOString(),
      estado: 'sending',
      esTemporal: !!esTemporal,
      expiraEn: expiraEn || null,
    };

    setMensajes((prev) => [...prev, optimMsg]);
    if (isNearBottom()) setTimeout(() => scrollToBottom(true), 80);

    try {
      const enviado = await enviarMensaje(
        token,
        chat._id,
        texto,
        esTemporal,
        expiraEn
      );

      if (files && files.length > 0) {
        try {
          await subirArchivosAMensaje(
            token,
            chat._id,
            enviado._id || enviado.id || enviado._id,
            files
          );
        } catch (err) {
          console.error('Error subiendo archivos:', err);
        }
      }

      await loadMessages(1, { background: true });
      onRefreshChats();
    } catch (err) {
      console.error('Error enviando mensaje:', err);
      setMensajes((prev) =>
        prev.map((m) => (m._id === optimId ? { ...m, estado: 'failed' } : m))
      );
      alert(err.message || 'No se pudo enviar el mensaje');
    }
  };

  const buildFileUrl = (a) => {
    if (!a) return '';
    const candidate =
      (a.url && String(a.url)) || (a.filename && String(a.filename)) || '';
    if (!candidate) return '';
    if (/^https?:\/\//i.test(candidate)) return candidate;

    const backendBase =
      (API_URL && API_URL.replace(/\/$/, '')) || 'http://localhost:3000';
    return candidate.startsWith('/')
      ? backendBase + candidate
      : backendBase + '/' + candidate;
  };

  const imageExtRegex = /\.(jpe?g|png|gif|webp|bmp|svg|avif|ico)$/i;

  // helper para extraer id de emisor (string/number/obj) — normaliza y trim
  const extractEmisorId = (emisorId) => {
    if (emisorId === null || emisorId === undefined) return undefined;
    if (typeof emisorId === 'string' || typeof emisorId === 'number')
      return String(emisorId).trim();
    if (typeof emisorId === 'object') {
      if (emisorId._id !== undefined && emisorId._id !== null)
        return String(emisorId._id).trim();
      if (emisorId.id !== undefined && emisorId.id !== null)
        return String(emisorId.id).trim();
      // algunos drivers devuelven ObjectId con toString()
      try {
        const s = emisorId.toString();
        if (s) return String(s).trim();
      } catch (e) {
        /* ignore */
      }
      try {
        return JSON.stringify(emisorId).trim();
      } catch (e) {
        /* ignore */
      }
    }
    return String(emisorId).trim();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className="me-auto">
          <button className="btn btn-link p-0" onClick={onClose}>
            ← Volver
          </button>
          <h5 className={`mb-0 ${styles.title}`}>
            {(chat.participantes || []).map((p) => p.nombreCompleto).join(', ')}
          </h5>
          <div className="text-muted small">
            {chat.participantes?.length} participantes
          </div>
        </div>

        <div className="ms-3">
          {isRefreshing && (
            <small className={styles.refreshHint}>Actualizando…</small>
          )}
        </div>
      </div>

      <div ref={containerRef} className={styles.messages}>
        {loading && (
          <div className="text-center text-muted">Cargando mensajes...</div>
        )}

        {!loading && mensajes.length === 0 && (
          <div className="text-center text-muted">Empieza la conversación</div>
        )}

        {!loading &&
          mensajes.map((m) => {
            const emisor =
              m.emisorId &&
              (m.emisorId.nombreCompleto || m.emisorId.nombreUsuario)
                ? m.emisorId
                : typeof m.emisorId === 'string'
                  ? { _id: m.emisorId, nombreCompleto: 'Usuario' }
                  : { nombreCompleto: 'Usuario' };

            const emisorIdVal = extractEmisorId(m.emisorId);
            const usuarioIdVal =
              usuario && (usuario._id || usuario.id)
                ? String(usuario._id || usuario.id).trim()
                : undefined;
            const esMio =
              !!usuarioIdVal && !!emisorIdVal && usuarioIdVal === emisorIdVal;

            if (import.meta.env.MODE === 'development') {
              console.debug(
                '[chat] mensaje',
                m._id,
                'emisorIdVal=',
                emisorIdVal,
                'usuarioIdVal=',
                usuarioIdVal,
                'esMio=',
                esMio
              );
            }

            const estado =
              m.estado ||
              (m._id && String(m._id).startsWith('optim-')
                ? 'sending'
                : 'sent');

            return (
              <div
                key={m._id}
                className={`${styles.messageRow} ${esMio ? styles.mineRow : ''}`}
              >
                <div
                  className={`${styles.messageBubble} ${esMio ? styles.mine : styles.theirs}`}
                >
                  <div className="small text-muted">
                    {esMio
                      ? 'Tú'
                      : emisor.nombreCompleto || emisor.nombreUsuario}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.contenido}</div>

                  {m.archivosAdjuntos && m.archivosAdjuntos.length > 0 && (
                    <div className={styles.attachments}>
                      {m.archivosAdjuntos.map((a, i) => {
                        const mimetype = (a.mimetype || '').toString();
                        const filename = (
                          a.filename ||
                          a.nombre ||
                          ''
                        ).toString();
                        const url = (a.url || '').toString();
                        const isImage =
                          (mimetype && mimetype.startsWith('image/')) ||
                          imageExtRegex.test(filename) ||
                          imageExtRegex.test(url);
                        const src = buildFileUrl(a);

                        if (src && isImage) {
                          return (
                            <div key={i} className={styles.attachmentItem}>
                              <a
                                href={src}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'inline-block' }}
                              >
                                <img
                                  src={src}
                                  alt={
                                    a.nombre || filename || `Adjunto ${i + 1}`
                                  }
                                  className={styles.attachmentImg}
                                  style={{
                                    display: 'block',
                                    width: 200,
                                    height: 140,
                                    objectFit: 'cover',
                                  }}
                                  onError={(e) => {
                                    console.warn(
                                      'Error cargando imagen en chat:',
                                      src
                                    );
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentNode;
                                    if (
                                      parent &&
                                      !parent.querySelector(
                                        '.attachment-fallback'
                                      )
                                    ) {
                                      const link = document.createElement('a');
                                      link.href = src || '#';
                                      link.target = '_blank';
                                      link.rel = 'noreferrer';
                                      link.textContent =
                                        a.nombre ||
                                        filename ||
                                        `Adjunto ${i + 1}`;
                                      link.className = 'attachment-fallback';
                                      parent.appendChild(link);
                                    }
                                  }}
                                />
                              </a>
                            </div>
                          );
                        }

                        return (
                          <div key={i} className={styles.attachmentItem}>
                            {src ? (
                              <a
                                href={src}
                                target="_blank"
                                rel="noreferrer"
                                className={esMio ? 'text-white' : ''}
                              >
                                {a.nombre || filename || `Adjunto ${i + 1}`}
                              </a>
                            ) : (
                              <div className="small text-muted">
                                {a.nombre || filename || `Adjunto ${i + 1}`}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className={styles.metaSmall}>
                    <div>
                      {new Date(
                        m.createdAt || m.fecha || m.fechaCreacion || m.createdAt
                      ).toLocaleString()}
                    </div>
                    {esMio && (
                      <div>
                        {estado === 'sending' && (
                          <span className="text-warning">Enviando...</span>
                        )}
                        {estado === 'failed' && (
                          <span className="text-danger">Error</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <div>
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
};

export default ChatWindow;
