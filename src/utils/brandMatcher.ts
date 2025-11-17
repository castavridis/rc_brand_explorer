/**
 * Brand name matching utility
 * Implements case-insensitive exact matching per FR-011
 * Feature: 004-quarterly-data-association
 */

/**
 * Normalize brand name for matching
 * Trims whitespace and converts to lowercase
 */
export function normalizeBrandName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Check if two brand names match (case-insensitive exact match)
 * Per FR-011: "YouTube" matches "youtube", but "YouTube Inc." does not match "YouTube"
 *
 * @param brandName1 - First brand name to compare
 * @param brandName2 - Second brand name to compare
 * @returns true if names match (case-insensitive), false otherwise
 *
 * @example
 * matchBrand("YouTube", "youtube") // true
 * matchBrand("YouTube", "YOUTUBE") // true
 * matchBrand("YouTube", "YouTube Inc.") // false
 * matchBrand("  7UP  ", "7up") // true (whitespace trimmed)
 */
export function matchBrand(brandName1: string, brandName2: string): boolean {
  return normalizeBrandName(brandName1) === normalizeBrandName(brandName2);
}

/**
 * Find a brand from a list by name (case-insensitive)
 *
 * @param searchName - Brand name to search for
 * @param brands - Array of objects with 'name' property
 * @returns Matching brand object or undefined if not found
 *
 * @example
 * const brands = [{ name: "YouTube", id: "yt-1" }, { name: "7UP", id: "7up-1" }];
 * findBrandByName("youtube", brands) // { name: "YouTube", id: "yt-1" }
 * findBrandByName("YOUTUBE Inc.", brands) // undefined (no exact match)
 */
export function findBrandByName<T extends { name: string }>(
  searchName: string,
  brands: T[]
): T | undefined {
  const normalizedSearch = normalizeBrandName(searchName);
  return brands.find((brand) => normalizeBrandName(brand.name) === normalizedSearch);
}
