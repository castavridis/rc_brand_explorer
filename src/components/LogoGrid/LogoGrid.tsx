import React, { useState, useEffect } from 'react';
import type { Brand } from '@/types/brand';
import { LogoCard } from '../LogoCard/LogoCard';
import { filterByQuarterlyDataAvailability, filterBySpecificQuarter, getQuarterCountForBrand } from '@/services/searchFilter';
import { quarterlyDataLoader } from '@/services/quarterlyDataLoader';
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
  // T035: Filter state management
  const [filterByData, setFilterByData] = useState(false);
  const [filterByQuarter, setFilterByQuarter] = useState<string>('');
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>(brands);
  const [quarterCounts, setQuarterCounts] = useState<Map<string, number>>(new Map());
  const [availableQuarters, setAvailableQuarters] = useState<string[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);

  // Load available quarters on mount
  useEffect(() => {
    const loadQuarters = async () => {
      try {
        const quarters = await quarterlyDataLoader.getAvailableQuarters();
        setAvailableQuarters(quarters);
      } catch (error) {
        console.error('Failed to load available quarters:', error);
      }
    };
    loadQuarters();
  }, []);

  // Apply filters whenever filter state or brands change
  useEffect(() => {
    const applyFilters = async () => {
      if (!filterByData && !filterByQuarter) {
        // No filters active - show all brands
        setFilteredBrands(brands);
        setIsFiltering(false);
        return;
      }

      setIsFiltering(true);
      let result = brands;

      try {
        // Apply quarterly data filter
        if (filterByData) {
          result = await filterByQuarterlyDataAvailability(result, true);
        }

        // Apply specific quarter filter
        if (filterByQuarter) {
          result = await filterBySpecificQuarter(result, filterByQuarter);
        }

        setFilteredBrands(result);

        // Load quarter counts for filtered brands
        const counts = new Map<string, number>();
        for (const brand of result) {
          const count = await getQuarterCountForBrand(brand.id);
          counts.set(brand.id, count);
        }
        setQuarterCounts(counts);
      } catch (error) {
        console.error('Error applying filters:', error);
        setFilteredBrands(brands);
      } finally {
        setIsFiltering(false);
      }
    };

    applyFilters();
  }, [filterByData, filterByQuarter, brands]);

  // T036: Clear filters handler
  const handleClearFilters = () => {
    setFilterByData(false);
    setFilterByQuarter('');
  };

  const hasActiveFilters = filterByData || filterByQuarter !== '';

  if (loading) {
    return <div className={styles.loading}>Loading logos...</div>;
  }

  return (
    <div className={styles.container}>
      {/* T032: Filter controls */}
      <div className={styles.filterControls}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <input
              type="checkbox"
              checked={filterByData}
              onChange={(e) => setFilterByData(e.target.checked)}
              disabled={isFiltering}
              aria-label="Filter brands with quarterly data"
            />
            <span>Show only brands with quarterly data</span>
          </label>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="quarter-filter" className={styles.filterLabel}>
            Filter by quarter:
          </label>
          <select
            id="quarter-filter"
            value={filterByQuarter}
            onChange={(e) => setFilterByQuarter(e.target.value)}
            disabled={isFiltering}
            className={styles.filterSelect}
            aria-label="Filter by specific quarter"
          >
            <option value="">All quarters</option>
            {availableQuarters.map((quarter) => (
              <option key={quarter} value={quarter}>
                {quarter}
              </option>
            ))}
          </select>
        </div>

        {/* T036: Clear filters button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            disabled={isFiltering}
            className={styles.clearFiltersBtn}
            aria-label="Clear all filters"
          >
            Clear filters
          </button>
        )}

        <div className={styles.resultCount} aria-live="polite">
          {isFiltering ? 'Filtering...' : `Showing ${filteredBrands.length} of ${brands.length} brands`}
        </div>
      </div>

      {/* Brand grid */}
      {filteredBrands.length === 0 ? (
        <div className={styles.empty}>{hasActiveFilters ? 'No brands match the selected filters' : emptyMessage}</div>
      ) : (
        <div className={styles.grid} role="list">
          {filteredBrands.map((brand) => (
            <LogoCard
              key={brand.id}
              brand={brand}
              onClick={() => onBrandClick(brand)}
              quarterCount={quarterCounts.get(brand.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
