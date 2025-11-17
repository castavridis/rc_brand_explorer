/**
 * MetricValue Component
 * Feature: 004-quarterly-data-association
 *
 * Displays individual metric with null handling (per SC-006)
 */

import React from 'react';

interface MetricValueProps {
  label: string;
  value: number | null;
  unit?: string;
}

export const MetricValue: React.FC<MetricValueProps> = ({ label, value, unit = '%' }) => {
  // Handle null values per FR-007 and SC-006
  const displayValue = value !== null ? `${value.toFixed(2)}${unit}` : 'No data';
  const hasData = value !== null;

  return (
    <div className={`metric-value ${hasData ? 'has-data' : 'no-data'}`}>
      <span className="metric-label">{label}</span>
      <span className="metric-number" aria-label={`${label}: ${displayValue}`}>
        {displayValue}
      </span>
    </div>
  );
};
