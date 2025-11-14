/**
 * Category inference utility for brand categorization
 *
 * Provides basic category inference based on brand names using keyword matching.
 * Falls back to "Other" category when no match is found.
 */

import type { BrandCategory } from '../types/brand';

/**
 * Category keywords mapping
 *
 * Maps keywords to brand categories for basic inference
 */
const CATEGORY_KEYWORDS: Record<BrandCategory, string[]> = {
  'Technology': [
    'tech', 'software', 'digital', 'computer', 'internet', 'web', 'cloud',
    'cyber', 'data', 'app', 'mobile', 'systems', 'solutions', 'ai', 'tech'
  ],
  'Apparel & Fashion': [
    'apparel', 'fashion', 'clothing', 'wear', 'style', 'boutique', 'threads',
    'garment', 'textile', 'shoes', 'footwear', 'accessories'
  ],
  'Food & Beverage': [
    'food', 'beverage', 'restaurant', 'cafe', 'coffee', 'tea', 'kitchen',
    'bakery', 'grill', 'diner', 'eatery', 'brewery', 'winery', 'bar'
  ],
  'Automotive': [
    'auto', 'motor', 'car', 'vehicle', 'automotive', 'drive', 'garage',
    'wheel', 'tire', 'transport'
  ],
  'Finance & Banking': [
    'bank', 'finance', 'credit', 'invest', 'capital', 'fund', 'insurance',
    'financial', 'mortgage', 'loan', 'wealth', 'asset'
  ],
  'Healthcare': [
    'health', 'medical', 'care', 'clinic', 'hospital', 'pharma', 'wellness',
    'dental', 'therapy', 'medicine', 'doctor'
  ],
  'Media & Entertainment': [
    'media', 'entertainment', 'studio', 'film', 'music', 'tv', 'radio',
    'broadcast', 'production', 'entertainment', 'streaming', 'gaming'
  ],
  'Retail': [
    'retail', 'store', 'shop', 'market', 'mart', 'outlet', 'mall', 'plaza',
    'boutique', 'emporium'
  ],
  'Sports & Fitness': [
    'sport', 'fitness', 'gym', 'athletic', 'training', 'workout', 'exercise',
    'yoga', 'wellness', 'active', 'outdoors'
  ],
  'Other': []
};

/**
 * Infer brand category from brand name
 *
 * Uses keyword matching to determine the most likely category for a brand.
 * Defaults to "Other" if no keywords match.
 *
 * @param brandName - Brand name to analyze
 * @returns Inferred brand category
 */
export function inferCategory(brandName: string): BrandCategory {
  const lowerName = brandName.toLowerCase();

  // Check each category's keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'Other') continue;

    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return category as BrandCategory;
      }
    }
  }

  // Default to "Other" if no match found
  return 'Other';
}

/**
 * Get all available brand categories
 *
 * @returns Array of all brand categories
 */
export function getAllCategories(): BrandCategory[] {
  return Object.keys(CATEGORY_KEYWORDS) as BrandCategory[];
}

/**
 * Validate if a category is valid
 *
 * @param category - Category to validate
 * @returns True if the category is valid
 */
export function isValidCategory(category: string): category is BrandCategory {
  return Object.keys(CATEGORY_KEYWORDS).includes(category);
}
