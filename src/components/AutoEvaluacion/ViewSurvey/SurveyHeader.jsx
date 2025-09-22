import React from 'react';
import styles from './SurveyHeader.module.css';

export default function SurveyHeader({
  title,
  description,
  category,
  estimatedTime,
}) {
  return (
    <div className={styles.surveyHeader}>
      <h1 className={styles.surveyTitle}>
        {title}
      </h1>

      {description && (
        <p className={styles.surveyDescription}>
          {description}
        </p>
      )}

      <div className={styles.badgeContainer}>
        <span className={styles.categoryBadge}>
          {category}
        </span>

        {estimatedTime && (
          <span className={styles.timeBadge}>
            {estimatedTime} min aprox.
          </span>
        )}
      </div>
    </div>
  );
}