/**
 * Quarterly Data Loader Service
 * Feature: 004-quarterly-data-association
 *
 * Loads and caches quarterly brand perception data from static JSON files
 * Implements IQuarterlyDataLoader contract
 */

import type { QuarterlyData, QuarterIndex } from '../types/quarterlyData';

// Error classes
export class QuarterNotFoundError extends Error {
  constructor(quarter: string) {
    super(`Quarter data not found: ${quarter}`);
    this.name = 'QuarterNotFoundError';
  }
}

export class InvalidQuarterDataError extends Error {
  constructor(quarter: string, reason: string) {
    super(`Invalid data for quarter ${quarter}: ${reason}`);
    this.name = 'InvalidQuarterDataError';
  }
}

export class QuarterIndexLoadError extends Error {
  constructor(reason: string) {
    super(`Failed to load quarter index: ${reason}`);
    this.name = 'QuarterIndexLoadError';
  }
}

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  totalLoads: number;
  cacheHits: number;
  cacheMisses: number;
  averageLoadTime: number;
  slowLoads: number; // Count of loads >2s
  loadTimes: number[];
}

/**
 * Quarterly Data Loader Implementation
 * T037: Enhanced with performance monitoring
 * T039: Enhanced with cache optimization
 */
class QuarterlyDataLoader {
  private baseUrl = '/assets/data/quarterly/';
  private cache: Map<string, QuarterlyData> = new Map();
  private indexCache: QuarterIndex | null = null;

  // T037: Performance monitoring
  private performanceMetrics: PerformanceMetrics = {
    totalLoads: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageLoadTime: 0,
    slowLoads: 0,
    loadTimes: [],
  };

  // Performance threshold from SC-001
  private readonly PERFORMANCE_THRESHOLD_MS = 2000;

  /**
   * Load the master index of available quarters
   */
  async loadQuarterIndex(): Promise<QuarterIndex> {
    // Return cached index if available
    if (this.indexCache) {
      return this.indexCache;
    }

    try {
      const response = await fetch(`${this.baseUrl}index.json`);

      if (!response.ok) {
        throw new QuarterIndexLoadError(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate index structure
      if (!data.quarters || !Array.isArray(data.quarters)) {
        throw new QuarterIndexLoadError('Invalid index structure: missing quarters array');
      }

      this.indexCache = data as QuarterIndex;
      return this.indexCache;
    } catch (error) {
      if (error instanceof QuarterIndexLoadError) {
        throw error;
      }
      throw new QuarterIndexLoadError(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Load quarterly data for a specific quarter
   * Results are cached in memory
   * T037: Enhanced with performance monitoring
   */
  async loadQuarter(quarter: string): Promise<QuarterlyData> {
    // Normalize quarter to uppercase
    const normalizedQuarter = quarter.toUpperCase();

    // T037: Track total load attempts
    this.performanceMetrics.totalLoads++;

    // Check cache first
    if (this.cache.has(normalizedQuarter)) {
      // T037: Track cache hit
      this.performanceMetrics.cacheHits++;
      return this.cache.get(normalizedQuarter)!;
    }

    // T037: Track cache miss and start performance timer
    this.performanceMetrics.cacheMisses++;
    const startTime = performance.now();

    try {
      const response = await fetch(`${this.baseUrl}${normalizedQuarter}.json`);

      if (response.status === 404) {
        throw new QuarterNotFoundError(normalizedQuarter);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate quarter data structure
      if (!data.quarter || !data.records || !Array.isArray(data.records)) {
        throw new InvalidQuarterDataError(
          normalizedQuarter,
          'Invalid data structure: missing required fields'
        );
      }

      const quarterlyData = data as QuarterlyData;

      // Cache the data
      this.cache.set(normalizedQuarter, quarterlyData);

      // T037: Track load time
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      this.recordLoadTime(loadTime, normalizedQuarter);

      return quarterlyData;
    } catch (error) {
      if (error instanceof QuarterNotFoundError || error instanceof InvalidQuarterDataError) {
        throw error;
      }
      throw new Error(`Failed to load quarter ${normalizedQuarter}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * T037: Record load time and warn if exceeds threshold
   */
  private recordLoadTime(loadTime: number, quarter: string): void {
    this.performanceMetrics.loadTimes.push(loadTime);

    // Calculate new average
    const sum = this.performanceMetrics.loadTimes.reduce((a, b) => a + b, 0);
    this.performanceMetrics.averageLoadTime = sum / this.performanceMetrics.loadTimes.length;

    // Warn if load time exceeds threshold (SC-001: <2s)
    if (loadTime > this.PERFORMANCE_THRESHOLD_MS) {
      this.performanceMetrics.slowLoads++;
      console.warn(
        `[quarterlyDataLoader] Slow quarter load detected: ${quarter} took ${loadTime.toFixed(0)}ms (threshold: ${this.PERFORMANCE_THRESHOLD_MS}ms)`
      );
    }

    // Log performance summary periodically (every 10 loads)
    if (this.performanceMetrics.cacheMisses % 10 === 0) {
      this.logPerformanceSummary();
    }
  }

  /**
   * T037: Log performance metrics summary
   */
  private logPerformanceSummary(): void {
    const cacheHitRate = this.performanceMetrics.totalLoads > 0
      ? (this.performanceMetrics.cacheHits / this.performanceMetrics.totalLoads * 100).toFixed(1)
      : '0.0';

    console.info('[quarterlyDataLoader] Performance Summary:', {
      totalLoads: this.performanceMetrics.totalLoads,
      cacheHits: this.performanceMetrics.cacheHits,
      cacheMisses: this.performanceMetrics.cacheMisses,
      cacheHitRate: `${cacheHitRate}%`,
      averageLoadTime: `${this.performanceMetrics.averageLoadTime.toFixed(0)}ms`,
      slowLoads: this.performanceMetrics.slowLoads,
    });
  }

  /**
   * Load multiple quarters in parallel
   */
  async loadQuarters(quarters: string[]): Promise<Map<string, QuarterlyData>> {
    const promises = quarters.map(quarter => this.loadQuarter(quarter));
    const results = await Promise.all(promises);

    const map = new Map<string, QuarterlyData>();
    results.forEach((data, index) => {
      map.set(quarters[index].toUpperCase(), data);
    });

    return map;
  }

  /**
   * Check if a quarter is already loaded in cache
   */
  isQuarterCached(quarter: string): boolean {
    return this.cache.has(quarter.toUpperCase());
  }

  /**
   * Clear the in-memory cache
   */
  clearCache(): void {
    this.cache.clear();
    this.indexCache = null;
  }

  /**
   * Get available quarters without loading full data
   */
  async getAvailableQuarters(): Promise<string[]> {
    const index = await this.loadQuarterIndex();
    return index.quarters;
  }

  /**
   * T037: Get current performance metrics
   */
  getPerformanceMetrics(): Readonly<PerformanceMetrics> {
    return { ...this.performanceMetrics };
  }

  /**
   * T039: Get cache statistics
   */
  getCacheStats(): {
    cacheSize: number;
    cachedQuarters: string[];
    cacheHitRate: string;
    averageLoadTime: string;
  } {
    const cacheHitRate = this.performanceMetrics.totalLoads > 0
      ? (this.performanceMetrics.cacheHits / this.performanceMetrics.totalLoads * 100).toFixed(1)
      : '0.0';

    return {
      cacheSize: this.cache.size,
      cachedQuarters: Array.from(this.cache.keys()),
      cacheHitRate: `${cacheHitRate}%`,
      averageLoadTime: `${this.performanceMetrics.averageLoadTime.toFixed(0)}ms`,
    };
  }

  /**
   * T039: Preload quarters to warm up cache
   * Useful for optimizing initial page load
   */
  async preloadQuarters(quarters: string[]): Promise<void> {
    console.info(`[quarterlyDataLoader] Preloading ${quarters.length} quarters...`);
    const startTime = performance.now();

    await this.loadQuarters(quarters);

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    console.info(`[quarterlyDataLoader] Preload complete in ${totalTime.toFixed(0)}ms`);
  }
}

// Export singleton instance
export const quarterlyDataLoader = new QuarterlyDataLoader();
