/**
 * QuarterComparison Component
 * Feature: 004-quarterly-data-association
 *
 * Multi-quarter comparison view with metric selection and change calculations
 * Implements T027: sparse quarter handling
 */

import React, { useEffect, useState } from 'react';
import { brandAssociationService } from '../../services/brandAssociationService';
import type { BrandMetrics } from '../../types/quarterlyData';
import { QuarterSelector } from './QuarterSelector';
import { MetricSelector } from './MetricSelector';
import { ComparisonTable } from './ComparisonTable';
import './QuarterComparison.css';

interface QuarterComparisonProps {
  brandId: string;
  brandName: string;
  onClose?: () => void;
}

export const QuarterComparison: React.FC<QuarterComparisonProps> = ({
  brandId,
  brandName,
  onClose,
}) => {
  const [availableQuarters, setAvailableQuarters] = useState<string[]>([]);
  const [selectedQuarters, setSelectedQuarters] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'Total_Users_pct',
    'Total_Prefer_pct',
    'Brand_Stature_C',
  ]);
  const [quarterlyData, setQuarterlyData] = useState<Map<string, BrandMetrics>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // T028: Keyboard navigation - Escape to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get available quarters for this brand
        const quarters = await brandAssociationService.getAvailableQuartersForBrand(brandId);

        if (mounted) {
          setAvailableQuarters(quarters);

          // Auto-select all quarters by default
          setSelectedQuarters(quarters);

          // Load data for all quarters (T027: handles sparse quarters)
          if (quarters.length > 0) {
            const comparison = await brandAssociationService.compareQuarters(brandId, quarters);
            setQuarterlyData(comparison);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load comparison data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [brandId]);

  // Handle quarter selection changes
  const handleQuarterChange = (quarters: string[]) => {
    setSelectedQuarters(quarters);
  };

  // Handle metric selection changes
  const handleMetricChange = (metrics: string[]) => {
    setSelectedMetrics(metrics);
  };

  if (loading) {
    return (
      <div className="quarter-comparison quarter-comparison--loading">
        <div className="spinner"></div>
        <p>Loading comparison data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quarter-comparison quarter-comparison--error" role="alert">
        <p className="error-message">❌ {error}</p>
        {onClose && (
          <button onClick={onClose} className="btn-close">
            Close
          </button>
        )}
      </div>
    );
  }

  // T027: Handle sparse quarter data (brand may have no quarterly data)
  if (availableQuarters.length === 0) {
    return (
      <div className="quarter-comparison quarter-comparison--empty">
        <p className="empty-message">
          No quarterly data available for {brandName} to compare.
        </p>
        {onClose && (
          <button onClick={onClose} className="btn-close">
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="quarter-comparison" role="document">
      <div className="quarter-comparison-header">
        <h2 id="comparison-title">Compare Quarters: {brandName}</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="btn-close"
            aria-label="Close comparison (press Escape)"
            title="Close (Escape)"
          >
            ×
          </button>
        )}
      </div>

      <div className="quarter-comparison-content">
        <div className="quarter-comparison-sidebar">
          <QuarterSelector
            availableQuarters={availableQuarters}
            selectedQuarters={selectedQuarters}
            onSelectionChange={handleQuarterChange}
          />

          <MetricSelector
            selectedMetrics={selectedMetrics}
            onSelectionChange={handleMetricChange}
          />
        </div>

        <div className="quarter-comparison-main">
          <ComparisonTable
            quarters={selectedQuarters}
            quarterlyData={quarterlyData}
            selectedMetrics={selectedMetrics}
          />

          {selectedQuarters.length > 1 && selectedMetrics.length > 0 && (
            <div className="comparison-insights">
              <h3>Comparison Insights</h3>
              <p>
                Comparing <strong>{selectedMetrics.length}</strong> metric
                {selectedMetrics.length !== 1 ? 's' : ''} across{' '}
                <strong>{selectedQuarters.length}</strong> quarter
                {selectedQuarters.length !== 1 ? 's' : ''}.
              </p>
              <p className="insight-note">
                ↑ indicates increase, ↓ indicates decrease from{' '}
                {selectedQuarters[0]} to {selectedQuarters[selectedQuarters.length - 1]}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
