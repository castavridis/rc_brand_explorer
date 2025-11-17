/**
 * QuarterlyDataErrorBoundary Component
 * Feature: 004-quarterly-data-association
 *
 * T040: Error boundary for graceful degradation of quarterly data components
 * Catches errors in child components and displays fallback UI
 */

import React, { Component, ReactNode } from 'react';
import './QuarterlyDataErrorBoundary.css';

interface Props {
  children: ReactNode;
  /**
   * Optional fallback UI to show when an error occurs
   */
  fallback?: ReactNode;
  /**
   * Optional callback when an error is caught
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /**
   * Component name for better error messages
   */
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error boundary specifically for quarterly data components
 * Provides graceful degradation when data loading or rendering fails
 */
export class QuarterlyDataErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console for debugging
    console.error('[QuarterlyDataErrorBoundary] Caught error:', {
      component: this.props.componentName || 'Unknown',
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Update state with error details
    this.setState({
      errorInfo,
    });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      const componentName = this.props.componentName || 'component';
      const errorMessage = this.state.error?.message || 'An unknown error occurred';

      return (
        <div className="quarterly-data-error-boundary" role="alert">
          <div className="error-boundary-content">
            <div className="error-boundary-icon" aria-hidden="true">
              ⚠️
            </div>
            <h3 className="error-boundary-title">
              Unable to Load Quarterly Data
            </h3>
            <p className="error-boundary-message">
              The {componentName} encountered an error and could not display quarterly data.
            </p>
            <details className="error-boundary-details">
              <summary>Error Details</summary>
              <pre className="error-boundary-stack">
                <code>{errorMessage}</code>
              </pre>
            </details>
            <div className="error-boundary-actions">
              <button
                onClick={this.handleReset}
                className="error-boundary-retry-btn"
                aria-label="Try loading the component again"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="error-boundary-reload-btn"
                aria-label="Reload the entire page"
              >
                Reload Page
              </button>
            </div>
            <p className="error-boundary-hint">
              If the problem persists, please contact support or try again later.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
