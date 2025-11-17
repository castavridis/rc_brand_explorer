/**
 * Brand Association Service
 * Feature: 004-quarterly-data-association
 *
 * Associates brands from brands.json with quarterly perception data
 * Implements IBrandAssociationService contract
 */

import type { Brand } from '../types/brand';
import type { BrandWithQuarterlyData, BrandMetrics, BrandDataCoverage } from '../types/quarterlyData';
import { quarterlyDataLoader } from './quarterlyDataLoader';
import { loadBrands } from './brandLoader';

// Error class
export class BrandNotFoundError extends Error {
  constructor(brandId: string) {
    super(`Brand not found: ${brandId}`);
    this.name = 'BrandNotFoundError';
  }
}

/**
 * Brand Association Service Implementation
 */
class BrandAssociationService {
  private brandsCache: Brand[] | null = null;

  /**
   * Load brands from brands.json (cached)
   */
  private async loadBrandsCache(): Promise<Brand[]> {
    if (!this.brandsCache) {
      this.brandsCache = await loadBrands();
    }
    return this.brandsCache;
  }

  /**
   * Find brand by ID
   */
  private async findBrandById(brandId: string): Promise<Brand> {
    const brands = await this.loadBrandsCache();
    const brand = brands.find(b => b.id === brandId);

    if (!brand) {
      throw new BrandNotFoundError(brandId);
    }

    return brand;
  }

  /**
   * Get a brand with all its associated quarterly data
   */
  async getBrandWithQuarterlyData(
    brandId: string,
    quarters?: string[]
  ): Promise<BrandWithQuarterlyData> {
    // Get brand info
    const brand = await this.findBrandById(brandId);

    // Get quarters to load (specific or all available)
    const quartersToLoad = quarters || await quarterlyDataLoader.getAvailableQuarters();

    // Load quarterly data for all quarters
    const quarterlyDataMap = await quarterlyDataLoader.loadQuarters(quartersToLoad);

    // Find records for this brand across all quarters
    const brandQuarterlyData = new Map<string, BrandMetrics>();
    const availableQuarters: string[] = [];

    for (const [quarter, quarterData] of quarterlyDataMap.entries()) {
      // Find record matching this brand ID
      const record = quarterData.records.find(r => r.brandId === brandId);

      if (record) {
        brandQuarterlyData.set(quarter, record.metrics);
        availableQuarters.push(quarter);
      }
    }

    // Sort quarters chronologically
    availableQuarters.sort();

    // Determine latest quarter
    const latestQuarter = availableQuarters.length > 0
      ? availableQuarters[availableQuarters.length - 1]
      : undefined;

    return {
      brand,
      quarterlyData: brandQuarterlyData,
      availableQuarters,
      latestQuarter,
    };
  }

  /**
   * Get quarterly metrics for a specific brand and quarter
   */
  async getMetricsForQuarter(
    brandId: string,
    quarter: string
  ): Promise<BrandMetrics | null> {
    // Verify brand exists
    await this.findBrandById(brandId);

    // Load quarter data
    const quarterData = await quarterlyDataLoader.loadQuarter(quarter);

    // Find record for this brand
    const record = quarterData.records.find(r => r.brandId === brandId);

    return record ? record.metrics : null;
  }

  /**
   * Get all quarters where a specific brand has data
   */
  async getAvailableQuartersForBrand(brandId: string): Promise<string[]> {
    // Verify brand exists
    await this.findBrandById(brandId);

    // Load all quarters
    const allQuarters = await quarterlyDataLoader.getAvailableQuarters();
    const quarterDataMap = await quarterlyDataLoader.loadQuarters(allQuarters);

    // Find quarters with this brand
    const availableQuarters: string[] = [];

    for (const [quarter, quarterData] of quarterDataMap.entries()) {
      const hasData = quarterData.records.some(r => r.brandId === brandId);
      if (hasData) {
        availableQuarters.push(quarter);
      }
    }

    return availableQuarters.sort();
  }

  /**
   * Check if a brand has any quarterly data
   */
  async hasBrandQuarterlyData(brandId: string): Promise<boolean> {
    const quarters = await this.getAvailableQuartersForBrand(brandId);
    return quarters.length > 0;
  }

  /**
   * Get all brands that have data in a specific quarter
   */
  async getBrandsWithDataInQuarter(quarter: string): Promise<string[]> {
    // Load quarter data
    const quarterData = await quarterlyDataLoader.loadQuarter(quarter);

    // Extract unique brand IDs
    return quarterData.records.map(r => r.brandId);
  }

  /**
   * Compare a brand's metrics across multiple quarters
   */
  async compareQuarters(
    brandId: string,
    quarters: string[]
  ): Promise<Map<string, BrandMetrics>> {
    // Verify brand exists
    await this.findBrandById(brandId);

    // Load all requested quarters
    const quarterDataMap = await quarterlyDataLoader.loadQuarters(quarters);

    // Build comparison map (only includes quarters with data)
    const comparison = new Map<string, BrandMetrics>();

    for (const [quarter, quarterData] of quarterDataMap.entries()) {
      const record = quarterData.records.find(r => r.brandId === brandId);

      if (record) {
        comparison.set(quarter, record.metrics);
      }
    }

    return comparison;
  }

  /**
   * Get statistics about data coverage for a brand
   */
  async getBrandDataCoverage(brandId: string): Promise<BrandDataCoverage> {
    // Verify brand exists
    await this.findBrandById(brandId);

    // Get all available quarters in system
    const allQuarters = await quarterlyDataLoader.getAvailableQuarters();
    const totalQuarters = allQuarters.length;

    // Get quarters with data for this brand
    const availableQuarters = await this.getAvailableQuartersForBrand(brandId);
    const quartersWithData = availableQuarters.length;

    // Calculate coverage percentage
    const coveragePercent = totalQuarters > 0
      ? (quartersWithData / totalQuarters) * 100
      : 0;

    // Determine earliest and latest quarters
    const earliestQuarter = availableQuarters.length > 0 ? availableQuarters[0] : null;
    const latestQuarter = availableQuarters.length > 0
      ? availableQuarters[availableQuarters.length - 1]
      : null;

    return {
      brandId,
      totalQuarters,
      quartersWithData,
      availableQuarters,
      coveragePercent,
      earliestQuarter,
      latestQuarter,
    };
  }

  /**
   * Clear brand cache (useful for testing)
   */
  clearCache(): void {
    this.brandsCache = null;
  }
}

// Export singleton instance
export const brandAssociationService = new BrandAssociationService();
