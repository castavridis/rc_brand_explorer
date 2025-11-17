/**
 * Contract: Brand Association Service
 *
 * Purpose: Associate brands from brands.json with quarterly perception data.
 * Location: src/services/brandAssociationService.ts
 *
 * Dependencies:
 * - IQuarterlyDataLoader (quarterlyDataLoader.ts)
 * - Brand type from src/types/brand.ts
 * - BrandWithQuarterlyData, BrandMetrics types from src/types/quarterlyData.ts
 *
 * Related Requirements:
 * - FR-001: Associate brands with quarterly data by matching names
 * - FR-003: Handle brands with no quarterly data
 * - FR-004: Handle partial quarterly coverage
 * - FR-010: Query all available quarters for specific brand
 * - FR-011: Case-insensitive exact matching
 * - SC-002: Successfully associate 100% of matching brands
 * - SC-003: Identify available quarters for brand
 */

import { Brand } from '../types/brand';
import { BrandWithQuarterlyData, BrandMetrics } from '../types/quarterlyData';
import { IQuarterlyDataLoader } from './quarterlyDataLoader.contract';

export interface IBrandAssociationService {
  /**
   * Get a brand with all its associated quarterly data.
   * Returns brand info + map of quarter → metrics.
   *
   * @param brandId - Brand identifier from brands.json
   * @param quarters - Optional array of specific quarters to load (default: all available)
   * @returns Promise resolving to BrandWithQuarterlyData
   * @throws BrandNotFoundError if brandId doesn't exist in brands.json
   *
   * Example:
   * const brandData = await service.getBrandWithQuarterlyData("youtube-b42bkz");
   * console.log(brandData.availableQuarters); // ["2010Q1", "2010Q3"]
   * console.log(brandData.quarterlyData.get("2010Q1")?.Total_Users_pct); // 75.5
   */
  getBrandWithQuarterlyData(
    brandId: string,
    quarters?: string[]
  ): Promise<BrandWithQuarterlyData>;

  /**
   * Get quarterly metrics for a specific brand and quarter.
   * Returns null if brand has no data for that quarter (per FR-003).
   *
   * @param brandId - Brand identifier from brands.json
   * @param quarter - Quarter identifier (e.g., "2010Q1")
   * @returns Promise resolving to BrandMetrics or null
   * @throws BrandNotFoundError if brandId doesn't exist
   * @throws QuarterNotFoundError if quarter doesn't exist
   *
   * Example:
   * const metrics = await service.getMetricsForQuarter("youtube-b42bkz", "2010Q1");
   * if (metrics) {
   *   console.log(metrics.Total_Users_pct); // 75.5
   * } else {
   *   console.log("No data for this quarter");
   * }
   */
  getMetricsForQuarter(
    brandId: string,
    quarter: string
  ): Promise<BrandMetrics | null>;

  /**
   * Get all quarters where a specific brand has data.
   * Returns empty array if brand has no quarterly data (per FR-003).
   *
   * @param brandId - Brand identifier from brands.json
   * @returns Promise resolving to array of quarter identifiers (sorted)
   * @throws BrandNotFoundError if brandId doesn't exist
   *
   * Example:
   * const quarters = await service.getAvailableQuartersForBrand("youtube-b42bkz");
   * // ["2010Q1", "2010Q3", "2010Q4"]
   */
  getAvailableQuartersForBrand(brandId: string): Promise<string[]>;

  /**
   * Check if a brand has any quarterly data.
   * Optimized query that doesn't load full data (per SC-003).
   *
   * @param brandId - Brand identifier from brands.json
   * @returns Promise resolving to boolean
   * @throws BrandNotFoundError if brandId doesn't exist
   *
   * Example:
   * if (await service.hasBrandQuarterlyData("youtube-b42bkz")) {
   *   // Show quarterly data tab in UI
   * }
   */
  hasBrandQuarterlyData(brandId: string): Promise<boolean>;

  /**
   * Get all brands that have data in a specific quarter.
   * Useful for filtering brand catalog by quarter (per User Story 3).
   *
   * @param quarter - Quarter identifier (e.g., "2010Q1")
   * @returns Promise resolving to array of brand IDs
   * @throws QuarterNotFoundError if quarter doesn't exist
   *
   * Example:
   * const brandIds = await service.getBrandsWithDataInQuarter("2010Q1");
   * // ["youtube-b42bkz", "7up-xyz123", ...]
   */
  getBrandsWithDataInQuarter(quarter: string): Promise<string[]>;

  /**
   * Compare a brand's metrics across multiple quarters.
   * Returns map of quarter → metrics, only for quarters where brand has data.
   *
   * @param brandId - Brand identifier from brands.json
   * @param quarters - Array of quarter identifiers to compare
   * @returns Promise resolving to Map of quarter → BrandMetrics
   * @throws BrandNotFoundError if brandId doesn't exist
   * @throws QuarterNotFoundError if any quarter doesn't exist
   *
   * Example:
   * const comparison = await service.compareQuarters("youtube-b42bkz", ["2010Q1", "2010Q2", "2010Q3"]);
   * comparison.get("2010Q1")?.Total_Users_pct; // 75.5
   * comparison.get("2010Q2"); // undefined (no data for Q2)
   * comparison.get("2010Q3")?.Total_Users_pct; // 80.2
   */
  compareQuarters(
    brandId: string,
    quarters: string[]
  ): Promise<Map<string, BrandMetrics>>;

  /**
   * Get statistics about data coverage for a brand.
   * Useful for displaying data availability indicators.
   *
   * @param brandId - Brand identifier from brands.json
   * @returns Promise resolving to BrandDataCoverage
   * @throws BrandNotFoundError if brandId doesn't exist
   *
   * Example:
   * const coverage = await service.getBrandDataCoverage("youtube-b42bkz");
   * console.log(`${coverage.quartersWithData}/${coverage.totalQuarters} quarters available`);
   */
  getBrandDataCoverage(brandId: string): Promise<BrandDataCoverage>;
}

/**
 * Supporting Types
 */

export interface BrandDataCoverage {
  brandId: string;
  totalQuarters: number;           // Total quarters available in system
  quartersWithData: number;        // Quarters where this brand has data
  availableQuarters: string[];     // List of quarters with data
  coveragePercent: number;         // Percentage of quarters with data (0-100)
  earliestQuarter: string | null;  // First quarter with data
  latestQuarter: string | null;    // Most recent quarter with data
}

/**
 * Error Types
 */

export class BrandNotFoundError extends Error {
  constructor(brandId: string) {
    super(`Brand not found: ${brandId}`);
    this.name = 'BrandNotFoundError';
  }
}

/**
 * Implementation Notes:
 *
 * 1. Brand Name Matching (FR-011):
 *    - Case-insensitive exact match: brand.name.trim().toLowerCase()
 *    - Match against QuarterlyDataRecord.brandName
 *    - No fuzzy matching or similarity threshold
 *
 * 2. Data Association Strategy:
 *    - Load brands.json to get Brand entity
 *    - Load quarterly data files via IQuarterlyDataLoader
 *    - Filter records by matching brandName to brand.name
 *    - Store association as brandId in QuarterlyDataRecord
 *
 * 3. Handling Missing Data (FR-003, FR-004):
 *    - Brand with no quarterly data: return empty arrays/maps
 *    - Brand with partial coverage: only include quarters with data
 *    - Never return placeholder/dummy data (per SC-006)
 *
 * 4. Performance Optimization:
 *    - Cache Brand entities after first load
 *    - Leverage IQuarterlyDataLoader cache for quarterly data
 *    - hasBrandQuarterlyData() checks without loading full metrics
 *    - getAvailableQuartersForBrand() scans quarter files for brandId only
 *
 * 5. Testing:
 *    - Mock IQuarterlyDataLoader
 *    - Test exact name match (case variations)
 *    - Test brand with no data (empty results)
 *    - Test brand with partial coverage (sparse quarters)
 *    - Test compareQuarters() with mix of available/unavailable quarters
 */
