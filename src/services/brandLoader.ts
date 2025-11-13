import type { Brand } from '@/types/brand';

export async function loadBrands(): Promise<Brand[]> {
  try {
    const response = await fetch('/data/brands/brands.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.brands as Brand[];
  } catch (error) {
    console.error('Failed to load brands:', error);
    throw new Error('Failed to load brand data. Please try again later.');
  }
}

export function validateBrand(brand: unknown): Brand {
  if (typeof brand !== 'object' || brand === null) {
    throw new Error('Brand must be an object');
  }

  const b = brand as Partial<Brand>;

  if (!b.id || typeof b.id !== 'string') {
    throw new Error('Brand must have a valid id');
  }
  if (!b.name || typeof b.name !== 'string') {
    throw new Error('Brand must have a valid name');
  }
  if (!b.slug || typeof b.slug !== 'string') {
    throw new Error('Brand must have a valid slug');
  }
  if (!b.category || typeof b.category !== 'string') {
    throw new Error('Brand must have a valid category');
  }
  if (!b.logoPath || typeof b.logoPath !== 'string') {
    throw new Error('Brand must have a valid logoPath');
  }
  if (!b.dateAdded || typeof b.dateAdded !== 'string') {
    throw new Error('Brand must have a valid dateAdded');
  }

  return b as Brand;
}
