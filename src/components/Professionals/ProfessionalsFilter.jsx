import React, { useState, useEffect, useRef } from 'react';
import styles from './ProfessionalsFilter.module.css';

function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function ProfessionalsFilter({ onChange, initialValues = {} }) {
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const [q, setQ] = useState(initialValues.q || '');
  const [especialidad, setEspecialidad] = useState(initialValues.especialidad || '');
  const [ciudad, setCiudad] = useState(initialValues.ciudad || '');
  const [modalidad, setModalidad] = useState(initialValues.modalidad || '');
  const [disponible, setDisponible] = useState(
    initialValues.disponible === undefined ? '' : String(initialValues.disponible)
  );

  // sync when initialValues prop changes
  useEffect(() => {
    setQ(initialValues.q || '');
    setEspecialidad(initialValues.especialidad || '');
    setCiudad(initialValues.ciudad || '');
    setModalidad(initialValues.modalidad || '');
    setDisponible(initialValues.disponible === undefined ? '' : String(initialValues.disponible));
  }, [initialValues]);

  const debouncedQ = useDebounced(q, 350);

  const normalize = (v) => {
    if (v === undefined || v === null) return undefined;
    const t = String(v).trim();
    return t === '' ? undefined : t;
  };

  useEffect(() => {
    if (!mountedRef.current) return;
    const payload = {
      q: normalize(debouncedQ),
      especialidad: normalize(especialidad),
      ciudad: normalize(ciudad),
      modalidad: normalize(modalidad),
      disponible: disponible === '' ? undefined : disponible === 'true',
    };
    if (typeof onChange === 'function') onChange(payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, especialidad, ciudad, modalidad, disponible]);

  const quickSpecialties = ['Psicología', 'Psiquiatría', 'Trabajo social', 'Abogacía', 'Mediación'];

  const toggleEspecialidad = (s) => {
    setEspecialidad((prev) => (prev === s ? '' : s));
  };

  const handleClear = () => {
    setQ('');
    setEspecialidad('');
    setCiudad('');
    setModalidad('');
    setDisponible('');
    if (typeof onChange === 'function') {
      onChange({
        q: undefined,
        especialidad: undefined,
        ciudad: undefined,
        modalidad: undefined,
        disponible: undefined,
      });
    }
  };

  return (
    <div className={styles.filterWrap} role="region" aria-label="Filtros de profesionales">


      <div className={styles.quickChips} aria-label="Especialidades rápidas" role="list">
        {quickSpecialties.map((s) => {
          const active = especialidad === s;
          return (
            <button
              key={s}
              type="button"
              role="listitem"
              aria-pressed={active}
              className={`${styles.chipBtn} ${active ? styles.chipActive : ''}`}
              onClick={() => toggleEspecialidad(s)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleEspecialidad(s);
                }
              }}
            >
              {s}
            </button>
          );
        })}
        <button
          className={styles.clearBtn}
          onClick={handleClear}
          type="button"
          aria-label="Limpiar filtros"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}