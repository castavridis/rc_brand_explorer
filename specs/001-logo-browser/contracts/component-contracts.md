# Component Contracts: Brand Logo Browser

**Feature**: 001-logo-browser
**Date**: 2025-11-13
**Purpose**: Define TypeScript interfaces for React components and services

## Overview

This document specifies the contracts (TypeScript interfaces) for all components and services in the Brand Logo Browser. These contracts support the Modular Architecture principle (Constitution II) by clearly defining component boundaries, inputs, and outputs.

---

## Data Type Contracts

### Brand

```typescript
interface Brand {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  slug: string;                  // URL-safe identifier
  category: BrandCategory;       // Industry classification
  logoPath: string;              // Relative path to logo file
  websiteUrl?: string | null;    // Official website (optional)
  description?: string;          // Brief description (optional)
  tags?: string[];               // Searchable keywords (optional)
  dateAdded: string;             // ISO 8601 timestamp
  featured?: boolean;            // Featured flag (optional)
}
```

### BrandCategory

```typescript
type BrandCategory =
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
```

### SortOption

```typescript
type SortOption = 'alphabetical-asc' | 'alphabetical-desc' | 'newest' | 'oldest' | 'random';
```

### LoadingState

```typescript
type LoadingState = 'idle' | 'loading' | 'success' | 'error';
```

---

## Component Contracts

### LogoGrid Component

**Purpose**: Display brand logos in a responsive grid layout

**Props**:
```typescript
interface LogoGridProps {
  brands: Brand[];                           // Array of brands to display
  onBrandClick: (brand: Brand) => void;     // Handler when logo clicked
  loading?: boolean;                         // Loading state indicator
  emptyMessage?: string;                     // Message when no brands
}
```

**Events**:
- `onBrandClick(brand)`: Fired when user clicks a logo card

**Accessibility**:
- Grid uses semantic HTML (`<ul>` with `<li>` items)
- Each logo has accessible name via `aria-label`
- Keyboard navigation: Tab between logos, Enter/Space to select

---

### LogoCard Component

**Purpose**: Display individual brand logo with metadata

**Props**:
```typescript
interface LogoCardProps {
  brand: Brand;                              // Brand data to display
  onClick: () => void;                       // Click handler
  loading?: boolean;                         // Image loading state
  priority?: boolean;                        // Prioritize image loading
}
```

**Events**:
- `onClick()`: Fired when card is clicked

**Accessibility**:
- `role="button"` for clickable card
- `tabIndex={0}` for keyboard focus
- `aria-label` describes brand name and category

---

### SearchBar Component

**Purpose**: Text input for searching brands by name/tags

**Props**:
```typescript
interface SearchBarProps {
  value: string;                             // Current search query
  onChange: (query: string) => void;         // Handler for query changes
  placeholder?: string;                      // Input placeholder text
  ariaLabel?: string;                        // Accessible label
  debounce?: number;                         // Debounce delay in ms (default: 300)
}
```

**Events**:
- `onChange(query)`: Fired when search input changes (debounced)

**Accessibility**:
- Uses `<label>` with `for` attribute
- `aria-describedby` points to search instructions
- Live region announces result count

---

### FilterPanel Component

**Purpose**: Category filter controls

**Props**:
```typescript
interface FilterPanelProps {
  categories: BrandCategory[];               // Available categories
  selectedCategories: BrandCategory[];       // Currently selected
  onFilterChange: (categories: BrandCategory[]) => void; // Handler
  brandCounts?: Record<BrandCategory, number>; // Count per category
}
```

**Events**:
- `onFilterChange(categories)`: Fired when filter selection changes

**Accessibility**:
- Uses checkbox group with fieldset/legend
- Each checkbox has accessible label
- Keyboard navigation: Tab between checkboxes, Space to toggle

---

### SortControls Component

**Purpose**: Sort option selector

**Props**:
```typescript
interface SortControlsProps {
  value: SortOption;                         // Current sort option
  onChange: (option: SortOption) => void;    // Handler for sort change
  options?: { value: SortOption; label: string }[]; // Available options
}
```

**Events**:
- `onChange(option)`: Fired when sort selection changes

**Accessibility**:
- Uses `<select>` element or radio group
- Label associated with control
- Keyboard navigation: Arrow keys to change, Enter to confirm

---

### LogoModal Component

**Purpose**: Full-screen modal for logo detail view

**Props**:
```typescript
interface LogoModalProps {
  brand: Brand | null;                       // Brand to display (null = closed)
  onClose: () => void;                       // Handler to close modal
  open: boolean;                             // Modal open state
}
```

**Events**:
- `onClose()`: Fired when user closes modal (Esc, click outside, close button)

**Accessibility**:
- `role="dialog"` with `aria-modal="true"`
- Focus trap: Tab cycles within modal
- Focus management: Restore focus to trigger on close
- Escape key closes modal
- `aria-labelledby` points to brand name heading

---

## Service Contracts

### BrandLoader Service

**Purpose**: Load and parse brand data from JSON

**Interface**:
```typescript
interface BrandLoaderService {
  loadBrands(): Promise<Brand[]>;
  validateBrand(brand: unknown): Brand;      // Runtime validation
}
```

**Functions**:

```typescript
/**
 * Load brand data from brands.json
 * @returns Promise resolving to array of validated Brand objects
 * @throws Error if JSON parsing fails or validation fails
 */
async function loadBrands(): Promise<Brand[]>

/**
 * Validate raw JSON object against Brand schema
 * @param brand - Unknown object to validate
 * @returns Validated Brand object
 * @throws Error if validation fails with detailed message
 */
function validateBrand(brand: unknown): Brand
```

---

### ImageLoader Service

**Purpose**: Lazy load logo images with error handling

**Interface**:
```typescript
interface ImageLoaderService {
  preloadImage(src: string): Promise<void>;
  getImageStatus(src: string): LoadingState;
}
```

**Functions**:

```typescript
/**
 * Preload image and cache result
 * @param src - Image source URL
 * @returns Promise that resolves when image loaded or rejects on error
 */
async function preloadImage(src: string): Promise<void>

/**
 * Get current loading state for image
 * @param src - Image source URL
 * @returns Current loading state (idle/loading/success/error)
 */
function getImageStatus(src: string): LoadingState
```

---

### SearchFilter Service

**Purpose**: Client-side search and filter logic

**Interface**:
```typescript
interface SearchFilterService {
  searchBrands(brands: Brand[], query: string): Brand[];
  filterByCategory(brands: Brand[], categories: BrandCategory[]): Brand[];
  sortBrands(brands: Brand[], option: SortOption): Brand[];
}
```

**Functions**:

```typescript
/**
 * Search brands by name, tags, and description
 * @param brands - Array of brands to search
 * @param query - Search query string (case-insensitive)
 * @returns Filtered array of matching brands
 */
function searchBrands(brands: Brand[], query: string): Brand[]

/**
 * Filter brands by categories
 * @param brands - Array of brands to filter
 * @param categories - Array of categories to include (empty = all)
 * @returns Filtered array of brands
 */
function filterByCategory(brands: Brand[], categories: BrandCategory[]): Brand[]

/**
 * Sort brands by specified option
 * @param brands - Array of brands to sort (not mutated)
 * @param option - Sort option
 * @returns New sorted array
 */
function sortBrands(brands: Brand[], option: SortOption): Brand[]
```

---

## Application State Contract

**Global App State** (managed by React Context or state management library):

```typescript
interface AppState {
  // Data
  brands: Brand[];                           // All loaded brands
  loading: LoadingState;                     // Data loading state
  error: Error | null;                       // Error if loading failed

  // UI State
  searchQuery: string;                       // Current search query
  selectedCategories: BrandCategory[];       // Active category filters
  sortOption: SortOption;                    // Current sort option
  selectedBrand: Brand | null;               // Brand in detail modal (null = closed)

  // Computed
  filteredBrands: Brand[];                   // Brands after search/filter/sort
  categoryCount: Record<BrandCategory, number>; // Brands per category
}
```

**Actions** (state update functions):

```typescript
interface AppActions {
  loadBrands: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategories: (categories: BrandCategory[]) => void;
  setSortOption: (option: SortOption) => void;
  selectBrand: (brand: Brand | null) => void;
  clearFilters: () => void;
}
```

---

## Error Handling Contracts

### AppError

```typescript
interface AppError {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

type ErrorCode =
  | 'LOAD_FAILED'           // Failed to load brands.json
  | 'PARSE_FAILED'          // Failed to parse JSON
  | 'VALIDATION_FAILED'     // Brand data failed schema validation
  | 'IMAGE_LOAD_FAILED'     // Logo image failed to load
  | 'UNKNOWN_ERROR';        // Unexpected error
```

**Error Handling Strategy**:
- Display user-friendly error messages
- Log detailed errors to console for debugging
- Provide retry mechanism for load failures
- Show placeholder images for failed logo loads

---

## Testing Contracts

### Mock Data

```typescript
/**
 * Generate mock Brand object for testing
 * @param overrides - Partial brand data to override defaults
 * @returns Complete Brand object
 */
function createMockBrand(overrides?: Partial<Brand>): Brand

/**
 * Generate array of mock brands for testing
 * @param count - Number of brands to generate
 * @returns Array of Brand objects
 */
function createMockBrands(count: number): Brand[]
```

### Test Utilities

```typescript
/**
 * Render component with required providers (theme, state, etc.)
 * @param component - React component to render
 * @param options - Testing library options
 */
function renderWithProviders(
  component: React.ReactElement,
  options?: RenderOptions
): RenderResult
```

---

## Performance Contracts

### Memoization

Components should use React.memo for performance:

```typescript
// LogoCard should be memoized to prevent re-renders during search
const LogoCard = React.memo<LogoCardProps>(({ brand, onClick, loading }) => {
  // Component implementation
});
```

### Lazy Loading

Images should use native lazy loading:

```typescript
<img
  src={brand.logoPath}
  alt={`${brand.name} logo`}
  loading="lazy"  // Native browser lazy loading
  decoding="async"
/>
```

---

## Summary

These contracts define clear boundaries between components and services, supporting:

1. **Modular Architecture** (Constitution II): Clear interfaces enable independent development and testing
2. **Type Safety**: TypeScript catches errors at compile time
3. **Documentation**: Contracts serve as living documentation
4. **Testing**: Mock implementations can satisfy contracts for unit tests
5. **Maintainability**: Changes to internal implementation don't affect contracts

All components and services MUST implement these contracts exactly as specified.
