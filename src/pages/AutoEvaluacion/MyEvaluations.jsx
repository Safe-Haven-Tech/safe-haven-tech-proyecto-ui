import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { obtenerHistorialRespuestas } from '../../services/surveysServices';
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

  // Filtros
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
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error('Error generando PDF');
      const pdfBlob = await res.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('No se pudo generar el PDF. Intenta nuevamente.');
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
      <div className="text-center mt-5">
        <p>Cargando tus evaluaciones...</p>
      </div>
    );
  if (!usuario)
    return (
      <div className="text-center mt-5">
        <p>Debes iniciar sesión para ver tus evaluaciones.</p>
      </div>
    );

  return (
    <div
      className="container"
      style={{
        marginTop: '100px',
        fontFamily: "'Poppins', sans-serif",
        position: 'relative',
      }}
    >
      {pdfLoading && <PdfOverlay />}
      <EvaluationBanner usuario={usuario} respuestas={respuestas} />
      <div
        className="p-4 rounded-4"
        style={{
          backgroundColor: '#F9F9F9',
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
        }}
      >
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
          <div className="text-center">
            <p className="text-muted">No se encontraron evaluaciones.</p>
          </div>
        ) : (
          <div className="row g-4">
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

      <div className="text-center mt-5">
        <p>
          ¿Quieres realizar una nueva autoevaluación?{' '}
          <a
            href="/autoevaluacion"
            style={{ color: '#5A4E7C', fontWeight: '600' }}
          >
            Haz clic aquí
          </a>
        </p>
      </div>

      <ReactTooltip place="top" type="dark" effect="solid" />
      <style>{`
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MyEvaluations;
