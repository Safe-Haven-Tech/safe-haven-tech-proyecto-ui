import React, { useEffect, useState } from 'react';
import { fetchProfessionals } from '../../services/userServices.js';
import ProfessionalsFilter from '../../components/Professionals/ProfessionalsFilter.jsx';
import ProfessionalsList from '../../components/Professionals/ProfessionalsList.jsx';
import styles from './Professionals.module.css';
import WelcomeCard from '../../components/Professionals/WelcomeCard.jsx';
import BenefitsSection from '../../components/Professionals/BenefitsSection.jsx';

export default function ProfessionalsHome() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 12;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchProfessionals({ ...filters, pagina: page, limite: LIMIT })
      .then((res) => {
        if (!mounted) return;
        const users = res.usuarios || res.data || [];
        const pag = res.paginacion || {};
        setProfessionals((prev) => (page === 1 ? users : [...prev, ...users]));
        setHasMore(
          Boolean(
            pag &&
              (pag.totalPages ? page < pag.totalPages : users.length === LIMIT)
          )
        );
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err);
        setProfessionals([]);
      })
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, [filters, page]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const loadMore = () => setPage((p) => p + 1);

  return (
    <>
      <div className={styles.pageTopSpacer} />

      {/* WelcomeCard */}
      <WelcomeCard
        title="Conecta con profesionales de confianza"
        subtitle="Acompañamiento seguro, cercano y especializado"
        description="Explora perfiles verificados y filtra por especialidad, modalidad o ciudad. Si necesitas atención urgente, prioriza servicios de emergencia."
        fullWidth={true}
      />

      <div className={styles.container}>
        <BenefitsSection />
        <ProfessionalsFilter
          onChange={handleFilterChange}
          initialValues={filters}
        />
        {error ? (
          <div className={styles.error} role="alert">
            Error: {error.message || 'Problema al cargar profesionales'}
          </div>
        ) : (
          <>
            <ProfessionalsList
              items={professionals}
              loading={loading}
              onLoadMore={loadMore}
              hasMore={hasMore}
            />
          </>
        )}
      </div>
    </>
  );
}
