import React from 'react';
import type { Brand } from '@/types/brand';
import { LogoCard } from '../LogoCard/LogoCard';
import styles from './LogoGrid.module.css';

interface LogoGridProps {
  brands: Brand[];
  onBrandClick: (brand: Brand) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export const LogoGrid: React.FC<LogoGridProps> = ({
  brands,
  onBrandClick,
  loading = false,
  emptyMessage = 'No logos found',
}) => {
  if (loading) {
    return <div className={styles.loading}>Loading logos...</div>;
  }

  if (brands.length === 0) {
    return <div className={styles.empty}>{emptyMessage}</div>;
  }

  return (
    <div className={styles.grid} role="list">
      {brands.map((brand) => (
        <LogoCard key={brand.id} brand={brand} onClick={() => onBrandClick(brand)} />
      ))}
    </div>
  );
};
