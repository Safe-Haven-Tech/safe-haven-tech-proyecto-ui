import React, { useEffect, useState } from 'react';
import styles from './SolicitudesModal.module.css';
import perfilPlaceholder from '../../../assets/perfil_placeholder.png';
import {
  obtenerSolicitudesSeguidores,
  aceptarSolicitudSeguimiento,
  rechazarSolicitudSeguimiento,
} from '../../../services/redSocialServices';

const SolicitudesModal = ({ show, onClose }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accion, setAccion] = useState(null);

  useEffect(() => {
    if (show) {
      setLoading(true);
      obtenerSolicitudesSeguidores()
        .then(setSolicitudes)
        .finally(() => setLoading(false));
    }
  }, [show, accion]);

  const handleAceptar = async (solicitanteId) => {
    setAccion('aceptar-' + solicitanteId);
    await aceptarSolicitudSeguimiento(solicitanteId);
    setAccion(null);
  };

  const handleRechazar = async (solicitanteId) => {
    setAccion('rechazar-' + solicitanteId);
    await rechazarSolicitudSeguimiento(solicitanteId);
    setAccion(null);
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          Solicitudes de seguidores
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        {loading ? (
          <div className={styles.loading}>Cargando...</div>
        ) : solicitudes.length === 0 ? (
          <div className={styles.empty}>No tienes solicitudes pendientes.</div>
        ) : (
          <ul className={styles.solicitudesList}>
            {solicitudes.map((s) => {
              const solicitanteId =
                s.solicitante && typeof s.solicitante === 'object'
                  ? s.solicitante._id
                  : s.solicitante;
              const nombreUsuario =
                s.solicitante && typeof s.solicitante === 'object'
                  ? s.solicitante.nombreUsuario
                  : '';
              const nombreCompleto =
                s.solicitante && typeof s.solicitante === 'object'
                  ? s.solicitante.nombreCompleto
                  : '';
              const fotoPerfil =
                s.solicitante && typeof s.solicitante === 'object'
                  ? s.solicitante.fotoPerfil
                  : perfilPlaceholder;

              if (!solicitanteId) return null;

              return (
                <li key={s._id} className={styles.solicitudItem}>
                  <img
                    src={fotoPerfil || perfilPlaceholder}
                    alt="avatar"
                    className={styles.avatar}
                  />
                  <div className={styles.info}>
                    <strong>@{nombreUsuario}</strong>
                    <div>{nombreCompleto}</div>
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={`btn btn-success btn-sm me-2`}
                      onClick={() => handleAceptar(solicitanteId)}
                      disabled={accion !== null}
                    >
                      Aceptar
                    </button>
                    <button
                      className={`btn btn-danger btn-sm`}
                      onClick={() => handleRechazar(solicitanteId)}
                      disabled={accion !== null}
                    >
                      Rechazar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SolicitudesModal;