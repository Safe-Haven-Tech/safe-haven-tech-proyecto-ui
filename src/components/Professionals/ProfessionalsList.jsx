import React from 'react';
import ProfessionalCard from './ProfessionalCard';
import styles from '../../pages/profesionals/Professionals.module.css';

export default function ProfessionalsList({
  items = [],
  loading,
  onLoadMore,
  hasMore,
}) {
  if (loading && items.length === 0) {
    return <div className={styles.loading}>Cargando profesionales…</div>;
  }

  if (!loading && (!items || items.length === 0)) {
    return <div className={styles.empty}>No se encontraron profesionales.</div>;
  }

  return (
    <section>
      <div className={styles.grid}>
        {items.map((u) => (
          <ProfessionalCard key={u._id || u.id} user={u} />
        ))}
      </div>

      {hasMore && (
        <div className={styles.loadMore}>
          <button className={styles.btn} onClick={onLoadMore}>
            Cargar más
          </button>
        </div>
      )}
    </section>
  );
}
