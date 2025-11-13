import type { Brand, BrandCategory, SortOption } from '@/types/brand';

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
