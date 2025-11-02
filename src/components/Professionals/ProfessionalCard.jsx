
import React from 'react';
import styles from '../../pages/profesionals/Professionals.module.css';
import avatar from '../../assets/perfil_placeholder.png';




// Normalize according to Usuario schema / ejemplo DB
function normalizeUser(raw = {}) {
  const info = raw.infoProfesional || {};
  return {
    _id: raw._id || raw.id || '',
    nombreCompleto: raw.nombreCompleto || `${raw.nombres || ''} ${raw.apellidos || ''}`.trim() || raw.nombreUsuario || '',
    nombreUsuario: raw.nombreUsuario || raw.usuario || raw.username || '',
    correo: raw.correo || raw.email || '',
    fotoPerfil: raw.fotoPerfil || raw.foto || raw.avatar || '',
    ubicacion: raw.ubicacion || info.ubicacion || {},
    biografia: raw.biografia || info.resumen || info.biografia || '',
    infoProfesional: {
      titulos: Array.isArray(info.titulos) ? info.titulos : [],
      especialidades: Array.isArray(info.especialidades) ? info.especialidades : [],
      registroProfesional: info.registroProfesional || info.registro || '',
      institucionTitulo: info.institucionTitulo || info.institucion || '',
      añosExperiencia: info['añosExperiencia'] ?? info.aniosExperiencia ?? info.experienceYears ?? null,
      disponible: typeof info.disponible === 'boolean' ? info.disponible : (info.available ?? true),
      modalidadesAtencion: Array.isArray(info.modalidadesAtencion) ? info.modalidadesAtencion : (Array.isArray(info.modalidades) ? info.modalidades : []),
      idiomas: Array.isArray(info.idiomas) ? info.idiomas : (Array.isArray(info.languages) ? info.languages : []),
      ratingPromedio: info.ratingPromedio ?? info.rating ?? 0
    }
  };
}

export default function ProfessionalCard({ user: rawUser }) {
  const user = normalizeUser(rawUser || {});

  const info = user.infoProfesional || {};
  const name = user.nombreCompleto || 'Profesional';
  const photo = user.fotoPerfil || avatar;
  const bio = user.biografia || '';
  const especialidades = info.especialidades || [];
  const idiomas = info.idiomas || [];
  const modalidades = info.modalidadesAtencion || [];
  const disponible = typeof info.disponible === 'boolean' ? info.disponible : true;


  const titulos = Array.isArray(info.titulos) ? info.titulos : [];
  const registro = info.registroProfesional || '';
  const institucion = info.institucionTitulo || '';
  const experiencia = info['añosExperiencia'] ?? null;

  return (
    <article className={styles.card} aria-labelledby={`prof-${user._id}-name`} role="article">
      <div className={styles.cardTop}>
        <img className={styles.avatar} src={photo || avatar} alt={`Foto de ${name}`} />
        <div className={styles.headerInfo}>
          <h3 id={`prof-${user._id}-name`} className={styles.name}>{name}</h3>

          {titulos.length > 0 && (
            <div className={styles.smallMeta} aria-label="Títulos">
              {titulos.slice(0, 2).join(' • ')}
            </div>
          )}

          <div className={styles.metaRow}>
          
            <span className={`${styles.badge} ${disponible ? styles.available : styles.unavailable}`}>
              {disponible ? 'Disponible' : 'No disponible'}
            </span>
          </div>

          <div className={styles.smallMeta} aria-label="Detalles profesionales">
            {registro && <span style={{ marginRight: 10 }}><strong>Registro:</strong> {registro}</span>}
            {institucion && <span style={{ marginRight: 10 }}><strong>Formación:</strong> {institucion}</span>}
            {experiencia !== null && <span><strong>Experiencia:</strong> {experiencia} {experiencia === 1 ? 'año' : 'años'}</span>}
          </div>

          
        </div>
      </div>

      <p className={styles.bio} aria-label="Resumen profesional">
        {bio ? (bio.length > 140 ? bio.slice(0, 140) + '…' : bio) : 'Información breve no disponible.'}
      </p>

      <div className={styles.chips} aria-hidden>
        {especialidades.slice(0, 6).map((s, i) => (
          <span key={i} className={styles.chip}>{s}</span>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <div className={styles.smallMeta}><strong>Modalidad:</strong> {modalidades.join(', ') || 'Presencial • Online'}</div>
          <div className={styles.smallMeta}><strong>Idiomas:</strong> {idiomas.join(', ') || 'Español'}</div>
        </div>

        <div className={styles.actions}>
          {user.correo && (
            <a className={styles.btnPrimary} href={`mailto:${user.correo}`} rel="noopener noreferrer" aria-label={`Contactar a ${name}`}>
              Contactar
            </a>
          )}
          <a className={styles.btnGhost} href={`/perfil/${user.nombreUsuario || user._id}`} rel="noopener noreferrer">
            Ver perfil
          </a>
        </div>
      </div>
    </article>
  );
}
// ...existing code...