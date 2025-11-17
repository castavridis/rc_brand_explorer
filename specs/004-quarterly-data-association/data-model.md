# Data Model: Quarterly Brand Data Association

**Feature**: 004-quarterly-data-association
**Date**: 2025-11-17

## Overview

This document defines the data structures for quarterly brand perception metrics and their association with existing brand entities. All types are TypeScript interfaces to be implemented in `src/types/quarterlyData.ts`.

---

## Core Entities

### 1. Brand (existing entity - to be extended)

**Location**: `src/types/brand.ts`

**Current Structure**:
```typescript
interface Brand {
  id: string;                    // e.g., "youtube-b42bkz"
  name: string;                  // e.g., "YouTube"
  slug: string;                  // e.g., "youtube"
  category: string;              // e.g., "Media and entertainment"
  logoPath: string;              // e.g., "assets/logos/youtube-logo.png"
  dateAdded: string;             // ISO 8601 date
  featured: boolean;
}
```

**Proposed Extension** (optional - for performance):
```typescript
interface Brand {
  // ... existing fields
  quarterlyDataAvailable?: boolean;      // Indicates if any quarterly data exists
  availableQuarters?: string[];          // e.g., ["2010Q1", "2010Q3"]
}
```

**Notes**:
- Extension is optional; alternative is to query quarterly data files at runtime
- If added, these fields should be populated during build by the process-quarterly-data script
- Supports FR-003 (filter brands by data availability) and SC-003 (identify available quarters)

---

### 2. QuarterlyDataRecord

**Location**: `src/types/quarterlyData.ts`

Represents brand metrics from a single quarter CSV file.

```typescript
interface QuarterlyDataRecord {
  brandId: string;               // Reference to Brand.id (from brands.json)
  brandName: string;             // Denormalized for debugging/validation
  csvBrandId: string;            // Original "Brand id" from CSV
  category: string;              // Category from CSV (may differ from brands.json)
  metrics: BrandMetrics;         // All 85+ metric columns
}
```

**Validation Rules**:
- `brandId` MUST reference a valid Brand.id in brands.json (validated at build time)
- `brandName` case-insensitive match with Brand.name (per FR-011)
- `csvBrandId` preserved for traceability to original CSV data
- `category` may differ from Brand.category (not used for matching per FR-001)

**Relationships**:
- Many-to-one: QuarterlyDataRecord → Brand (via brandId)
- One-to-one: QuarterlyDataRecord ↔ CSV row (for a specific quarter)

---

### 3. BrandMetrics

**Location**: `src/types/quarterlyData.ts`

Contains all 85+ metric columns from quarterly CSV files. All fields are nullable to handle missing data (per FR-007 and research.md decision).

```typescript
interface BrandMetrics {
  // Awareness & Preference Metrics
  Total_Users_pct: number | null;
  Total_Prefer_pct: number | null;

  // Brand Equity Composite Scores (suffix: _C)
  Energized_Differentiation_C: number | null;
  Relevance_C: number | null;
  Esteem_C: number | null;
  Knowledge_C: number | null;
  Brand_Stature_C: number | null;
  Brand_Strength_C: number | null;
  Brand_Asset_C: number | null;

  // Differentiation Attributes (13 metrics)
  Different_pct: number | null;
  Distinctive_pct: number | null;
  Unique_pct: number | null;
  Dynamic_pct: number | null;
  Innovative_pct: number | null;
  Leader_pct: number | null;
  Original_pct: number | null;
  Cutting_Edge_C: number | null;

  // Quality & Performance Attributes (5 metrics)
  Reliable_pct: number | null;
  High_quality_pct: number | null;
  High_Performance_pct: number | null;
  Superior_C: number | null;
  Worth_More_pct: number | null;

  // Personality & Character Attributes (35 metrics)
  Arrogant_pct: number | null;
  Authentic_pct: number | null;
  Best_Brand_pct: number | null;
  Carefree_pct: number | null;
  Cares_Customers_pct: number | null;
  Charming_pct: number | null;
  Daring_pct: number | null;
  Down_to_Earth_pct: number | null;
  Energetic_pct: number | null;
  Friendly_pct: number | null;
  Fun_pct: number | null;
  Gaining_In_Popularity_pct: number | null;
  Glamorous_pct: number | null;
  Good_Value_pct: number | null;
  Healthy_pct: number | null;
  Helpful_pct: number | null;
  Independent_pct: number | null;
  Intelligent_pct: number | null;
  Kind_pct: number | null;
  Obliging_pct: number | null;
  Prestigious_pct: number | null;
  Progressive_pct: number | null;
  Restrained_pct: number | null;
  Rugged_pct: number | null;
  Sensuous_pct: number | null;
  Simple_pct: number | null;
  Social_pct: number | null;
  Socially_Responsible_pct: number | null;
  Straightforward_pct: number | null;
  Stylish_pct: number | null;
  Traditional_pct: number | null;
  Trendy_pct: number | null;
  Trustworthy_pct: number | null;
  Unapproachable_pct: number | null;
  Up_To_Date_pct: number | null;
  Upper_Class_pct: number | null;
  Visionary_pct: number | null;
  Classic_C: number | null;
  Chic_C: number | null;
  Customer_Centric_C: number | null;
  Outgoing_C: number | null;
  No_Nonsense_C: number | null;
  Distant_C: number | null;

  // Relationship & Engagement Metrics (18 metrics)
  Adapts_to_my_needs_pct: number | null;
  Belong_to_a_club_pct: number | null;
  Best_option_available_pct: number | null;
  Fairly_priced_pct: number | null;
  Feel_loyal_pct: number | null;
  Goes_out_of_its_way_pct: number | null;
  Identify_with_other_users_pct: number | null;
  Interested_learning_more_pct: number | null;
  Interested_special_events_pct: number | null;
  Meets_my_needs_completely_pct: number | null;
  My_kind_of_brand_pct: number | null;
  One_of_my_favorite_brands_pct: number | null;
  Recommend_to_a_friend_pct: number | null;
  Resolves_conflicts_well_pct: number | null;
  Strongest_relationship_pct: number | null;
  Want_my_business_pct: number | null;
  Worth_a_premium_price_pct: number | null;
  Would_miss_if_went_away_pct: number | null;

  // Additional Metric
  Regard_MS: number | null;
}
```

**Field Naming Convention**:
- Suffix `_pct`: Percentage values (0-100 range expected)
- Suffix `_C`: Composite scores (calculated/aggregated metrics)
- Suffix `_MS`: Specific metric type (interpretation TBD from source data)

**Validation Rules**:
- Percentage fields should be 0-100 (warn if out of range during build)
- Composite scores: range varies (no validation unless documented)
- Null indicates "no data" (per FR-007 edge case handling)

---

### 4. QuarterlyData

**Location**: `src/types/quarterlyData.ts`

Represents the full dataset for a single quarter (one JSON file per quarter).

```typescript
interface QuarterlyData {
  quarter: string;                       // e.g., "2010Q1" (from filename)
  sourceFile: string;                    // e.g., "2010Q1-Table 1.csv"
  processedAt: string;                   // ISO 8601 timestamp (build time)
  recordCount: number;                   // Total records in this quarter
  matchedBrands: number;                 // Count of records matched to brands.json
  unmatchedBrands: string[];             // CSV brand names with no match
  records: QuarterlyDataRecord[];        // All data records for this quarter
}
```

**Usage**:
- Stored at `/public/assets/data/quarterly/{quarter}.json`
- Loaded on-demand when user views brand details or comparison
- Cached in memory after first load (per research.md performance optimization)

**Validation Rules**:
- `quarter` MUST match format YYYYQ# (e.g., 2010Q1, 2010Q2)
- `recordCount` MUST equal `records.length`
- `matchedBrands` MUST be ≤ `recordCount`
- `unmatchedBrands` list helps debugging mismatches

---

### 5. QuarterIndex

**Location**: `src/types/quarterlyData.ts`

Master index of all available quarters.

```typescript
interface QuarterIndex {
  quarters: string[];                    // Sorted list (e.g., ["2010Q1", "2010Q2", ...])
  quarterFiles: Record<string, string>;  // Map quarter → filename
  lastUpdated: string;                   // ISO 8601 timestamp (build time)
  totalQuarters: number;                 // Count of available quarters
}
```

**Usage**:
- Stored at `/public/assets/data/quarterly/index.json`
- Loaded on app initialization to populate quarter selectors
- Supports FR-009 (query brands by quarter) and SC-003 (identify available quarters)

**Example**:
```json
{
  "quarters": ["2010Q1", "2010Q2", "2010Q3", "2010Q4"],
  "quarterFiles": {
    "2010Q1": "2010Q1-Table 1.csv",
    "2010Q2": "2010Q2-Table 1.csv",
    "2010Q3": "2010Q3-Table 1.csv",
    "2010Q4": "2010Q4-Table 1.csv"
  },
  "lastUpdated": "2025-11-17T10:00:00Z",
  "totalQuarters": 4
}
```

---

### 6. BrandWithQuarterlyData (view model)

**Location**: `src/types/quarterlyData.ts`

Composite view combining Brand with associated quarterly data (used in UI components).

```typescript
interface BrandWithQuarterlyData {
  brand: Brand;                          // Core brand info
  quarterlyData: Map<string, BrandMetrics>;  // Quarter → metrics
  availableQuarters: string[];           // Sorted list of quarters with data
  latestQuarter?: string;                // Most recent quarter (if any)
}
```

**Usage**:
- Constructed by `brandAssociationService.getBrandWithQuarterlyData(brandId)`
- Passed to QuarterlyMetrics and QuarterComparison components
- Enables efficient "is data available?" checks (per SC-003)

---

## Data Flow

### Build Time (CSV → JSON transformation)

```
1. Scan /public/test-data/*.csv
2. For each CSV file:
   a. Extract quarter from filename (extractQuarter regex)
   b. Parse CSV rows with csv-parser
   c. For each row:
      - Match brand name (case-insensitive) to brands.json
      - If match found: create QuarterlyDataRecord with brandId
      - If no match: add to unmatchedBrands list
   d. Construct QuarterlyData object
   e. Write to /public/assets/data/quarterly/{quarter}.json
3. Generate QuarterIndex from all processed quarters
4. Write index to /public/assets/data/quarterly/index.json
5. (Optional) Update brands.json with quarterlyDataAvailable flags
```

### Runtime (JSON → UI rendering)

```
1. App init: Load QuarterIndex from /assets/data/quarterly/index.json
2. User opens brand detail:
   a. Load brands.json to get Brand entity
   b. Load all quarters from index
   c. For each quarter, fetch /assets/data/quarterly/{quarter}.json
   d. Filter records by brandId
   e. Construct BrandWithQuarterlyData
   f. Render QuarterlyMetrics component
3. User clicks "Compare Quarters":
   a. Already have BrandWithQuarterlyData from step 2
   b. Render QuarterComparison with multi-select and comparison table
```

---

## State Transitions

### QuarterlyDataRecord Lifecycle

```
[CSV Row] --parse--> [Parsed Object] --match--> [QuarterlyDataRecord] --serialize--> [JSON]
                                          |
                                     no match
                                          |
                                          v
                                  [unmatchedBrands list]
```

**States**:
1. **Raw CSV**: Original data in CSV file
2. **Parsed**: In-memory JavaScript object (csv-parser output)
3. **Matched**: Associated with Brand.id via case-insensitive name match
4. **Serialized**: JSON file written to /public/assets/data/quarterly/
5. **Loaded**: Fetched at runtime and cached in memory
6. **Rendered**: Displayed in UI component

**Validation Points**:
- After parsing: Check for required columns (Brand name, Category)
- After matching: Verify brandId exists in brands.json
- Before serialization: Validate metric ranges (warn if out of bounds)
- After loading: Check JSON schema matches QuarterlyData interface

---

## Error Handling

### Missing Data Scenarios

| Scenario | Detection | Handling |
|----------|-----------|----------|
| Brand in CSV, not in brands.json | Build time (matching phase) | Add to unmatchedBrands, log warning, skip record |
| Brand in brands.json, no quarterly data | Runtime (query returns empty) | Display "No quarterly data available" (per SC-006) |
| Metric value is empty in CSV | CSV parsing (empty cell) | Store as `null` in BrandMetrics |
| Quarter filename unparseable | Build time (regex match fails) | Use "UNKNOWN", log error, skip or prompt for manual quarter input |
| CSV file corrupted/invalid | CSV parsing (throws error) | Log error, skip file, continue processing other CSVs |
| JSON file missing at runtime | Fetch (404 error) | Display "Data temporarily unavailable", retry option |

---

## Performance Considerations

### File Size Estimates

**Assumptions**:
- 85 metrics × 8 bytes avg per number/null = ~680 bytes per BrandMetrics
- 100 brands with quarterly data per quarter
- 10 quarters total

**Calculations**:
- Single quarter file: 100 records × (680 bytes metrics + ~100 bytes metadata) ≈ 78 KB
- All quarters: 10 files × 78 KB ≈ 780 KB total
- QuarterIndex: <5 KB

**Optimization**:
- Lazy loading: Only fetch quarters when viewing brand detail (not on catalog load)
- Caching: Store fetched quarters in Map to avoid re-fetching
- Compression: Serve with gzip (JSON compresses well, estimate 5:1 ratio → ~156 KB total)

**Validation Against Success Criteria**:
- SC-001: <2 seconds to load brand with data
  - Worst case: 10 quarter files × 78 KB = 780 KB ÷ 5 (gzip) = 156 KB
  - On typical connection (10 Mbps): 156 KB × 8 / 10 Mbps ≈ 0.125 seconds (well under 2s)
- SC-005: <30 seconds for multi-quarter comparison
  - Data already loaded from detail view, only rendering time matters (easily <30s)

---

## Summary

Data model consists of:
1. **Brand** (existing): Extended optionally with quarterly data availability flags
2. **QuarterlyDataRecord**: Single brand's metrics for one quarter
3. **BrandMetrics**: 85+ metric fields (all nullable)
4. **QuarterlyData**: Complete dataset for one quarter (one JSON file)
5. **QuarterIndex**: Master list of available quarters
6. **BrandWithQuarterlyData**: View model for UI components

All entities support functional requirements FR-001 through FR-011 and success criteria SC-001 through SC-006.
