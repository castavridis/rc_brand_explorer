# Implementation Plan: Quarterly Brand Data Association

**Branch**: `004-quarterly-data-association` | **Date**: 2025-11-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-quarterly-data-association/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Associate brands from brands.json with quarterly brand perception metrics from CSV files. System will parse ~10 CSV files (each representing a different quarter) containing 85+ metrics per brand (awareness, preference, brand equity scores, perception attributes). Brands may have data in some quarters but not others. Users will be able to view quarterly metrics for any brand, compare metrics across quarters, and filter brands by data availability. Technical approach will leverage existing TypeScript/React frontend with new data loading services and UI components for metric visualization.

## Technical Context

**Language/Version**: TypeScript 5.3+ (existing project standard)
**Primary Dependencies**: React 18.2, Vite 5.0, csv-parser 3.0 (existing), Commander 11.1 (existing)
**Storage**: Static JSON files served from /public/assets/data/ (matching existing brands.json pattern), CSV files in /public/test-data/ (or production location)
**Testing**: Vitest 4.0 with @testing-library/react (existing test infrastructure)
**Target Platform**: Web browser (matching existing React SPA deployment on Vercel)
**Project Type**: Single web application (frontend-focused with build-time data processing)
**Performance Goals**: <2 seconds to load brand with quarterly data (per SC-001), <30 seconds to complete multi-quarter comparison (per SC-005)
**Constraints**: Case-insensitive exact matching for brand names, must handle empty/null metric values gracefully, must support sparse quarterly data (not all brands have all quarters)
**Scale/Scope**: ~10 CSV files, 85+ metrics per record, potentially hundreds of brands with varying quarterly coverage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. User-Centric Design ✅

**Compliance**: PASS

- Feature begins with clear user scenarios (view metrics, compare quarters, filter by availability)
- Success criteria are measurable and tied to user outcomes (SC-001 through SC-006)
- Clear user value proposition: enriching brand browsing with quantitative insights
- All three user stories have acceptance scenarios and independent test plans

### II. Modular Architecture ✅

**Compliance**: PASS (verified after Phase 1 design)

- Feature creates self-contained modules with clear contracts:
  - **quarterlyDataLoader**: Independent service with caching, no dependencies on other feature modules
  - **brandAssociationService**: Depends only on quarterlyDataLoader (via interface), maintains clear contract
  - **csvParser** and **brandMatcher** utils: Pure functions, zero dependencies
  - **React components**: QuarterlyMetrics, QuarterComparison, DataAvailabilityBadge all independently testable
- **Contract verification complete**:
  - IQuarterlyDataLoader interface defines public API (loadQuarter, loadQuarters, caching methods)
  - IBrandAssociationService interface depends on IQuarterlyDataLoader (dependency injection ready)
  - No circular dependencies: quarterlyDataLoader ← brandAssociationService ← components
- **Test isolation**: Each module can be tested with mocks (contracts define mockable interfaces)
- Leverages existing module patterns (services/, components/, types/)

**Phase 1 Design Review**: ✅ All modules have singular purpose, clear boundaries, and documented contracts

### III. Novel and Usable UI ✅

**Compliance**: PASS

- Feature enhances existing brand browsing without disrupting current flows
- Progressive disclosure: quarterly data enriches detail view, doesn't complicate main catalog
- Accessibility considerations: data tables/charts must meet WCAG 2.1 AA
- Novel aspects: multi-quarter comparison and temporal trend visualization
- Edge case handling documented (missing data, empty metrics, sparse coverage)

**Gate Status**: ✅ All principles satisfied. Proceed to Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── types/
│   ├── brand.ts (existing - may extend)
│   └── quarterlyData.ts (NEW - quarterly metrics types)
├── services/
│   ├── brandLoader.ts (existing - may extend)
│   ├── quarterlyDataLoader.ts (NEW - load and parse CSV files)
│   └── brandAssociationService.ts (NEW - match brands to quarterly data)
├── components/
│   ├── LogoGrid/ (existing)
│   ├── LogoModal/ (existing - may extend for quarterly data)
│   ├── QuarterlyMetrics/ (NEW - display metrics for single quarter)
│   ├── QuarterComparison/ (NEW - multi-quarter comparison view)
│   └── DataAvailabilityBadge/ (NEW - indicator for data availability)
├── utils/
│   ├── csvParser.ts (NEW - utility for parsing quarterly CSVs)
│   └── brandMatcher.ts (NEW - case-insensitive brand name matching)
└── scripts/
    └── process-quarterly-data.ts (NEW - build-time CSV processing)

public/
├── assets/data/
│   ├── brands.json (existing)
│   └── quarterly/ (NEW - processed quarterly data by quarter)
│       ├── 2010Q1.json
│       ├── 2010Q2.json
│       └── ...
└── test-data/
    └── *.csv (existing CSV files)

tests/
├── unit/
│   ├── services/
│   │   ├── quarterlyDataLoader.test.ts
│   │   └── brandAssociationService.test.ts
│   ├── utils/
│   │   ├── csvParser.test.ts
│   │   └── brandMatcher.test.ts
│   └── components/
│       ├── QuarterlyMetrics.test.tsx
│       └── QuarterComparison.test.tsx
└── integration/
    └── quarterlyDataFlow.test.ts
```

**Structure Decision**: Using existing single-project structure (Option 1). This is a frontend-focused feature with data processing at build time. Quarterly CSV files will be parsed and transformed into JSON during build, then loaded as static assets at runtime. This matches the existing pattern used for brands.json and leverages the existing Vite build pipeline.

## Complexity Tracking

No constitution violations. All gates passed.
