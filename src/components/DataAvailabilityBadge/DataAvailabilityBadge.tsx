/**
 * DataAvailabilityBadge Component
 * Feature: 004-quarterly-data-association
 *
 * Displays quarterly data availability indicator for brands
 * Shows quarter count or "No data" message
 * T029: Component implementation
 */

import React from 'react';
import './DataAvailabilityBadge.css';

export interface DataAvailabilityBadgeProps {
  /**
   * Number of quarters available for this brand
   * Pass 0 or undefined for brands with no quarterly data
   */
  quarterCount?: number;

  /**
   * Optional: Show specific quarter names instead of count
   * Example: ["2010Q1", "2010Q2"]
   */
  quarters?: string[];

  /**
   * Display size
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Display variant
   */
  variant?: 'compact' | 'detailed';
}

export const DataAvailabilityBadge: React.FC<DataAvailabilityBadgeProps> = ({
  quarterCount = 0,
  quarters,
  size = 'small',
  variant = 'compact',
}) => {
  const hasData = quarterCount > 0;
  const displayCount = quarters ? quarters.length : quarterCount;

  // Compact variant: Just show count or "No data"
  if (variant === 'compact') {
    return (
      <span
        className={`data-badge data-badge--${size} ${hasData ? 'data-badge--has-data' : 'data-badge--no-data'}`}
        aria-label={hasData ? `${displayCount} quarters of data available` : 'No quarterly data available'}
        title={hasData ? `${displayCount} quarters of data available` : 'No quarterly data available'}
      >
        {hasData ? (
          <>
            <span className="data-badge-icon" aria-hidden="true">📊</span>
            <span className="data-badge-text">{displayCount}</span>
          </>
        ) : (
          <span className="data-badge-text">No data</span>
        )}
      </span>
    );
  }

  // Detailed variant: Show quarter names if available
  return (
    <div
      className={`data-badge data-badge--${size} data-badge--detailed ${hasData ? 'data-badge--has-data' : 'data-badge--no-data'}`}
      aria-label={hasData ? `${displayCount} quarters of data available${quarters ? `: ${quarters.join(', ')}` : ''}` : 'No quarterly data available'}
    >
      <div className="data-badge-header">
        <span className="data-badge-icon" aria-hidden="true">{hasData ? '📊' : '—'}</span>
        <span className="data-badge-label">
          {hasData ? 'Quarterly Data' : 'No Data'}
        </span>
      </div>
      {hasData && quarters && (
        <div className="data-badge-quarters">
          {quarters.map((quarter) => (
            <span key={quarter} className="quarter-chip" title={quarter}>
              {quarter}
            </span>
          ))}
        </div>
      )}
      {hasData && !quarters && (
        <div className="data-badge-count">
          {displayCount} quarter{displayCount !== 1 ? 's' : ''} available
        </div>
      )}
    </div>
  );
};
