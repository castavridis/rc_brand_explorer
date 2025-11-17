/**
 * MetricSelector Component
 * Feature: 004-quarterly-data-association
 *
 * Choose which metrics to compare across quarters
 * T028: Enhanced keyboard navigation support
 */

import React, { useEffect } from 'react';

export interface MetricOption {
  key: string;
  label: string;
  category: string;
}

interface MetricSelectorProps {
  selectedMetrics: string[];
  onSelectionChange: (metrics: string[]) => void;
}

// Predefined metric options grouped by category
const METRIC_OPTIONS: MetricOption[] = [
  // Awareness & Preference
  { key: 'Total_Users_pct', label: 'Total Users', category: 'Awareness' },
  { key: 'Total_Prefer_pct', label: 'Total Prefer', category: 'Awareness' },

  // Brand Equity
  { key: 'Brand_Stature_C', label: 'Brand Stature', category: 'Brand Equity' },
  { key: 'Brand_Strength_C', label: 'Brand Strength', category: 'Brand Equity' },
  { key: 'Brand_Asset_C', label: 'Brand Asset', category: 'Brand Equity' },

  // Differentiation
  { key: 'Different_pct', label: 'Different', category: 'Differentiation' },
  { key: 'Distinctive_pct', label: 'Distinctive', category: 'Differentiation' },
  { key: 'Innovative_pct', label: 'Innovative', category: 'Differentiation' },
  { key: 'Leader_pct', label: 'Leader', category: 'Differentiation' },

  // Quality
  { key: 'Reliable_pct', label: 'Reliable', category: 'Quality' },
  { key: 'High_quality_pct', label: 'High Quality', category: 'Quality' },
  { key: 'Trustworthy_pct', label: 'Trustworthy', category: 'Quality' },

  // Personality
  { key: 'Friendly_pct', label: 'Friendly', category: 'Personality' },
  { key: 'Authentic_pct', label: 'Authentic', category: 'Personality' },
  { key: 'Stylish_pct', label: 'Stylish', category: 'Personality' },
  { key: 'Fun_pct', label: 'Fun', category: 'Personality' },

  // Relationship
  { key: 'Recommend_to_a_friend_pct', label: 'Recommend to Friend', category: 'Relationship' },
  { key: 'Feel_loyal_pct', label: 'Feel Loyal', category: 'Relationship' },
  { key: 'One_of_my_favorite_brands_pct', label: 'One of Favorites', category: 'Relationship' },
];

export const MetricSelector: React.FC<MetricSelectorProps> = ({
  selectedMetrics,
  onSelectionChange,
}) => {
  const handleMetricToggle = (metricKey: string) => {
    const isSelected = selectedMetrics.includes(metricKey);

    if (isSelected) {
      onSelectionChange(selectedMetrics.filter(m => m !== metricKey));
    } else {
      onSelectionChange([...selectedMetrics, metricKey]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(METRIC_OPTIONS.map(m => m.key));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  // T028: Keyboard navigation for Select All (Ctrl/Cmd + A within this component)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if we're focused within the metric selector
      const target = event.target as HTMLElement;
      const inMetricSelector = target.closest('.metric-selector');

      if (!inMetricSelector) return;

      // Ctrl/Cmd + A to select all metrics
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault();
        if (selectedMetrics.length < METRIC_OPTIONS.length) {
          handleSelectAll();
        }
      }

      // Ctrl/Cmd + D to clear all (deselect)
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        if (selectedMetrics.length > 0) {
          handleClearAll();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedMetrics, handleSelectAll, handleClearAll]);

  // Group metrics by category
  const categories = Array.from(new Set(METRIC_OPTIONS.map(m => m.category)));

  return (
    <div className="metric-selector">
      <div className="metric-selector-header">
        <h4>Select Metrics to Compare</h4>
        <p className="keyboard-hint" aria-label="Keyboard shortcuts available">
          <small>Tip: Ctrl+A to select all, Ctrl+D to clear</small>
        </p>
      </div>

      {categories.map(category => {
        const categoryMetrics = METRIC_OPTIONS.filter(m => m.category === category);

        return (
          <div key={category} className="metric-category-section">
            <h5 className="metric-category-heading">{category}</h5>
            <div className="metric-options-grid">
              {categoryMetrics.map(metric => {
                const isSelected = selectedMetrics.includes(metric.key);

                return (
                  <label
                    key={metric.key}
                    className={`metric-checkbox ${isSelected ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleMetricToggle(metric.key)}
                      aria-label={`${metric.label} ${isSelected ? 'selected' : 'not selected'}`}
                    />
                    <span className="metric-label">{metric.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      {selectedMetrics.length > 0 && (
        <p className="selection-summary" aria-live="polite">
          {selectedMetrics.length} metric{selectedMetrics.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
};

export { METRIC_OPTIONS };
