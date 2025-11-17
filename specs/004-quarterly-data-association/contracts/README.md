# API Contracts: Quarterly Brand Data Association

**Feature**: 004-quarterly-data-association
**Date**: 2025-11-17

## Overview

This directory contains TypeScript interface definitions (contracts) for services that handle quarterly brand perception data. Contracts define the public API surface, input/output types, error handling, and usage examples.

## Contracts

### 1. quarterlyDataLoader.contract.ts

**Service**: `IQuarterlyDataLoader`
**Purpose**: Load and cache quarterly data from static JSON files
**Key Methods**:
- `loadQuarterIndex()`: Get master list of available quarters
- `loadQuarter(quarter)`: Load data for specific quarter
- `loadQuarters(quarters[])`: Parallel load multiple quarters
- `isQuarterCached(quarter)`: Check cache status
- `clearCache()`: Reset in-memory cache

**Error Types**:
- `QuarterNotFoundError`: Quarter JSON file missing (404)
- `InvalidQuarterDataError`: JSON parsing or validation failed
- `QuarterIndexLoadError`: index.json unavailable

### 2. brandAssociationService.contract.ts

**Service**: `IBrandAssociationService`
**Purpose**: Associate brands with quarterly data by name matching
**Key Methods**:
- `getBrandWithQuarterlyData(brandId)`: Get brand + all quarterly data
- `getMetricsForQuarter(brandId, quarter)`: Get metrics for specific quarter
- `getAvailableQuartersForBrand(brandId)`: List quarters with brand data
- `hasBrandQuarterlyData(brandId)`: Check if brand has any data
- `getBrandsWithDataInQuarter(quarter)`: Filter brands by quarter
- `compareQuarters(brandId, quarters[])`: Multi-quarter comparison
- `getBrandDataCoverage(brandId)`: Statistics about data availability

**Error Types**:
- `BrandNotFoundError`: Brand ID not in brands.json
- Propagates: `QuarterNotFoundError` from loader

**Supporting Types**:
- `BrandDataCoverage`: Statistics interface (quarters with data, coverage %, earliest/latest)

## Contract Dependencies

```
brandAssociationService.contract.ts
  ├─ depends on: quarterlyDataLoader.contract.ts (IQuarterlyDataLoader)
  ├─ depends on: src/types/brand.ts (Brand)
  └─ depends on: src/types/quarterlyData.ts (BrandWithQuarterlyData, BrandMetrics)

quarterlyDataLoader.contract.ts
  └─ depends on: src/types/quarterlyData.ts (QuarterlyData, QuarterIndex)
```

## Data Flow

### Loading Quarterly Data

```
User Action → Component → brandAssociationService → quarterlyDataLoader → fetch()
                                    ↓                         ↓
                            BrandWithQuarterlyData    QuarterlyData (cached)
                                    ↓
                            React Component Render
```

### Example: View Brand Details (User Story 1)

```typescript
// In QuarterlyMetrics component
import { useBrandAssociation } from '../hooks/useBrandAssociation';

function QuarterlyMetrics({ brandId }: { brandId: string }) {
  const { data, loading, error } = useBrandAssociation(brandId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data.availableQuarters.length) return <NoDataMessage />;

  return (
    <div>
      <h2>Quarterly Data for {data.brand.name}</h2>
      {data.availableQuarters.map(quarter => (
        <MetricCategory
          key={quarter}
          quarter={quarter}
          metrics={data.quarterlyData.get(quarter)!}
        />
      ))}
    </div>
  );
}
```

### Example: Compare Quarters (User Story 2)

```typescript
// In QuarterComparison component
import { brandAssociationService } from '../services';

async function handleCompare(brandId: string, selectedQuarters: string[]) {
  const comparison = await brandAssociationService.compareQuarters(
    brandId,
    selectedQuarters
  );

  // comparison is Map<string, BrandMetrics>
  // Only contains quarters where brand has data (sparse map)
  return Array.from(comparison.entries()).map(([quarter, metrics]) => ({
    quarter,
    totalUsers: metrics.Total_Users_pct ?? 'No data',
    preference: metrics.Total_Prefer_pct ?? 'No data',
    // ... other metrics
  }));
}
```

### Example: Filter Brands by Data Availability (User Story 3)

```typescript
// In brand catalog filter
import { brandAssociationService } from '../services';

async function filterBrandsByQuarter(quarter: string, allBrands: Brand[]) {
  const brandsWithData = await brandAssociationService.getBrandsWithDataInQuarter(quarter);

  // Filter brand list to only show brands with data in selected quarter
  return allBrands.filter(brand => brandsWithData.includes(brand.id));
}
```

## Validation Rules

### Contract Compliance

All implementations MUST:
1. Match interface signatures exactly (return types, parameter types)
2. Throw documented error types for failure cases
3. Handle null/undefined per contract specifications
4. Support all methods defined in interface (no partial implementations)

### Error Handling

Contracts define error types; implementations MUST:
- Throw typed errors (not generic Error)
- Include descriptive messages with context (e.g., which quarter/brand failed)
- Document error scenarios in JSDoc comments

### Type Safety

- All parameters and return types use defined interfaces from `/types`
- Nullable types (`| null`) indicate "missing data is valid" (e.g., brand with no quarterly data)
- Optional parameters have default behaviors documented in JSDoc

## Testing Requirements

### Unit Tests

Each service implementation MUST have unit tests covering:
1. **Happy path**: All methods with valid inputs
2. **Error cases**: Each documented error type
3. **Edge cases**: Empty arrays, null values, missing data
4. **Caching behavior** (for quarterlyDataLoader): Cache hits/misses
5. **Matching logic** (for brandAssociationService): Case-insensitive matching

### Integration Tests

Full data flow tests:
1. Load brands.json → Load quarterly data → Associate → Render
2. Brand with no data → Return empty/null (per FR-003, SC-006)
3. Brand with partial coverage → Return only available quarters (per FR-004)
4. Multi-quarter comparison → Handle sparse data

### Contract Tests

Verify implementations conform to contracts:
1. Interface compatibility (TypeScript compilation check)
2. Method signatures match (parameter count, types)
3. Return types match expected interfaces
4. Error types match contract specifications

## Related Documents

- [spec.md](../spec.md): Feature specification and requirements
- [data-model.md](../data-model.md): Entity definitions and relationships
- [research.md](../research.md): Technical decisions and rationale
- [plan.md](../plan.md): Implementation plan and structure

## Notes

- Contracts are **design documents**, not implementation
- Implementation files belong in `src/services/` (not specs directory)
- Contracts use `.contract.ts` suffix to distinguish from implementations
- Update contracts if requirements change (via spec updates)
