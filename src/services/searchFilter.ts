import type { Brand, BrandCategory, SortOption } from '@/types/brand';
import { brandAssociationService } from './brandAssociationService';

export function searchBrands(brands: Brand[], query: string): Brand[] {
  if (!query.trim()) return brands;

  const lowerQuery = query.toLowerCase();
  return brands.filter((brand) => {
    const searchableText = [
      brand.name,
      brand.description || '',
      ...(brand.tags || []),
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(lowerQuery);
  });
}

export function filterByCategory(brands: Brand[], categories: BrandCategory[]): Brand[] {
  if (categories.length === 0) return brands;
  return brands.filter((brand) => categories.includes(brand.category));
}

export function sortBrands(brands: Brand[], option: SortOption): Brand[] {
  const sorted = [...brands];

  switch (option) {
    case 'alphabetical-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'alphabetical-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'newest':
      return sorted.sort(
        (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
      );
    case 'oldest':
      return sorted.sort(
        (a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
      );
    case 'random':
      return sorted.sort(() => Math.random() - 0.5);
    default:
      return sorted;
  }
}

/**
 * T031: Filter brands by quarterly data availability
 * Returns brands that have at least one quarter of quarterly data
 */
export async function filterByQuarterlyDataAvailability(
  brands: Brand[],
  hasData: boolean
): Promise<Brand[]> {
  if (!hasData) {
    // If filter is "show brands without data", return all brands
    // (or inverse logic - but typically we want to show brands WITH data)
    return brands;
  }

  // Get brands with quarterly data
  const brandsWithData: Brand[] = [];

  for (const brand of brands) {
    try {
      const brandData = await brandAssociationService.getBrandWithQuarterlyData(brand.id);
      if (brandData.availableQuarters.length > 0) {
        brandsWithData.push(brand);
      }
    } catch (error) {
      // Brand has no data or error loading - skip it
      continue;
    }
  }

  return brandsWithData;
}

/**
 * T034: Filter brands by specific quarter
 * Returns brands that have data available for the specified quarter
 */
export async function filterBySpecificQuarter(
  brands: Brand[],
  quarter: string
): Promise<Brand[]> {
  if (!quarter) {
    return brands;
  }

  const brandsWithQuarterData: Brand[] = [];

  for (const brand of brands) {
    try {
      const brandData = await brandAssociationService.getBrandWithQuarterlyData(brand.id, [quarter]);
      if (brandData.availableQuarters.includes(quarter)) {
        brandsWithQuarterData.push(brand);
      }
    } catch (error) {
      // Brand has no data for this quarter - skip it
      continue;
    }
  }

  return brandsWithQuarterData;
}

/**
 * T031: Get quarter count for a brand
 * Helper function to get the number of available quarters for a brand
 */
export async function getQuarterCountForBrand(brandId: string): Promise<number> {
  try {
    const brandData = await brandAssociationService.getBrandWithQuarterlyData(brandId);
    return brandData.availableQuarters.length;
  } catch (error) {
    return 0;
  }
}
