/**
 * QuarterlyMetrics Component
 * Feature: 004-quarterly-data-association
 *
 * Displays brand perception metrics from quarterly data
 * Handles loading, error, and empty states (T016-T018)
 */

import React, { useEffect, useState } from 'react';
import { brandAssociationService } from '../../services/brandAssociationService';
import type { BrandWithQuarterlyData } from '../../types/quarterlyData';
import { MetricCategory } from './MetricCategory';
import { QuarterComparison } from '../QuarterComparison';
import './QuarterlyMetrics.css';

interface QuarterlyMetricsProps {
  brandId: string;
}

export const QuarterlyMetrics: React.FC<QuarterlyMetricsProps> = ({ brandId }) => {
  const [data, setData] = useState<BrandWithQuarterlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const brandData = await brandAssociationService.getBrandWithQuarterlyData(brandId);

        if (mounted) {
          setData(brandData);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load quarterly data');
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

  // T016: Loading state
  if (loading) {
    return (
      <div className="quarterly-metrics quarterly-metrics--loading" role="status">
        <div className="spinner" aria-label="Loading quarterly data"></div>
        <p>Loading quarterly data...</p>
      </div>
    );
  }

  // T017: Error state
  if (error) {
    return (
      <div className="quarterly-metrics quarterly-metrics--error" role="alert">
        <p className="error-message">❌ {error}</p>
        <p className="error-hint">Please try again later or contact support if the problem persists.</p>
      </div>
    );
  }

  // T018: Empty state (no quarterly data available per SC-006)
  if (!data || data.availableQuarters.length === 0) {
    return (
      <div className="quarterly-metrics quarterly-metrics--empty">
        <p className="empty-message">No quarterly data available for this brand.</p>
        <p className="empty-hint">
          This brand may not have been included in quarterly research surveys.
        </p>
      </div>
    );
  }

  // Main content: display metrics for all available quarters
  return (
    <div className="quarterly-metrics">
      <h3>Quarterly Brand Perception Data</h3>
      <p className="data-summary">
        Available quarters: <strong>{data.availableQuarters.join(', ')}</strong>
        {data.latestQuarter && (
          <span className="latest-quarter"> (Latest: {data.latestQuarter})</span>
        )}
      </p>

      {/* T025: Compare Quarters button (only show if 2+ quarters available) */}
      {data.availableQuarters.length >= 2 && (
        <div className="comparison-actions">
          <button
            className="btn-compare-quarters"
            onClick={() => setShowComparison(true)}
            aria-label={`Compare ${data.availableQuarters.length} quarters for ${data.brand.name}`}
          >
            Compare Quarters
          </button>
        </div>
      )}

      {/* T025: Show QuarterComparison overlay when requested */}
      {showComparison && (
        <div
          className="comparison-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="comparison-title"
        >
          <QuarterComparison
            brandId={brandId}
            brandName={data.brand.name}
            onClose={() => setShowComparison(false)}
          />
        </div>
      )}

      {data.availableQuarters.map((quarter) => {
        const metrics = data.quarterlyData.get(quarter);
        if (!metrics) return null;

        return (
          <div key={quarter} className="quarter-section">
            <h4 className="quarter-title">{quarter}</h4>

            {/* Awareness & Preference Metrics */}
            <MetricCategory
              title="Awareness & Preference"
              metrics={[
                { label: 'Total Users', value: metrics.Total_Users_pct },
                { label: 'Total Prefer', value: metrics.Total_Prefer_pct },
              ]}
            />

            {/* Brand Equity Composite Scores */}
            <MetricCategory
              title="Brand Equity"
              metrics={[
                { label: 'Brand Stature', value: metrics.Brand_Stature_C, unit: '' },
                { label: 'Brand Strength', value: metrics.Brand_Strength_C, unit: '' },
                { label: 'Brand Asset', value: metrics.Brand_Asset_C, unit: '' },
                { label: 'Energized Differentiation', value: metrics.Energized_Differentiation_C, unit: '' },
                { label: 'Relevance', value: metrics.Relevance_C, unit: '' },
                { label: 'Esteem', value: metrics.Esteem_C, unit: '' },
                { label: 'Knowledge', value: metrics.Knowledge_C, unit: '' },
              ]}
            />

            {/* Differentiation Attributes */}
            <MetricCategory
              title="Differentiation"
              metrics={[
                { label: 'Different', value: metrics.Different_pct },
                { label: 'Distinctive', value: metrics.Distinctive_pct },
                { label: 'Unique', value: metrics.Unique_pct },
                { label: 'Dynamic', value: metrics.Dynamic_pct },
                { label: 'Innovative', value: metrics.Innovative_pct },
                { label: 'Leader', value: metrics.Leader_pct },
              ]}
            />

            {/* Quality & Performance */}
            <MetricCategory
              title="Quality & Performance"
              metrics={[
                { label: 'Reliable', value: metrics.Reliable_pct },
                { label: 'High Quality', value: metrics.High_quality_pct },
                { label: 'High Performance', value: metrics.High_Performance_pct },
              ]}
            />

            {/* Personality Attributes (top 10) */}
            <MetricCategory
              title="Brand Personality"
              metrics={[
                { label: 'Trustworthy', value: metrics.Trustworthy_pct },
                { label: 'Friendly', value: metrics.Friendly_pct },
                { label: 'Authentic', value: metrics.Authentic_pct },
                { label: 'Stylish', value: metrics.Stylish_pct },
                { label: 'Fun', value: metrics.Fun_pct },
                { label: 'Progressive', value: metrics.Progressive_pct },
                { label: 'Visionary', value: metrics.Visionary_pct },
                { label: 'Up To Date', value: metrics.Up_To_Date_pct },
              ]}
            />

            {/* Relationship & Engagement (key metrics) */}
            <MetricCategory
              title="Customer Relationship"
              metrics={[
                { label: 'Recommend to Friend', value: metrics.Recommend_to_a_friend_pct },
                { label: 'Feel Loyal', value: metrics.Feel_loyal_pct },
                { label: 'One of Favorites', value: metrics.One_of_my_favorite_brands_pct },
                { label: 'Would Miss If Went Away', value: metrics.Would_miss_if_went_away_pct },
              ]}
            />
          </div>
        );
      })}
    </div>
  );
};
