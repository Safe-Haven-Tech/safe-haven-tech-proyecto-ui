// src/components/Survey/SurveyHeader.jsx
import React from 'react';

export default function SurveyHeader({
  title,
  description,
  category,
  estimatedTime,
}) {
  return (
    <div className="text-center mb-5 ">
      <h1
        className="fw-bold mb-3"
        style={{
          fontFamily: "'Poppins', sans-serif",
          background: 'linear-gradient(90deg, #5A4E7C, #A17CCA)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {title}
      </h1>

      {description && (
        <p className="text-muted mb-3" style={{ fontSize: '1.1rem' }}>
          {description}
        </p>
      )}

      <div className="d-flex justify-content-center gap-4 flex-wrap">
        <span
          style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #5A4E7C, #A17CCA)',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(90, 78, 124, 0.3)',
          }}
        >
          {category}
        </span>

        {estimatedTime && (
          <span
            className="badge bg-secondary px-3 py-2"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(90, 78, 124, 0.3)',
            }}
          >
            {estimatedTime} min aprox.
          </span>
        )}
      </div>
    </div>
  );
}
