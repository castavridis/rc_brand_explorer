/**
 * CSV Parser utility for quarterly brand perception data
 * Feature: 004-quarterly-data-association
 *
 * Uses csv-parser library to handle files with 85+ columns
 */

import csvParser from 'csv-parser';
import { createReadStream } from 'fs';
import { BrandMetrics } from '../types/quarterlyData';

/**
 * Raw CSV row from quarterly data file
 * Contains brand info and all metric columns
 */
export interface QuarterlyCSVRow {
  'Brand id': string;
  'Brand name': string;
  Category: string;
  [key: string]: string; // All metric columns are initially parsed as strings
}

/**
 * Parse quarterly CSV file using csv-parser library
 *
 * @param csvPath - Path to CSV file
 * @returns Promise resolving to array of CSV rows
 *
 * @example
 * const rows = await parseQuarterlyCSV('./2010Q1-Table 1.csv');
 * console.log(rows[0]['Brand name']); // "7UP"
 */
export async function parseQuarterlyCSV(csvPath: string): Promise<QuarterlyCSVRow[]> {
  return new Promise((resolve, reject) => {
    const rows: QuarterlyCSVRow[] = [];

    createReadStream(csvPath)
      .pipe(csvParser())
      .on('data', (row: QuarterlyCSVRow) => {
        rows.push(row);
      })
      .on('end', () => {
        resolve(rows);
      })
      .on('error', (error: Error) => {
        reject(new Error(`Failed to parse CSV file ${csvPath}: ${error.message}`));
      });
  });
}

/**
 * Convert CSV row to BrandMetrics object
 * Parses string values to numbers, handles empty/null values
 *
 * @param row - Raw CSV row
 * @returns BrandMetrics object with all fields parsed
 */
export function csvRowToMetrics(row: QuarterlyCSVRow): BrandMetrics {
  const parseMetric = (value: string): number | null => {
    if (!value || value.trim() === '') return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  return {
    // Awareness & Preference Metrics
    Total_Users_pct: parseMetric(row.Total_Users_pct),
    Total_Prefer_pct: parseMetric(row.Total_Prefer_pct),

    // Brand Equity Composite Scores
    Energized_Differentiation_C: parseMetric(row.Energized_Differentiation_C),
    Relevance_C: parseMetric(row.Relevance_C),
    Esteem_C: parseMetric(row.Esteem_C),
    Knowledge_C: parseMetric(row.Knowledge_C),
    Brand_Stature_C: parseMetric(row.Brand_Stature_C),
    Brand_Strength_C: parseMetric(row.Brand_Strength_C),
    Brand_Asset_C: parseMetric(row.Brand_Asset_C),

    // Differentiation Attributes
    Different_pct: parseMetric(row.Different_pct),
    Distinctive_pct: parseMetric(row.Distinctive_pct),
    Unique_pct: parseMetric(row.Unique_pct),
    Dynamic_pct: parseMetric(row.Dynamic_pct),
    Innovative_pct: parseMetric(row.Innovative_pct),
    Leader_pct: parseMetric(row.Leader_pct),
    Original_pct: parseMetric(row.Original_pct),
    Cutting_Edge_C: parseMetric(row.Cutting_Edge_C),

    // Quality & Performance Attributes
    Reliable_pct: parseMetric(row.Reliable_pct),
    High_quality_pct: parseMetric(row.High_quality_pct),
    High_Performance_pct: parseMetric(row.High_Performance_pct),
    Superior_C: parseMetric(row.Superior_C),
    Worth_More_pct: parseMetric(row.Worth_More_pct),

    // Personality & Character Attributes
    Arrogant_pct: parseMetric(row.Arrogant_pct),
    Authentic_pct: parseMetric(row.Authentic_pct),
    Best_Brand_pct: parseMetric(row.Best_Brand_pct),
    Carefree_pct: parseMetric(row.Carefree_pct),
    Cares_Customers_pct: parseMetric(row.Cares_Customers_pct),
    Charming_pct: parseMetric(row.Charming_pct),
    Daring_pct: parseMetric(row.Daring_pct),
    Down_to_Earth_pct: parseMetric(row.Down_to_Earth_pct),
    Energetic_pct: parseMetric(row.Energetic_pct),
    Friendly_pct: parseMetric(row.Friendly_pct),
    Fun_pct: parseMetric(row.Fun_pct),
    Gaining_In_Popularity_pct: parseMetric(row.Gaining_In_Popularity_pct),
    Glamorous_pct: parseMetric(row.Glamorous_pct),
    Good_Value_pct: parseMetric(row.Good_Value_pct),
    Healthy_pct: parseMetric(row.Healthy_pct),
    Helpful_pct: parseMetric(row.Helpful_pct),
    Independent_pct: parseMetric(row.Independent_pct),
    Intelligent_pct: parseMetric(row.Intelligent_pct),
    Kind_pct: parseMetric(row.Kind_pct),
    Obliging_pct: parseMetric(row.Obliging_pct),
    Prestigious_pct: parseMetric(row.Prestigious_pct),
    Progressive_pct: parseMetric(row.Progressive_pct),
    Restrained_pct: parseMetric(row.Restrained_pct),
    Rugged_pct: parseMetric(row.Rugged_pct),
    Sensuous_pct: parseMetric(row.Sensuous_pct),
    Simple_pct: parseMetric(row.Simple_pct),
    Social_pct: parseMetric(row.Social_pct),
    Socially_Responsible_pct: parseMetric(row.Socially_Responsible_pct),
    Straightforward_pct: parseMetric(row.Straightforward_pct),
    Stylish_pct: parseMetric(row.Stylish_pct),
    Traditional_pct: parseMetric(row.Traditional_pct),
    Trendy_pct: parseMetric(row.Trendy_pct),
    Trustworthy_pct: parseMetric(row.Trustworthy_pct),
    Unapproachable_pct: parseMetric(row.Unapproachable_pct),
    Up_To_Date_pct: parseMetric(row.Up_To_Date_pct),
    Upper_Class_pct: parseMetric(row.Upper_Class_pct),
    Visionary_pct: parseMetric(row.Visionary_pct),
    Classic_C: parseMetric(row.Classic_C),
    Chic_C: parseMetric(row.Chic_C),
    Customer_Centric_C: parseMetric(row.Customer_Centric_C),
    Outgoing_C: parseMetric(row.Outgoing_C),
    No_Nonsense_C: parseMetric(row.No_Nonsense_C),
    Distant_C: parseMetric(row.Distant_C),

    // Relationship & Engagement Metrics
    Adapts_to_my_needs_pct: parseMetric(row.Adapts_to_my_needs_pct),
    Belong_to_a_club_pct: parseMetric(row.Belong_to_a_club_pct),
    Best_option_available_pct: parseMetric(row.Best_option_available_pct),
    Fairly_priced_pct: parseMetric(row.Fairly_priced_pct),
    Feel_loyal_pct: parseMetric(row.Feel_loyal_pct),
    Goes_out_of_its_way_pct: parseMetric(row.Goes_out_of_its_way_pct),
    Identify_with_other_users_pct: parseMetric(row.Identify_with_other_users_pct),
    Interested_learning_more_pct: parseMetric(row.Interested_learning_more_pct),
    Interested_special_events_pct: parseMetric(row.Interested_special_events_pct),
    Meets_my_needs_completely_pct: parseMetric(row.Meets_my_needs_completely_pct),
    My_kind_of_brand_pct: parseMetric(row.My_kind_of_brand_pct),
    One_of_my_favorite_brands_pct: parseMetric(row.One_of_my_favorite_brands_pct),
    Recommend_to_a_friend_pct: parseMetric(row.Recommend_to_a_friend_pct),
    Resolves_conflicts_well_pct: parseMetric(row.Resolves_conflicts_well_pct),
    Strongest_relationship_pct: parseMetric(row.Strongest_relationship_pct),
    Want_my_business_pct: parseMetric(row.Want_my_business_pct),
    Worth_a_premium_price_pct: parseMetric(row.Worth_a_premium_price_pct),
    Would_miss_if_went_away_pct: parseMetric(row.Would_miss_if_went_away_pct),

    // Additional Metric
    Regard_MS: parseMetric(row.Regard_MS),
  };
}

/**
 * Extract quarter identifier from CSV filename
 * Uses regex to match pattern like "2010Q1", "2010Q2", etc.
 *
 * @param filename - CSV filename (e.g., "2010Q1-Table 1.csv")
 * @returns Quarter identifier (e.g., "2010Q1") or "UNKNOWN" if pattern not found
 *
 * @example
 * extractQuarter("2010Q1-Table 1.csv") // "2010Q1"
 * extractQuarter("2010Q2.csv") // "2010Q2"
 * extractQuarter("data.csv") // "UNKNOWN"
 */
export function extractQuarter(filename: string): string {
  const match = filename.match(/(\d{4}Q\d)/i);
  return match ? match[1].toUpperCase() : 'UNKNOWN';
}
