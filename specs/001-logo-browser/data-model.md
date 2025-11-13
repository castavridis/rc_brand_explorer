# Data Model: Brand Logo Browser

**Feature**: 001-logo-browser
**Date**: 2025-11-13
**Purpose**: Define data structures, validation rules, and relationships

## Overview

This document defines the data model for the Brand Logo Browser, focusing on the structure of brand metadata stored in `data/brands/brands.json` and the relationships between entities. The model supports search, filtering, and sorting requirements while maintaining flexibility for future extensions.

---

## Core Entities

### Brand

Represents a company or organization with a displayable logo.

**Attributes**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|-----------------|
| `id` | string | Yes | Unique identifier (UUID or slug) | Unique, 1-100 chars, alphanumeric + hyphens |
| `name` | string | Yes | Display name of brand | 1-200 chars, non-empty |
| `slug` | string | Yes | URL/filename-safe identifier | Lowercase, alphanumeric + hyphens, matches logo filename |
| `category` | string | Yes | Industry/type classification | One of predefined categories (see Categories) |
| `logoPath` | string | Yes | Relative path to logo file | Valid file path, file must exist in `assets/logos/` |
| `websiteUrl` | string | No | Official brand website | Valid URL (http/https) or null |
| `description` | string | No | Brief brand description | 0-500 chars |
| `tags` | string[] | No | Searchable keywords | Array of strings, each 1-50 chars, max 10 tags |
| `dateAdded` | string | Yes | ISO 8601 timestamp | Valid ISO date format (YYYY-MM-DDTHH:mm:ssZ) |
| `featured` | boolean | No | Featured/spotlight brand flag | true/false, default: false |

**Example**:
```json
{
  "id": "nike-inc",
  "name": "Nike",
  "slug": "nike",
  "category": "Apparel & Fashion",
  "logoPath": "assets/logos/nike.svg",
  "websiteUrl": "https://www.nike.com",
  "description": "Athletic footwear and apparel company",
  "tags": ["sports", "footwear", "apparel", "swoosh"],
  "dateAdded": "2025-11-13T00:00:00Z",
  "featured": true
}
```

**Validation Rules**:
- `slug` must match the filename in `logoPath` (e.g., slug "nike" → "nike.svg" or "nike.png")
- `category` must exist in predefined category list
- `logoPath` must point to existing file with allowed extension (.png, .svg, .jpg, .jpeg, .webp)
- `tags` array must not contain duplicates
- `dateAdded` must be valid parseable date

**State Transitions**: None (brand data is read-only for this feature)

---

### Logo

Represents the visual asset file for a brand. This is primarily metadata about files on disk rather than a database entity.

**Attributes**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|-----------------|
| `path` | string | Yes | File path relative to project root | Must exist in `assets/logos/` |
| `format` | enum | Yes | Image file format | One of: "svg", "png", "jpg", "jpeg", "webp" |
| `altText` | string | Yes | Accessibility description | 1-200 chars, describes visual content |
| `dimensions` | object | No | Image dimensions (raster only) | `{ width: number, height: number }` in pixels |
| `fileSize` | number | No | File size in bytes | Positive integer |

**Example**:
```json
{
  "path": "assets/logos/nike.svg",
  "format": "svg",
  "altText": "Nike swoosh logo in black",
  "dimensions": null,
  "fileSize": 2048
}
```

**Note**: Logo metadata is derived from file system and not stored directly in brands.json. The Brand entity only stores `logoPath`. Logo attributes are computed during build/runtime.

---

### Category

Grouping mechanism for brands to enable filtering (FR-006).

**Attributes**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|-----------------|
| `id` | string | Yes | Unique category identifier | Kebab-case slug |
| `name` | string | Yes | Display name | 1-100 chars |
| `description` | string | No | Category description | 0-300 chars |
| `count` | number | Computed | Number of brands in category | Auto-calculated, non-negative |

**Predefined Categories** (initial set, extensible):
- Technology
- Apparel & Fashion
- Food & Beverage
- Automotive
- Finance & Banking
- Healthcare
- Media & Entertainment
- Retail
- Sports & Fitness
- Other

**Example**:
```json
{
  "id": "technology",
  "name": "Technology",
  "description": "Software, hardware, and tech services companies",
  "count": 42
}
```

**Note**: Categories may be defined in a separate `data/brands/categories.json` file or derived from brand data. Count is computed at runtime.

---

## Relationships

```
Category (1) ──< has many >── (N) Brand
                              (1)
                               │
                          has one
                               │
                              (1)
                             Logo
```

**Relationship Details**:
- One Category contains zero or more Brands
- One Brand belongs to exactly one Category
- One Brand has exactly one Logo
- One Logo belongs to exactly one Brand

**Navigation**:
- From Brand → Logo: Use `brand.logoPath` to locate file
- From Brand → Category: Use `brand.category` string to filter/group
- From Category → Brands: Filter brands array by `brand.category === category.name`

---

## Data Schema (JSON)

### brands.json Structure

The primary data file stored at `data/brands/brands.json`:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-11-13T00:00:00Z",
  "brands": [
    {
      "id": "nike-inc",
      "name": "Nike",
      "slug": "nike",
      "category": "Apparel & Fashion",
      "logoPath": "assets/logos/nike.svg",
      "websiteUrl": "https://www.nike.com",
      "description": "Athletic footwear and apparel company",
      "tags": ["sports", "footwear", "apparel", "swoosh"],
      "dateAdded": "2025-11-13T00:00:00Z",
      "featured": false
    },
    {
      "id": "apple-inc",
      "name": "Apple",
      "slug": "apple",
      "category": "Technology",
      "logoPath": "assets/logos/apple.svg",
      "websiteUrl": "https://www.apple.com",
      "description": "Consumer electronics and software company",
      "tags": ["technology", "electronics", "software"],
      "dateAdded": "2025-11-13T00:00:00Z",
      "featured": true
    }
  ]
}
```

**Root Fields**:
- `version`: Schema version for future migrations
- `lastUpdated`: Timestamp of last data modification
- `brands`: Array of Brand objects

---

## Validation Rules Summary

### Required Field Validation

All brands must have:
- `id` (unique identifier)
- `name` (display name)
- `slug` (URL-safe identifier matching logo filename)
- `category` (must exist in predefined list)
- `logoPath` (must point to valid file)
- `dateAdded` (valid ISO 8601 date)

### Data Integrity Rules

1. **Uniqueness**: `id` and `slug` must be unique across all brands
2. **Referential Integrity**: `logoPath` must point to existing file in `assets/logos/`
3. **Category Validity**: `category` must match predefined category name
4. **Slug-Filename Match**: `slug` must match logo filename stem (e.g., "nike" → "nike.svg")
5. **URL Format**: `websiteUrl` (if provided) must be valid HTTP/HTTPS URL
6. **Tag Limits**: Maximum 10 tags per brand, each tag max 50 chars
7. **Description Length**: Maximum 500 chars

### Runtime Validation

Validation occurs at:
1. **Build Time**: Schema validation of brands.json against JSON Schema (contracts/brand-schema.json)
2. **Load Time**: TypeScript type checking + runtime validation with Zod/Joi
3. **Test Time**: Unit tests verify data integrity rules

---

## Computed Fields

These fields are calculated at runtime, not stored in brands.json:

| Field | Type | Calculation | Purpose |
|-------|------|-------------|---------|
| `logoFormat` | string | Extract from `logoPath` extension | Display format badge |
| `logoAltText` | string | Generate from `name` | Accessibility (e.g., "Nike logo") |
| `searchableText` | string | Combine `name + tags + description` | Full-text search |
| `sortKey` | string | Normalize `name` for sorting | Case-insensitive alphabetical sort |

**Example Computed Field Usage**:
```typescript
// Computed at load time
const brand = {
  ...brandData,
  logoFormat: brandData.logoPath.split('.').pop(), // "svg"
  logoAltText: `${brandData.name} logo`, // "Nike logo"
  searchableText: `${brandData.name} ${brandData.tags.join(' ')} ${brandData.description}`.toLowerCase(),
  sortKey: brandData.name.toLowerCase().normalize('NFD')
};
```

---

## State Management

**Client-Side State**:
- **Loaded Data**: Full brands array loaded from brands.json on app initialization
- **Filtered Data**: Subset of brands matching current search/filter criteria
- **Selected Brand**: Currently displayed brand in modal (or null)
- **UI State**: Search query, active filters, sort order, loading status

**State Flow**:
```
brands.json → Load → Parse → Validate → Store in React State
                                            ↓
                                    Apply Search/Filter
                                            ↓
                                    Apply Sort
                                            ↓
                                    Render Filtered Subset
```

**No Backend Persistence**: This feature is read-only; brand data is static and updated manually.

---

## Migration Strategy

For future schema changes:

1. **Version Field**: `version` in brands.json tracks schema version
2. **Backward Compatibility**: New optional fields added without breaking existing data
3. **Migration Scripts**: Provide scripts to transform old schema to new schema
4. **Validation**: JSON Schema updated to reflect new schema version

**Example Version Progression**:
- `1.0.0`: Initial schema (current)
- `1.1.0`: Add optional `country` field (non-breaking)
- `2.0.0`: Rename `category` to `categoryId` (breaking, requires migration)

---

## Performance Considerations

### Data Loading

- **Initial Load**: Parse brands.json (typically 50-500 brands = 50-200KB JSON)
- **Expected Parse Time**: < 50ms for 500 brands on modern browsers
- **Caching**: Browser caches brands.json (set Cache-Control headers)

### Search/Filter Performance

- **Algorithm**: Linear O(n) search through brands array
- **Expected Time**: < 10ms for 500 brands (string matching)
- **Optimization**: Precompute `searchableText` field at load time

### Memory Usage

- **Dataset**: ~500 brands × ~500 bytes/brand = ~250KB in memory
- **Images**: Lazy-loaded, not held in memory simultaneously

---

## Data Examples

See `data/brands/brands.json` (to be created during implementation) for complete dataset.

**Minimal Valid Brand**:
```json
{
  "id": "test-brand",
  "name": "Test Brand",
  "slug": "test-brand",
  "category": "Other",
  "logoPath": "assets/logos/test-brand.png",
  "dateAdded": "2025-11-13T00:00:00Z"
}
```

**Fully Populated Brand**:
```json
{
  "id": "coca-cola-company",
  "name": "Coca-Cola",
  "slug": "coca-cola",
  "category": "Food & Beverage",
  "logoPath": "assets/logos/coca-cola.svg",
  "websiteUrl": "https://www.coca-cola.com",
  "description": "World's largest beverage company",
  "tags": ["beverage", "drinks", "soda", "refreshment", "iconic"],
  "dateAdded": "2025-11-13T00:00:00Z",
  "featured": true
}
```
