import React from 'react';
import { FaDownload } from 'react-icons/fa';
import {
  getBackgroundColor,
  getBadgeColor,
  getIconRiesgo,
  getTip,
} from '../../../utils/riskUtils';

const EvaluationCard = ({ r, idx, handleDownloadPDF, pdfLoading }) => {
  const Icono = getIconRiesgo(r.nivelRiesgo);

  return (
    <div
      className="col-md-6 col-lg-4"
      style={{
        animation: `fadeSlideUp 0.3s ease forwards`,
        animationDelay: `${idx * 0.1}s`,
        opacity: 0,
      }}
    >
      <div
        className="p-4 d-flex flex-column justify-content-between h-100"
        style={{
          background: getBackgroundColor(r.nivelRiesgo),
          borderRadius: '20px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
          border: '1px solid #eee',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.18)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
        }}
      >
        <div>
          <h5 className="fw-bold" style={{ color: '#5A4E7C' }}>
            {r.encuestaId?.titulo || 'Encuesta sin título'}
          </h5>
          <p className="mb-1 text-muted">
            Fecha: {new Date(r.fechaCompletado).toLocaleDateString()}
          </p>

          <span
            className={`badge ${getBadgeColor(r.nivelRiesgo)}`}
            data-tip={r.recomendaciones?.join(', ')}
            style={{ transition: 'box-shadow 0.2s' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = '0 0 12px rgba(0,0,0,0.3)')
            }
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
          >
            {Icono && <Icono className="me-1" />}
            {r.nivelRiesgo?.toUpperCase() || 'N/A'}
          </span>

          <p
            className="mt-2 mb-0"
            style={{ fontStyle: 'italic', color: '#5A4E7C' }}
          >
            {getTip(r.nivelRiesgo)}
          </p>
        </div>

        <button
          className="mt-3 fw-semibold px-3 py-2 d-flex align-items-center justify-content-center"
          style={{
            background: 'linear-gradient(90deg, #5A4E7C, #A17CCA)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '0.95rem',
            boxShadow: '0 4px 10px rgba(90, 78, 124, 0.3)',
            transition: 'transform 0.2s ease-in-out',
            pointerEvents: pdfLoading ? 'none' : 'auto',
            opacity: pdfLoading ? 0.6 : 1,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = 'translateY(-2px)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = 'translateY(0)')
          }
          onClick={() => handleDownloadPDF(r)}
          aria-label="Descargar PDF"
        >
          <FaDownload className="me-2" /> Ver PDF
        </button>
      </div>
    </div>
  );
};

export default EvaluationCard;
