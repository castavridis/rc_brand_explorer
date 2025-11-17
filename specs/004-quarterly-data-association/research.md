# Research: Quarterly Brand Data Association

**Date**: 2025-11-17
**Feature**: 004-quarterly-data-association

## Overview

This document consolidates research findings for implementing quarterly brand data association in the brand explorer application. Key areas researched: CSV parsing strategies, data transformation approaches, case-insensitive matching algorithms, React data visualization patterns, and performance optimization for large datasets.

## 1. CSV Parsing Strategy

### Decision: Build-time processing with csv-parser library

**Rationale**:
- Project already has csv-parser 3.0 as a dependency (used in existing import-brands script)
- Build-time processing transforms CSVs to JSON, enabling fast runtime loading
- Matches existing pattern: brands.json is static, served from /public/assets/data/
- Avoids runtime CSV parsing overhead (85+ columns × hundreds of brands × 10 quarters)
- Enables validation and error reporting during build phase

**Alternatives Considered**:
- **Runtime CSV parsing**: Rejected due to performance concerns. Parsing 10 CSV files with 85+ columns on every page load would violate SC-001 (<2 second load time).
- **Browser-based CSV libraries (Papa Parse)**: Rejected because build-time processing is more appropriate for static data that doesn't change between deployments.
- **Backend API with database**: Rejected to maintain project simplicity (single-project structure, static hosting on Vercel).

**Implementation Approach**:
```typescript
// Build-time script: src/scripts/process-quarterly-data.ts
// 1. Read CSV files from /public/test-data/*.csv
// 2. Parse each CSV with csv-parser
// 3. Extract quarter from filename (regex: /(\d{4}Q\d)/i)
// 4. Transform to typed structure (QuarterlyDataRecord[])
// 5. Write to /public/assets/data/quarterly/{quarter}.json
// 6. Generate index file with available quarters
```

---

## 2. Case-Insensitive Brand Matching

### Decision: Normalized lowercase comparison with trim

**Rationale**:
- Simple, predictable, and performant
- Handles the most common variations (case differences, leading/trailing whitespace)
- Per FR-011: case-insensitive exact match ("YouTube" matches "youtube" but not "YouTube Inc.")
- No false positives from fuzzy matching

**Alternatives Considered**:
- **Fuzzy matching (Levenshtein distance)**: Rejected per user clarification. Risk of false matches between similarly-named brands.
- **Regex-based normalization**: Over-engineered for the specified requirement.

**Implementation Approach**:
```typescript
// src/utils/brandMatcher.ts
function normalizeBrandName(name: string): string {
  return name.trim().toLowerCase();
}

function matchBrand(brandName: string, csvBrandName: string): boolean {
  return normalizeBrandName(brandName) === normalizeBrandName(csvBrandName);
}
```

---

## 3. Data Model Structure

### Decision: Separate quarterly data files with brand ID references

**Rationale**:
- Enables efficient quarter-specific queries (SC-003: identify available quarters)
- Avoids duplication: brands.json remains single source of truth for brand metadata
- Supports sparse data: only create entries for brands with data in that quarter
- Scalable: adding new quarters doesn't require modifying existing files

**Data Structure**:
```typescript
// /public/assets/data/quarterly/2010Q1.json
{
  "quarter": "2010Q1",
  "records": [
    {
      "brandId": "7up-xyz123",  // References brands.json id
      "brandName": "7UP",       // Denormalized for debugging
      "metrics": {
        "Total_Users_pct": 61.18,
        "Total_Prefer_pct": 56.95,
        "Brand_Stature_C": 3.49,
        // ... 80+ more metrics
      }
    }
  ]
}

// /public/assets/data/quarterly/index.json
{
  "quarters": ["2010Q1", "2010Q2", "2010Q3", "2010Q4", ...],
  "lastUpdated": "2025-11-17T10:00:00Z"
}
```

**Alternatives Considered**:
- **Embed quarterly data in brands.json**: Rejected due to file size explosion (85+ metrics × 10 quarters × hundreds of brands).
- **Single monolithic quarterly file**: Rejected because it violates SC-003 (users must identify available quarters without downloading all data).
- **Nested quarterly data under each brand**: Rejected to avoid scattering data across multiple files and complicating updates.

---

## 4. Handling Empty/Null Metrics

### Decision: Preserve nulls, render as "No data" in UI

**Rationale**:
- Per FR-007: CSVs contain many empty values (e.g., "24 Hour Fitness" has all empty metrics)
- Distinguish between "metric measured but 0%" vs "metric not available"
- Null/undefined in TypeScript clearly indicates missing data
- Per SC-006: system must display "no data available" rather than misleading values

**Implementation Approach**:
```typescript
// src/types/quarterlyData.ts
interface BrandMetrics {
  Total_Users_pct: number | null;
  Total_Prefer_pct: number | null;
  // ... all metrics nullable
}

// Component rendering
{metrics.Total_Users_pct !== null
  ? `${metrics.Total_Users_pct.toFixed(2)}%`
  : 'No data'}
```

**Alternatives Considered**:
- **Convert nulls to 0**: Rejected because 0% is a meaningful value (brand exists but has no users/preference).
- **Omit null fields from JSON**: Rejected because it complicates TypeScript typing and field access patterns.

---

## 5. React Component Architecture for Visualization

### Decision: Atomic components with progressive disclosure

**Rationale**:
- Aligns with Constitution Principle III (Novel and Usable UI)
- Progressive disclosure: basic metrics on detail page, advanced comparison on separate view
- Independently testable components (Constitution Principle II: Modular Architecture)

**Component Hierarchy**:
```
LogoModal (existing - extend)
├── QuarterlyMetrics (NEW - single quarter view)
│   ├── MetricCategory (awareness, perception, etc.)
│   └── MetricValue (individual metric with label)
└── QuarterComparisonButton (NEW - link to comparison)

QuarterComparison (NEW - separate route/modal)
├── QuarterSelector (multi-select for quarters to compare)
├── MetricSelector (choose which metrics to compare)
└── ComparisonTable (side-by-side or difference view)

DataAvailabilityBadge (NEW - catalog indicator)
└── QuarterCount (e.g., "5 quarters available")
```

**Best Practices Applied**:
- **Accessibility**: Use semantic HTML tables for metrics, ARIA labels for comparison controls
- **Performance**: Memoize metric calculations, lazy-load comparison view
- **Testing**: Mock quarterly data service, test loading/empty/error states

---

## 6. Performance Optimization

### Decision: Lazy loading + memoization

**Rationale**:
- SC-001 requires <2 seconds to load brand with quarterly data
- SC-005 requires <30 seconds for multi-quarter comparison
- Only load quarterly data when user opens brand detail (not for catalog view)
- Cache parsed quarterly files to avoid re-fetching

**Implementation Approach**:
```typescript
// src/services/quarterlyDataLoader.ts
const quarterlyCache = new Map<string, QuarterlyData>();

async function loadQuarter(quarter: string): Promise<QuarterlyData> {
  if (quarterlyCache.has(quarter)) {
    return quarterlyCache.get(quarter)!;
  }

  const response = await fetch(`/assets/data/quarterly/${quarter}.json`);
  const data = await response.json();
  quarterlyCache.set(quarter, data);
  return data;
}

// Preload available quarters on app init
async function preloadQuarterIndex() {
  return fetch('/assets/data/quarterly/index.json').then(r => r.json());
}
```

**Alternatives Considered**:
- **Load all quarters upfront**: Rejected due to potential size (85 metrics × hundreds of brands × 10 quarters = significant payload).
- **Server-side rendering**: Out of scope for current Vercel static deployment.

---

## 7. Quarter Filename Parsing

### Decision: Regex extraction with fallback to "unknown"

**Rationale**:
- Per FR-006: identify quarter from filename format like "2010Q1-Table 1.csv"
- Flexible pattern supports variations (spaces, different suffixes)
- Build-time validation can warn about unparseable filenames

**Implementation**:
```typescript
function extractQuarter(filename: string): string {
  const match = filename.match(/(\d{4}Q\d)/i);
  return match ? match[1].toUpperCase() : 'UNKNOWN';
}

// Examples:
// "2010Q1-Table 1.csv" → "2010Q1"
// "2010Q2.csv" → "2010Q2"
// "data.csv" → "UNKNOWN" (warn during build)
```

---

## 8. Testing Strategy

### Decision: Unit tests for services/utils, integration tests for data flow

**Rationale**:
- Existing project uses Vitest + @testing-library/react
- Modular architecture enables independent component/service testing
- Integration tests verify end-to-end data flow (CSV → JSON → UI)

**Test Coverage**:
- **Unit**: csvParser, brandMatcher, quarterlyDataLoader, brand association logic
- **Component**: QuarterlyMetrics, QuarterComparison, DataAvailabilityBadge
- **Integration**: Full flow from CSV files to rendered metrics in UI
- **Edge Cases**: Missing quarters, empty metrics, no matching brand, corrupted CSV

---

## Summary

All research findings support the technical approach outlined in the plan:
1. Build-time CSV processing with csv-parser (existing dependency)
2. Static JSON files served from /public/assets/data/quarterly/
3. Case-insensitive exact matching (trim + lowercase)
4. Nullable metrics to distinguish missing vs. zero values
5. Progressive disclosure UI with lazy loading
6. Modular, testable component architecture

No unresolved NEEDS CLARIFICATION items remain. Ready to proceed to Phase 1 (data model and contracts).
