import React from 'react';
import styles from '../../../pages/admin/PostulacionesAdmin.module.css';

export default function PostulacionRow({ postulacion, onView = () => {}, onQuickDecidir = () => {} }) {
  const usuario = postulacion.usuarioId || postulacion.usuario || {};
  return (
    <tr className={styles.row}>
      <td>
        <div className={styles.userCell}>
          <div className={styles.userName}>{usuario.nombreCompleto || usuario.nombreUsuario || '—'}</div>
          <div className={styles.userEmail}>{usuario.correo || '—'}</div>
        </div>
      </td>
      <td>{postulacion.especialidad || '—'}</td>
      <td>
        <span className={styles[`badge_${postulacion.estado}`] || styles.badge}>{postulacion.estado}</span>
      </td>
      <td>{new Date(postulacion.createdAt).toLocaleString()}</td>
      <td>
        <button type="button" className={styles.actionBtn} onClick={onView}>Ver</button>
      </td>
    </tr>
  );
}