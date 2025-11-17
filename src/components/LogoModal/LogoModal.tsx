import React, { useEffect } from 'react';
import type { Brand } from '@/types/brand';
import { QuarterlyMetrics } from '../QuarterlyMetrics';
import { QuarterlyDataErrorBoundary } from '../ErrorBoundary';
import styles from './LogoModal.module.css';

interface LogoModalProps {
  brand: Brand | null;
  onClose: () => void;
  open: boolean;
}

export const LogoModal: React.FC<LogoModalProps> = ({ brand, onClose, open }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open || !brand) return null;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <div className={styles.content}>
          <div className={styles.imageWrapper}>
            <img
              src={`/${brand.logoPath}`}
              alt={`${brand.name} logo`}
              className={styles.image}
            />
          </div>

          <div className={styles.details}>
            <h2 id="modal-title" className={styles.title}>
              {brand.name}
            </h2>
            <p className={styles.category}>{brand.category}</p>

            {brand.description && (
              <p className={styles.description}>{brand.description}</p>
            )}

            {brand.websiteUrl && (
              <a
                href={brand.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.website}
              >
                Visit Website →
              </a>
            )}

            {brand.tags && brand.tags.length > 0 && (
              <div className={styles.tags}>
                {brand.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quarterly Brand Perception Data - T040: Wrapped with error boundary */}
          <div className={styles.quarterlyData}>
            <QuarterlyDataErrorBoundary
              componentName="Quarterly Metrics"
              onError={(error, errorInfo) => {
                console.error('[LogoModal] QuarterlyMetrics error:', {
                  brandId: brand.id,
                  brandName: brand.name,
                  error: error.message,
                  stack: errorInfo.componentStack,
                });
              }}
            >
              <QuarterlyMetrics brandId={brand.id} />
            </QuarterlyDataErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};
