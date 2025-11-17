/**
 * Type definitions for quarterly brand perception data
 * Feature: 004-quarterly-data-association
 */

import { Brand } from './brand';

/**
 * Brand metrics from quarterly CSV files
 * All fields are nullable to handle missing data (FR-007)
 */
export interface BrandMetrics {
  // Awareness & Preference Metrics
  Total_Users_pct: number | null;
  Total_Prefer_pct: number | null;

  // Brand Equity Composite Scores (suffix: _C)
  Energized_Differentiation_C: number | null;
  Relevance_C: number | null;
  Esteem_C: number | null;
  Knowledge_C: number | null;
  Brand_Stature_C: number | null;
  Brand_Strength_C: number | null;
  Brand_Asset_C: number | null;

  // Differentiation Attributes
  Different_pct: number | null;
  Distinctive_pct: number | null;
  Unique_pct: number | null;
  Dynamic_pct: number | null;
  Innovative_pct: number | null;
  Leader_pct: number | null;
  Original_pct: number | null;
  Cutting_Edge_C: number | null;

  // Quality & Performance Attributes
  Reliable_pct: number | null;
  High_quality_pct: number | null;
  High_Performance_pct: number | null;
  Superior_C: number | null;
  Worth_More_pct: number | null;

  // Personality & Character Attributes
  Arrogant_pct: number | null;
  Authentic_pct: number | null;
  Best_Brand_pct: number | null;
  Carefree_pct: number | null;
  Cares_Customers_pct: number | null;
  Charming_pct: number | null;
  Daring_pct: number | null;
  Down_to_Earth_pct: number | null;
  Energetic_pct: number | null;
  Friendly_pct: number | null;
  Fun_pct: number | null;
  Gaining_In_Popularity_pct: number | null;
  Glamorous_pct: number | null;
  Good_Value_pct: number | null;
  Healthy_pct: number | null;
  Helpful_pct: number | null;
  Independent_pct: number | null;
  Intelligent_pct: number | null;
  Kind_pct: number | null;
  Obliging_pct: number | null;
  Prestigious_pct: number | null;
  Progressive_pct: number | null;
  Restrained_pct: number | null;
  Rugged_pct: number | null;
  Sensuous_pct: number | null;
  Simple_pct: number | null;
  Social_pct: number | null;
  Socially_Responsible_pct: number | null;
  Straightforward_pct: number | null;
  Stylish_pct: number | null;
  Traditional_pct: number | null;
  Trendy_pct: number | null;
  Trustworthy_pct: number | null;
  Unapproachable_pct: number | null;
  Up_To_Date_pct: number | null;
  Upper_Class_pct: number | null;
  Visionary_pct: number | null;
  Classic_C: number | null;
  Chic_C: number | null;
  Customer_Centric_C: number | null;
  Outgoing_C: number | null;
  No_Nonsense_C: number | null;
  Distant_C: number | null;

  // Relationship & Engagement Metrics
  Adapts_to_my_needs_pct: number | null;
  Belong_to_a_club_pct: number | null;
  Best_option_available_pct: number | null;
  Fairly_priced_pct: number | null;
  Feel_loyal_pct: number | null;
  Goes_out_of_its_way_pct: number | null;
  Identify_with_other_users_pct: number | null;
  Interested_learning_more_pct: number | null;
  Interested_special_events_pct: number | null;
  Meets_my_needs_completely_pct: number | null;
  My_kind_of_brand_pct: number | null;
  One_of_my_favorite_brands_pct: number | null;
  Recommend_to_a_friend_pct: number | null;
  Resolves_conflicts_well_pct: number | null;
  Strongest_relationship_pct: number | null;
  Want_my_business_pct: number | null;
  Worth_a_premium_price_pct: number | null;
  Would_miss_if_went_away_pct: number | null;

  // Additional Metric
  Regard_MS: number | null;
}

/**
 * Brand metrics from a single quarter CSV file
 */
export interface QuarterlyDataRecord {
  brandId: string;        // Reference to Brand.id from brands.json
  brandName: string;      // Denormalized for debugging/validation
  csvBrandId: string;     // Original "Brand id" from CSV
  category: string;       // Category from CSV (may differ from brands.json)
  metrics: BrandMetrics;  // All 85+ metric columns
}

/**
 * Complete dataset for a single quarter
 * Stored at /public/assets/data/quarterly/{quarter}.json
 */
export interface QuarterlyData {
  quarter: string;                   // e.g., "2010Q1" (from filename)
  sourceFile: string;                // e.g., "2010Q1-Table 1.csv"
  processedAt: string;               // ISO 8601 timestamp (build time)
  recordCount: number;               // Total records in this quarter
  matchedBrands: number;             // Count of records matched to brands.json
  unmatchedBrands: string[];         // CSV brand names with no match
  records: QuarterlyDataRecord[];    // All data records for this quarter
}

/**
 * Master index of all available quarters
 * Stored at /public/assets/data/quarterly/index.json
 */
export interface QuarterIndex {
  quarters: string[];                    // Sorted list (e.g., ["2010Q1", "2010Q2", ...])
  quarterFiles: Record<string, string>;  // Map quarter → filename
  lastUpdated: string;                   // ISO 8601 timestamp (build time)
  totalQuarters: number;                 // Count of available quarters
}

/**
 * Composite view combining Brand with quarterly data
 * Used in UI components for displaying brand metrics
 */
export interface BrandWithQuarterlyData {
  brand: Brand;                              // Core brand info from brands.json
  quarterlyData: Map<string, BrandMetrics>;  // Quarter → metrics
  availableQuarters: string[];               // Sorted list of quarters with data
  latestQuarter?: string;                    // Most recent quarter (if any)
}

/**
 * Statistics about data coverage for a brand
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
