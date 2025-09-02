// src/components/AutoEvaluacion/MyEvaluationsCard.jsx
import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const MyEvaluationsCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;
  return (
    <div
      className="card text-center shadow-sm p-3 mb-4"
      style={{
        cursor: 'pointer',
        borderRadius: '10px',
        backgroundColor: '#E8F5E9',
      }}
      onClick={() => navigate('/mis-evaluaciones')}
    >
      <div className="card-body">
        <h5 className="card-title">Mis Evaluaciones</h5>
        <p className="card-text">
          Ver todas tus encuestas completadas, resultados y descargar PDF.
        </p>
        <button className="btn btn-success">Ir a Mis Evaluaciones</button>
      </div>
    </div>
  );
};

export default MyEvaluationsCard;
