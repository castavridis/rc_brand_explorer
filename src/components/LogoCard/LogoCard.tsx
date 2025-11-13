import React from 'react';
import type { Brand } from '@/types/brand';
import styles from './LogoCard.module.css';

interface LogoCardProps {
  brand: Brand;
  onClick: () => void;
}

export const LogoCard: React.FC<LogoCardProps> = React.memo(({ brand, onClick }) => {
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
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{brand.name}</h3>
        <p className={styles.category}>{brand.category}</p>
      </div>
    </article>
  );
});

LogoCard.displayName = 'LogoCard';
