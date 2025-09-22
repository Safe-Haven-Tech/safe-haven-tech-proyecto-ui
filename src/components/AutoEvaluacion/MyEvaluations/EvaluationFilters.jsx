import React from 'react';
import styles from './EvaluationFilters.module.css';

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
  <div className={styles.filtersContainer}>
    {/* Input de búsqueda */}
    <input
      type="text"
      placeholder="Buscar por título..."
      className={`form-control ${styles.filterInput} ${styles.searchInput}`}
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      aria-label="Buscar evaluaciones por título"
    />

    {/* Select de nivel de riesgo */}
    <select
      className={`form-select ${styles.filterSelect} ${styles.riskSelect}`}
      value={filtroNivel}
      onChange={(e) => setFiltroNivel(e.target.value)}
      aria-label="Filtrar por nivel de riesgo"
    >
      <option value="">Nivel de riesgo</option>
      <option value="crítico">Crítico</option>
      <option value="alto">Alto</option>
      <option value="medio">Medio</option>
      <option value="bajo">Bajo</option>
    </select>

    {/* Select de fecha */}
    <select
      className={`form-select ${styles.filterSelect} ${styles.dateSelect}`}
      value={filtroFecha}
      onChange={(e) => setFiltroFecha(e.target.value)}
      aria-label="Filtrar por fecha"
    >
      <option value="">Filtrar por fecha</option>
      <option value="7dias">Últimos 7 días</option>
      <option value="mes">Este mes</option>
      <option value="año">Este año</option>
    </select>

    {/* Input de puntaje mínimo */}
    <input
      type="number"
      placeholder="Puntaje mínimo"
      className={`form-control ${styles.filterInput} ${styles.scoreInput}`}
      value={filtroPuntaje}
      onChange={(e) => setFiltroPuntaje(e.target.value)}
      min="0"
      max="100"
      aria-label="Filtrar por puntaje mínimo"
    />
  </div>
);

export default EvaluationFilters;