/**
 * Convert text to URL-safe slug format
 *
 * @param text - Input text to slugify
 * @returns URL-safe slug (lowercase, hyphenated)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique brand ID from brand name
 *
 * Creates a deterministic ID by combining the slugified brand name
 * with a hash of the original name to ensure uniqueness.
 *
 * @param brandName - Brand name to generate ID from
 * @returns Unique brand ID (e.g., "acme-corp-a3b2c1")
 */
export function generateBrandId(brandName: string): string {
  const slug = slugify(brandName);

  // Generate a simple hash from the brand name for uniqueness
  const hash = simpleHash(brandName);
  const hashSuffix = hash.toString(36).substring(0, 6);

  return `${slug}-${hashSuffix}`;
}

/**
 * Generate a simple numeric hash from a string
 *
 * @param str - Input string
 * @returns Numeric hash value
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
