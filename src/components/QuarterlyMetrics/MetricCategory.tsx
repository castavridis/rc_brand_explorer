/**
 * MetricCategory Component
 * Feature: 004-quarterly-data-association
 *
 * Groups and displays metrics by category (awareness, perception, relationship)
 */

import React from 'react';
import { MetricValue } from './MetricValue';

interface MetricCategoryProps {
  title: string;
  metrics: Array<{
    label: string;
    value: number | null;
    unit?: string;
  }>;
}

export const MetricCategory: React.FC<MetricCategoryProps> = ({ title, metrics }) => {
  return (
    <div className="metric-category">
      <h4 className="metric-category-title">{title}</h4>
      <div className="metric-category-grid">
        {metrics.map((metric, index) => (
          <MetricValue
            key={`${metric.label}-${index}`}
            label={metric.label}
            value={metric.value}
            unit={metric.unit}
          />
        ))}
      </div>
    </div>
  );
};
