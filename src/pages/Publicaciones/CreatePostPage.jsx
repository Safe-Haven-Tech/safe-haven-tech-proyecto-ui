import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CrearPostPage.module.css';
import postDetailStyles from '../Publicaciones/PostDetail.module.css';

const LIMITE_CARACTERES = 2200;
const LIMITE_ARCHIVOS = 10;

// Carrusel de imágenes/videos para la preview (simplificado)
const ImagenesCarrusel = ({ previews }) => {
  const [actual, setActual] = useState(0);
  if (!previews || previews.length === 0) return null;

  const handlePrev = () => setActual((prev) => (prev === 0 ? previews.length - 1 : prev - 1));
  const handleNext = () => setActual((prev) => (prev === previews.length - 1 ? 0 : prev + 1));

  return (
    <div className={postDetailStyles.carruselContainer}>
      {previews.length > 1 && (
        <>
          <button className={postDetailStyles.carruselBtn + ' ' + postDetailStyles.carruselBtnLeft} onClick={handlePrev} type="button">
            ‹
          </button>
          <button className={postDetailStyles.carruselBtn + ' ' + postDetailStyles.carruselBtnRight} onClick={handleNext} type="button">
            ›
          </button>
        </>
      )}
      {previews[actual].tipo === 'imagen' ? (
        <img src={previews[actual].url} alt="preview" className={postDetailStyles.carruselImg} />
      ) : (
        <video src={previews[actual].url} className={postDetailStyles.carruselImg} controls />
      )}
      {previews.length > 1 && (
        <div className={postDetailStyles.carruselIndicators}>
          {previews.map((_, idx) => (
            <span
              key={idx}
              className={idx === actual ? postDetailStyles.carruselIndicatorActive : postDetailStyles.carruselIndicator}
              onClick={() => setActual(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CrearPostPage = () => {
  const [contenido, setContenido] = useState('');
  const [anonimo, setAnonimo] = useState(false);
  const [archivos, setArchivos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [modal, setModal] = useState({ show: false, success: false, mensaje: '' });
  const [subiendo, setSubiendo] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  // Maneja la selección de archivos y genera previews
  const handleArchivos = (e) => {
    const nuevosArchivos = Array.from(e.target.files);
    if (archivos.length + nuevosArchivos.length > LIMITE_ARCHIVOS) {
      setModal({
        show: true,
        success: false,
        mensaje: `Solo puedes subir hasta ${LIMITE_ARCHIVOS} archivos.`,
      });
      return;
    }
    const totalArchivos = [...archivos, ...nuevosArchivos];
    setArchivos(totalArchivos);

    // Previews de imágenes y videos
    const nuevosPreviews = nuevosArchivos.map(file => ({
      url: URL.createObjectURL(file),
      tipo: file.type.startsWith('video') ? 'video' : 'imagen'
    }));
    setPreviews(prev => [...prev, ...nuevosPreviews]);
    e.target.value = '';
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contenido.trim()) {
      setModal({ show: true, success: false, mensaje: 'El contenido es obligatorio.' });
      return;
    }
    if (archivos.length === 0) {
      setModal({ show: true, success: false, mensaje: 'Debes subir al menos una imagen o video.' });
      return;
    }
    setSubiendo(true);
    try {
      const token = localStorage.getItem('token');
      // 1. Crear la publicación (solo JSON)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/publicaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contenido,
          tipo: 'perfil',
          anonimo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear la publicación');
      }

      const publicacionId = data.publicacion._id;

      // 2. Subir archivos multimedia (FormData)
      const formData = new FormData();
      archivos.forEach((file) => formData.append('multimedia', file));

      const resUpload = await fetch(`${import.meta.env.VITE_API_URL}/api/publicaciones/${publicacionId}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const dataUpload = await resUpload.json();
      if (!resUpload.ok) {
        throw new Error(dataUpload.error || 'Error al subir archivos multimedia');
      }

      setModal({ show: true, success: true, mensaje: '¡Publicación creada con éxito!' });
      setTimeout(() => {
        setModal({ show: false, success: true, mensaje: '' });
        navigate('/publicaciones');
      }, 1500);
    } catch (err) {
      setModal({ show: true, success: false, mensaje: err.message });
    } finally {
      setSubiendo(false);
    }
  };

  // Elimina un archivo del preview y del array
  const handleEliminarArchivo = (idx) => {
    const nuevosArchivos = archivos.filter((_, i) => i !== idx);
    const nuevosPreviews = previews.filter((_, i) => i !== idx);
    setArchivos(nuevosArchivos);
    setPreviews(nuevosPreviews);
  };



  return (
    <div className={styles.crearPostPageGrid}>
      {/* Preview tipo Instagram */}
      <div className={styles.previewCol}>
        <div className={postDetailStyles.cardContainer}>

          {/* Carrusel */}
          {previews.length > 0 ? (
              <ImagenesCarrusel previews={previews} />
            ) : (
              <div
                className={postDetailStyles.carruselContainer}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#aaa',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  background: '#f3e9fa',
                  borderRadius: 18,
                  minHeight: 220,
                  minWidth: 220,
                  textAlign: 'center',
                }}
              >
                Sube al menos una imagen o video para tu publicación
              </div>
            )}

        </div>
      </div>
      {/* Formulario */}
      <div className={styles.formCol}>
        <form className={styles.formulario} onSubmit={handleSubmit}>
          <h2 className={styles.titulo}>Crear publicación</h2>

          <div className={styles.archivosSection}>
            <label className={styles.archivosLabel}>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleArchivos}
                disabled={archivos.length >= LIMITE_ARCHIVOS}
              />
              <span className={styles.archivosBtn}>
                <i className="bi bi-image"></i> Agregar imágenes o videos
              </span>
            </label>
            <div className={styles.contador}>
              {archivos.length} / {LIMITE_ARCHIVOS} archivos seleccionados
            </div>
            {/* Mini previews debajo del botón */}
            <div className={styles.previewsMini}>
              {previews.map((prev, idx) => (
                <div key={idx} className={styles.previewMiniItem}>
                  {prev.tipo === 'imagen' ? (
                    <img src={prev.url} alt="preview" className={styles.previewMiniImg} />
                  ) : (
                    <video src={prev.url} className={styles.previewMiniImg} />
                  )}
                  <button
                    type="button"
                    className={styles.eliminarBtnMini}
                    onClick={() => handleEliminarArchivo(idx)}
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <textarea
            className={styles.textarea}
            placeholder="¿Qué quieres compartir?"
            maxLength={LIMITE_CARACTERES}
            value={contenido}
            onChange={e => setContenido(e.target.value)}
            rows={5}
            required
          />
          <div className={styles.contador}>
            {contenido.length} / {LIMITE_CARACTERES}
          </div>

          <div className={styles.opciones}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={anonimo}
                onChange={e => setAnonimo(e.target.checked)}
              />
              Publicar como anónimo
            </label>
          </div>

          <button
            type="submit"
            className={styles.botonPublicar}
            disabled={subiendo || archivos.length === 0}
          >
            {subiendo ? 'Publicando...' : 'Publicar'}
          </button>
        </form>
      </div>

      {/* Modal de éxito/error */}
      {modal.show && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${modal.success ? styles.modalSuccess : styles.modalError}`}>
            <div className={styles.modalIcon}>
              {modal.success ? '✅' : '❌'}
            </div>
            <div className={styles.modalMensaje}>{modal.mensaje}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearPostPage;