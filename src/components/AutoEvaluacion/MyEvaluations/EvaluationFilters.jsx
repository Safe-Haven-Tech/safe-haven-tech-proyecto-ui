// src/components/MyEvaluations/EvaluationFilters.jsx
import React from 'react';

const EvaluationFilters = ({
  busqueda,
  setBusqueda,
  filtroNivel,
  setFiltroNivel,
  filtroFecha,
  setFiltroFecha,
  filtroPuntaje,
  setFiltroPuntaje,
}) => (
  <div className="mb-4 d-flex flex-wrap gap-2">
    <input
      type="text"
      placeholder="Buscar por título..."
      className="form-control"
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      style={{ borderRadius: '12px', padding: '12px', flex: '1 1 200px' }}
    />

    <select
      className="form-select"
      value={filtroNivel}
      onChange={(e) => setFiltroNivel(e.target.value)}
      style={{ borderRadius: '12px', flex: '1 1 150px' }}
    >
      <option value="">Nivel de riesgo</option>
      <option value="crítico">Crítico</option>
      <option value="alto">Alto</option>
      <option value="medio">Medio</option>
      <option value="bajo">Bajo</option>
    </select>

    <select
      className="form-select"
      value={filtroFecha}
      onChange={(e) => setFiltroFecha(e.target.value)}
      style={{ borderRadius: '12px', flex: '1 1 150px' }}
    >
      <option value="">Filtrar por fecha</option>
      <option value="7dias">Últimos 7 días</option>
      <option value="mes">Este mes</option>
      <option value="año">Este año</option>
    </select>

    <input
      type="number"
      placeholder="Puntaje mínimo"
      className="form-control"
      value={filtroPuntaje}
      onChange={(e) => setFiltroPuntaje(e.target.value)}
      style={{ borderRadius: '12px', padding: '12px', flex: '1 1 120px' }}
    />
  </div>
);

export default EvaluationFilters;
