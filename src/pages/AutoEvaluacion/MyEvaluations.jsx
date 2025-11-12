/* filepath: f:\SafeHaven\safe-haven-tech-proyecto-ui\src\pages\AutoEvaluacion\MyEvaluations.jsx */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { obtenerHistorialRespuestas } from '../../services/surveysServices';
import styles from './MyEvaluations.module.css';
import PdfOverlay from '../../components/AutoEvaluacion/MyEvaluations/PdfOverlay';
import EvaluationBanner from '../../components/AutoEvaluacion/MyEvaluations/EvaluationBanner';
import EvaluationFilters from '../../components/AutoEvaluacion/MyEvaluations/EvaluationFilters';
import EvaluationCard from '../../components/AutoEvaluacion/MyEvaluations/EvaluationCard';
import { Tooltip as ReactTooltip } from 'react-tooltip';

const API_URL = import.meta.env.VITE_API_URL;

const MyEvaluations = () => {
  const { usuario, token } = useAuth();
  const [respuestas, setRespuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const [filtroNivel, setFiltroNivel] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroPuntaje, setFiltroPuntaje] = useState('');

  useEffect(() => {
    if (usuario && token) {
      obtenerHistorialRespuestas(token)
        .then((result) => {
          if (result.success) setRespuestas(result.respuestas);
          else console.error(result.mensaje);
        })
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, [usuario, token]);

  const handleDownloadPDF = async (r) => {
    try {
      setPdfLoading(true);
      const payload = {
        respuestas: r.respuestas,
        encuestaId: r.encuestaId._id || r.encuestaId,
      };

      const res = await fetch(
        `${API_URL}/api/encuestas/${payload.encuestaId}/completar-sin-auth`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ respuestas: payload.respuestas }),
        }
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        let msg = 'Error generando PDF';
        try {
          const j = JSON.parse(txt);
          msg = j?.mensaje || j?.error || msg;
        } catch {
          if (txt) msg = txt;
        }
        throw new Error(msg);
      }

      const blob = await res.blob();
      const contentType = (res.headers.get('content-type') || blob.type || '').toLowerCase();
      const pdfBlob =
        contentType.includes('pdf') || blob.type === 'application/pdf'
          ? blob
          : new Blob([blob], { type: 'application/pdf' });

      // Abrir PDF en nueva pestaña en lugar de forzar descarga
      const url = window.URL.createObjectURL(pdfBlob);
      const newTab = window.open(url, '_blank');
      if (!newTab) {
        // popup bloqueado: intentar fallback creando <a> para descarga
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      // liberar URL tras un retraso para asegurar que la pestaña pueda cargarlo
      setTimeout(() => window.URL.revokeObjectURL(url), 15000);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert(error.message || 'No se pudo generar el PDF. Intenta nuevamente.');
    } finally {
      setPdfLoading(false);
    }
  };
  // Filtrado
  const filteredRespuestas = respuestas.filter((r) => {
    const tituloMatch = r.encuestaId?.titulo
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    const nivelMatch = filtroNivel ? r.nivelRiesgo === filtroNivel : true;

    let fechaMatch = true;
    if (filtroFecha) {
      const fecha = new Date(r.fechaCompletado);
      const ahora = new Date();
      if (filtroFecha === '7dias') {
        fechaMatch = (ahora - fecha) / (1000 * 60 * 60 * 24) <= 7;
      } else if (filtroFecha === 'mes') {
        fechaMatch =
          fecha.getMonth() === ahora.getMonth() &&
          fecha.getFullYear() === ahora.getFullYear();
      } else if (filtroFecha === 'año') {
        fechaMatch = fecha.getFullYear() === ahora.getFullYear();
      }
    }

    const puntajeMatch = filtroPuntaje
      ? (r.puntajeTotal ?? 0) >= parseInt(filtroPuntaje)
      : true;
    return tituloMatch && nivelMatch && fechaMatch && puntajeMatch;
  });

  if (loading)
    return (
      <div className={styles.loadingContainer}>
        <p className={styles.loadingText}>Cargando tus evaluaciones...</p>
      </div>
    );

  if (!usuario)
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>
          Debes iniciar sesión para ver tus evaluaciones.
        </p>
      </div>
    );

  return (
    <div className={`container ${styles.container}`}>
      {pdfLoading && <PdfOverlay />}

      <div className={styles.fadeSlideUp}>
        <EvaluationBanner usuario={usuario} respuestas={respuestas} />
      </div>

      <div className={styles.evaluationsContainer}>
        <EvaluationFilters
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          filtroNivel={filtroNivel}
          setFiltroNivel={setFiltroNivel}
          filtroFecha={filtroFecha}
          setFiltroFecha={setFiltroFecha}
          filtroPuntaje={filtroPuntaje}
          setFiltroPuntaje={setFiltroPuntaje}
        />

        {filteredRespuestas.length === 0 ? (
          <div className={styles.noEvaluationsContainer}>
            <p className={styles.noEvaluationsText}>
              No se encontraron evaluaciones.
            </p>
          </div>
        ) : (
          <div className={styles.evaluationsGrid}>
            {filteredRespuestas.map((r, idx) => (
              <EvaluationCard
                key={r._id}
                r={r}
                idx={idx}
                handleDownloadPDF={handleDownloadPDF}
                pdfLoading={pdfLoading}
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.ctaContainer}>
        <p className={styles.ctaText}>
          ¿Quieres realizar una nueva autoevaluación?{' '}
          <a href="/autoevaluacion" className={styles.ctaLink}>
            Haz clic aquí
          </a>
        </p>
      </div>

      <ReactTooltip place="top" type="dark" effect="solid" />
    </div>
  );
};

export default MyEvaluations;
