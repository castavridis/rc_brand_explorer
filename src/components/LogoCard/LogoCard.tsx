import React from 'react';
import type { Brand } from '@/types/brand';
import { DataAvailabilityBadge } from '../DataAvailabilityBadge';
import styles from './LogoCard.module.css';

interface LogoCardProps {
  brand: Brand;
  onClick: () => void;
  /**
   * T033: Optional quarter count for data availability badge
   * Pass undefined if not loaded yet, 0 if no data
   */
  quarterCount?: number;
}

export const LogoCard: React.FC<LogoCardProps> = React.memo(({ brand, onClick, quarterCount }) => {
  return (
    <article
      className={styles.logoCard}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View ${brand.name} logo details`}
    >
      <div className={styles.imageContainer}>
        <img
          src={`/${brand.logoPath}`}
          alt={`${brand.name} logo`}
          loading="lazy"
          decoding="async"
          className={styles.image}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.classList.add(styles.error);
              const placeholder = document.createElement('div');
              placeholder.className = styles.placeholder;
              placeholder.textContent = brand.name.charAt(0);
              parent.appendChild(placeholder);
            }
          }}
        />
        {/* T033: Data availability badge */}
        {quarterCount !== undefined && (
          <div className={styles.badge}>
            <DataAvailabilityBadge quarterCount={quarterCount} size="small" />
          </div>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{brand.name}</h3>
        <p className={styles.category}>{brand.category}</p>
      </div>
    </article>
  );
});

LogoCard.displayName = 'LogoCard';
