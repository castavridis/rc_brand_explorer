export type BrandCategory =
  | 'Technology'
  | 'Apparel & Fashion'
  | 'Food & Beverage'
  | 'Automotive'
  | 'Finance & Banking'
  | 'Healthcare'
  | 'Media & Entertainment'
  | 'Retail'
  | 'Sports & Fitness'
  | 'Other';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  category: BrandCategory;
  logoPath: string;
  websiteUrl?: string | null;
  description?: string;
  tags?: string[];
  dateAdded: string;
  featured?: boolean;
}

export type SortOption =
  | 'alphabetical-asc'
  | 'alphabetical-desc'
  | 'newest'
  | 'oldest'
  | 'random';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
