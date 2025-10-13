import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ForoPage.module.css';

const API_URL = import.meta.env.VITE_API_URL;

const TOPICOS_FORO = [
  'violencia física',
  'violencia psicológica',
  'violencia económica',
  'violencia digital',
  'apoyo emocional',
  'recursos legales',
  'experiencias personales',
  'recuperación y autocuidado',
  'familia y entorno',
  'denuncias y procesos legales',
  'prevención',
  'orientación profesional',
  'comunidad y redes de apoyo',
  'otros'
];

const CrearForo = () => {
  const [contenido, setContenido] = useState('');
  const [topico, setTopico] = useState('');
  const [anonimo, setAnonimo] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!contenido.trim() || !topico) {
      setError('Debes ingresar el contenido y seleccionar un tópico.');
      return;
    }
    setEnviando(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/publicaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contenido,
          topico,
          anonimo,
          tipo: 'foro'
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.detalles || 'Error al crear publicación');
      }
      navigate('/foro');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={styles.foroPageContainer}>
      <div className={styles.crearForoBg}>
        <div className={styles.crearForoWrapper}>
          <div className={styles.crearForoCard}>
            <div className={styles.crearForoHeader}>
              <span className={styles.crearForoIcon} role="img" aria-label="Crear tema"></span>
              <h2>Crear nuevo tema en el foro</h2>
              <p>
                Comparte tu experiencia, pregunta o mensaje. Recuerda que este es un espacio seguro y de apoyo mutuo.
              </p>
            </div>
            <div className={styles.crearForoInfoBox}>
              <span role="img" aria-label="info" className={styles.crearForoInfoIcon}></span>
              <span>
                Elige el tópico que mejor describa tu publicación para que más personas puedan encontrarte y apoyarte.
              </span>
            </div>
            <form onSubmit={handleSubmit} className={styles.crearForoForm}>
              <div className="mb-3">
                <label htmlFor="topico" className={styles.crearForoLabel}>
                  Tópico <span style={{ color: '#8e44ad' }}>*</span>
                </label>
                <select
                  id="topico"
                  className={styles.crearForoSelect}
                  value={topico}
                  onChange={e => setTopico(e.target.value)}
                  required
                >
                  <option value="">Selecciona un tópico...</option>
                  {TOPICOS_FORO.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="contenido" className={styles.crearForoLabel}>
                  Contenido <span style={{ color: '#8e44ad' }}>*</span>
                </label>
                <textarea
                  id="contenido"
                  className={styles.crearForoTextarea}
                  value={contenido}
                  onChange={e => setContenido(e.target.value)}
                  rows={7}
                  maxLength={5000}
                  required
                  placeholder="Comparte tu experiencia, pregunta o mensaje..."
                />
                <div className={styles.crearForoCharCount}>{contenido.length}/5000</div>
              </div>
              <div className={styles.crearForoAnonimoCheck}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="anonimo"
                  checked={anonimo}
                  onChange={e => setAnonimo(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="anonimo">
                  Publicar como anónimo
                </label>
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className={styles.crearForoBotones}>
                <button
                  type="submit"
                  className={styles.crearForoBtn}
                  disabled={enviando}
                >
                  {enviando ? 'Publicando...' : 'Publicar'}
                </button>
                <button
                  type="button"
                  className={styles.crearForoBtnSecundario}
                  onClick={() => navigate('/foro')}
                  disabled={enviando}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearForo;