// src/components/MyEvaluations/EvaluationBanner.jsx
import React from 'react';

const EvaluationBanner = ({ usuario, respuestas }) => (
  <div
    className="p-4 mb-5 rounded-4 text-white"
    style={{
      background: 'linear-gradient(90deg, #5A4E7C, #A17CCA)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
    }}
  >
    <h4 className="fw-bold">¡Hola, {usuario?.nombreUsuario || 'usuario'}!</h4>
    <p className="mb-1">
      Has completado {respuestas.length} autoevaluación(es).
    </p>
    {respuestas[0] && (
      <p className="mb-0">
        Última evaluación: <strong>{respuestas[0].encuestaId?.titulo}</strong>
      </p>
    )}
  </div>
);

export default EvaluationBanner;
