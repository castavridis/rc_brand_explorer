/**
 * Contract: Quarterly Data Loader Service
 *
 * Purpose: Load and cache quarterly brand perception data from static JSON files.
 * Location: src/services/quarterlyDataLoader.ts
 *
 * Dependencies:
 * - fetch API (browser native)
 * - QuarterlyData, QuarterIndex types from src/types/quarterlyData.ts
 *
 * Related Requirements:
 * - FR-002: Support ~10 CSV files (quarterly JSON files at runtime)
 * - FR-006: Identify quarter from filename
 * - FR-009: Query brands by quarter
 * - SC-001: Load brand with quarterly data in <2 seconds
 */

import { QuarterlyData, QuarterIndex } from '../types/quarterlyData';

export interface IQuarterlyDataLoader {
  /**
   * Load the master index of available quarters.
   * Should be called once on app initialization.
   *
   * @returns Promise resolving to QuarterIndex
   * @throws Error if index.json cannot be fetched or parsed
   *
   * Example:
   * const index = await loader.loadQuarterIndex();
   * console.log(index.quarters); // ["2010Q1", "2010Q2", ...]
   */
  loadQuarterIndex(): Promise<QuarterIndex>;

  /**
   * Load quarterly data for a specific quarter.
   * Results are cached in memory to avoid redundant fetches.
   *
   * @param quarter - Quarter identifier (e.g., "2010Q1")
   * @returns Promise resolving to QuarterlyData
   * @throws Error if quarter file not found or JSON invalid
   *
   * Example:
   * const data = await loader.loadQuarter("2010Q1");
   * console.log(data.recordCount); // 100
   */
  loadQuarter(quarter: string): Promise<QuarterlyData>;

  /**
   * Load multiple quarters in parallel.
   * More efficient than calling loadQuarter() sequentially.
   *
   * @param quarters - Array of quarter identifiers
   * @returns Promise resolving to Map of quarter → QuarterlyData
   * @throws Error if any quarter fails to load (all-or-nothing)
   *
   * Example:
   * const data = await loader.loadQuarters(["2010Q1", "2010Q2"]);
   * data.get("2010Q1")?.recordCount; // 100
   */
  loadQuarters(quarters: string[]): Promise<Map<string, QuarterlyData>>;

  /**
   * Check if a quarter is already loaded in cache.
   * Useful for optimizing UI (e.g., disable loading spinner if cached).
   *
   * @param quarter - Quarter identifier
   * @returns true if quarter data is in cache
   *
   * Example:
   * if (loader.isQuarterCached("2010Q1")) {
   *   // Instant access, no loading needed
   * }
   */
  isQuarterCached(quarter: string): boolean;

  /**
   * Clear the in-memory cache.
   * Useful for testing or forcing a refresh.
   *
   * Example:
   * loader.clearCache();
   * await loader.loadQuarter("2010Q1"); // Will fetch from network
   */
  clearCache(): void;

  /**
   * Get available quarters without loading full data.
   * Returns cached index if available, otherwise loads it.
   *
   * @returns Promise resolving to array of quarter identifiers
   *
   * Example:
   * const quarters = await loader.getAvailableQuarters();
   * // ["2010Q1", "2010Q2", "2010Q3", "2010Q4"]
   */
  getAvailableQuarters(): Promise<string[]>;
}

/**
 * Error Types
 */

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
 * Implementation Notes:
 *
 * 1. Caching Strategy:
 *    - Use Map<string, QuarterlyData> for in-memory cache
 *    - Cache survives for session lifetime (no localStorage)
 *    - Cache key is quarter identifier (case-insensitive: normalize to uppercase)
 *
 * 2. Performance:
 *    - loadQuarters() uses Promise.all() for parallel fetches
 *    - Base URL: /assets/data/quarterly/
 *    - Filename pattern: {quarter}.json (e.g., "2010Q1.json")
 *
 * 3. Error Handling:
 *    - Network errors: throw with fetch error message
 *    - 404: throw QuarterNotFoundError
 *    - Invalid JSON: throw InvalidQuarterDataError
 *    - Missing required fields: throw InvalidQuarterDataError
 *
 * 4. Testing:
 *    - Mock fetch() in tests
 *    - Test cache hit/miss scenarios
 *    - Test parallel loading with loadQuarters()
 *    - Test error cases (404, invalid JSON, network failure)
 */
