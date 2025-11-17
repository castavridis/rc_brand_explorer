/**
 * QuarterSelector Component
 * Feature: 004-quarterly-data-association
 *
 * Multi-select quarter picker for comparison
 * T028: Enhanced keyboard navigation support
 */

import React, { useEffect } from 'react';

interface QuarterSelectorProps {
  availableQuarters: string[];
  selectedQuarters: string[];
  onSelectionChange: (quarters: string[]) => void;
}

export const QuarterSelector: React.FC<QuarterSelectorProps> = ({
  availableQuarters,
  selectedQuarters,
  onSelectionChange,
}) => {
  const handleQuarterToggle = (quarter: string) => {
    const isSelected = selectedQuarters.includes(quarter);

    if (isSelected) {
      // Remove quarter
      onSelectionChange(selectedQuarters.filter(q => q !== quarter));
    } else {
      // Add quarter
      onSelectionChange([...selectedQuarters, quarter].sort());
    }
  };

  const handleSelectAll = () => {
    onSelectionChange([...availableQuarters]);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  // T028: Keyboard navigation for Select All (Ctrl/Cmd + A within this component)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if we're focused within the quarter selector
      const target = event.target as HTMLElement;
      const inQuarterSelector = target.closest('.quarter-selector');

      if (!inQuarterSelector) return;

      // Ctrl/Cmd + A to select all
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault();
        if (selectedQuarters.length < availableQuarters.length) {
          handleSelectAll();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [availableQuarters, selectedQuarters, handleSelectAll]);

  return (
    <div className="quarter-selector">
      <div className="quarter-selector-header">
        <h4>Select Quarters to Compare</h4>
        <div className="quarter-selector-actions">
          <button
            onClick={handleSelectAll}
            className="btn-select-all"
            disabled={selectedQuarters.length === availableQuarters.length}
            aria-label="Select all quarters (Ctrl+A or Cmd+A)"
            title="Keyboard shortcut: Ctrl+A or Cmd+A"
          >
            Select All
          </button>
          <button
            onClick={handleClearAll}
            className="btn-clear-all"
            disabled={selectedQuarters.length === 0}
            aria-label="Clear all quarters"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="quarter-selector-grid" role="group" aria-label="Quarter selection">
        {availableQuarters.map((quarter) => {
          const isSelected = selectedQuarters.includes(quarter);

          return (
            <label
              key={quarter}
              className={`quarter-checkbox ${isSelected ? 'selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleQuarterToggle(quarter)}
                aria-label={`${quarter} ${isSelected ? 'selected' : 'not selected'}`}
              />
              <span className="quarter-label">{quarter}</span>
            </label>
          );
        })}
      </div>

      {selectedQuarters.length > 0 && (
        <p className="selection-summary" aria-live="polite">
          {selectedQuarters.length} quarter{selectedQuarters.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
};
