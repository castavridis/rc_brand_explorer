/**
 * ComparisonTable Component
 * Feature: 004-quarterly-data-association
 *
 * Side-by-side comparison table with difference calculations
 * Implements T026: percentage change calculation logic
 */

import React from 'react';
import type { BrandMetrics } from '../../types/quarterlyData';
import { METRIC_OPTIONS } from './MetricSelector';

interface ComparisonTableProps {
  quarters: string[];
  quarterlyData: Map<string, BrandMetrics>;
  selectedMetrics: string[];
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  quarters,
  quarterlyData,
  selectedMetrics,
}) => {
  // Calculate percentage change between two values
  const calculateChange = (oldValue: number | null, newValue: number | null): string => {
    if (oldValue === null || newValue === null) {
      return 'N/A';
    }

    const change = newValue - oldValue;
    const changeSymbol = change > 0 ? '+' : '';

    return `${changeSymbol}${change.toFixed(2)}`;
  };

  // Get metric label from key
  const getMetricLabel = (metricKey: string): string => {
    const option = METRIC_OPTIONS.find(m => m.key === metricKey);
    return option ? option.label : metricKey;
  };

  // Format metric value
  const formatValue = (value: number | null, metricKey: string): string => {
    if (value === null) {
      return 'No data';
    }

    // Composite scores (_C suffix) don't use percentage
    const isComposite = metricKey.endsWith('_C');
    return isComposite ? value.toFixed(2) : `${value.toFixed(2)}%`;
  };

  if (quarters.length === 0) {
    return (
      <div className="comparison-table-empty">
        <p>Select quarters to compare</p>
      </div>
    );
  }

  if (selectedMetrics.length === 0) {
    return (
      <div className="comparison-table-empty">
        <p>Select metrics to compare</p>
      </div>
    );
  }

  return (
    <div className="comparison-table-wrapper">
      <table className="comparison-table" role="table">
        <thead>
          <tr>
            <th scope="col">Metric</th>
            {quarters.map(quarter => (
              <th key={quarter} scope="col">
                {quarter}
              </th>
            ))}
            {quarters.length > 1 && (
              <th scope="col" className="change-column">
                Change ({quarters[0]} → {quarters[quarters.length - 1]})
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {selectedMetrics.map(metricKey => {
            const label = getMetricLabel(metricKey);
            const values = quarters.map(q => {
              const metrics = quarterlyData.get(q);
              return metrics ? (metrics as any)[metricKey] as number | null : null;
            });

            // Calculate change between first and last quarter
            const firstValue = values[0];
            const lastValue = values[values.length - 1];
            const change = quarters.length > 1 ? calculateChange(firstValue, lastValue) : null;

            // Determine change direction for styling
            let changeClass = '';
            if (change && change !== 'N/A') {
              const changeNum = parseFloat(change);
              changeClass = changeNum > 0 ? 'positive' : changeNum < 0 ? 'negative' : 'neutral';
            }

            return (
              <tr key={metricKey}>
                <th scope="row" className="metric-name">
                  {label}
                </th>
                {values.map((value, index) => (
                  <td key={`${metricKey}-${quarters[index]}`} className="metric-value">
                    {formatValue(value, metricKey)}
                  </td>
                ))}
                {quarters.length > 1 && (
                  <td className={`change-value ${changeClass}`}>
                    {change}
                    {change && change !== 'N/A' && (
                      <span className="change-indicator" aria-label={`Change: ${change}`}>
                        {parseFloat(change) > 0 ? ' ↑' : parseFloat(change) < 0 ? ' ↓' : ''}
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
