# Tasks: Quarterly Brand Data Association

**Input**: Design documents from `/specs/004-quarterly-data-association/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification - tests are optional for this feature

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project structure: `src/`, `tests/` at repository root
- Public assets: `/public/assets/data/`
- CSV source files: `/public/test-data/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and type definitions needed by all user stories

- [x] T001 [P] Create quarterlyData.ts type definitions in src/types/quarterlyData.ts (QuarterlyDataRecord, BrandMetrics, QuarterlyData, QuarterIndex, BrandWithQuarterlyData)
- [x] T002 [P] Create directory structure for quarterly JSON output at public/assets/data/quarterly/
- [x] T003 [P] Add npm script "process-quarterly-data" to package.json for build-time CSV processing

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and services that ALL user stories depend on. MUST be complete before ANY user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Implement brandMatcher utility in src/utils/brandMatcher.ts (case-insensitive exact matching per FR-011)
- [x] T005 [P] Implement csvParser utility in src/utils/csvParser.ts (parse quarterly CSV files with 85+ columns)
- [x] T006 Implement process-quarterly-data script in src/scripts/process-quarterly-data.ts (parse CSVs, match brands, generate JSON files)
- [x] T007 Implement quarterlyDataLoader service in src/services/quarterlyDataLoader.ts (load and cache quarterly JSON files per IQuarterlyDataLoader contract)
- [x] T008 Implement brandAssociationService in src/services/brandAssociationService.ts (associate brands with quarterly data per IBrandAssociationService contract)
- [x] T009 Run process-quarterly-data script to generate initial quarterly JSON files in public/assets/data/quarterly/

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Brand Metrics from Quarterly Data (Priority: P1) 🎯 MVP

**Goal**: Users can view brand perception metrics from quarterly data when browsing brands. Displays 85+ metrics per quarter with support for brands that have no data or partial coverage.

**Independent Test**: Load a brand detail page for "7UP" and verify quarterly data from 2010Q1 displays Total_Users_pct: 61.18%, Total_Prefer_pct: 56.95%. Load a brand with no quarterly data and verify "no data available" message appears.

**Acceptance Scenarios**:
1. Brand with quarterly data shows metrics for all available quarters
2. Brand without quarterly data shows "no data available" message
3. Brand with multiple quarters displays all quarters with their metrics

### Implementation for User Story 1

- [x] T010 [P] [US1] Create QuarterlyMetrics component directory and base structure in src/components/QuarterlyMetrics/
- [x] T011 [P] [US1] Create MetricCategory subcomponent in src/components/QuarterlyMetrics/MetricCategory.tsx (groups metrics by category: awareness, perception, relationship)
- [x] T012 [P] [US1] Create MetricValue subcomponent in src/components/QuarterlyMetrics/MetricValue.tsx (displays individual metric with null handling)
- [x] T013 [US1] Implement QuarterlyMetrics main component in src/components/QuarterlyMetrics/QuarterlyMetrics.tsx (uses brandAssociationService to load brand data, displays all available quarters)
- [x] T014 [US1] Add QuarterlyMetrics styles in src/components/QuarterlyMetrics/QuarterlyMetrics.css (accessible tables, WCAG 2.1 AA compliant)
- [x] T015 [US1] Integrate QuarterlyMetrics into LogoModal component in src/components/LogoModal/LogoModal.tsx (add quarterly data tab or section)
- [x] T016 [US1] Implement loading state handling in QuarterlyMetrics component (spinner while fetching quarterly data)
- [x] T017 [US1] Implement error state handling in QuarterlyMetrics component (display error message if data load fails)
- [x] T018 [US1] Implement empty state handling in QuarterlyMetrics component (display "no data available" per SC-006)

**Checkpoint**: ✅ User Story 1 complete - MVP is functional! Users can view quarterly metrics for brands with data, see "no data" for brands without data, and view multiple quarters for brands with coverage

---

## Phase 4: User Story 2 - Compare Brand Performance Across Quarters (Priority: P2)

**Goal**: Users can compare brand metrics across different quarters to identify trends. Supports multi-quarter selection, metric selection, and side-by-side comparison with difference calculations.

**Independent Test**: Select a brand with data in 2010Q1, 2010Q2, and 2010Q4. Verify comparison view shows metrics for Q1, Q2, Q4 with Q3 marked unavailable. Verify 10 percentage point increase from Q1 (50%) to Q2 (60%) is displayed correctly.

**Acceptance Scenarios**:
1. Brand with sparse quarterly coverage shows only available quarters in comparison (e.g., Q1, Q2, Q4 but not Q3)
2. Metric changes are calculated and displayed (e.g., 10 percentage point increase)
3. User can select specific metrics to track across quarters

### Implementation for User Story 2

- [ ] T019 [P] [US2] Create QuarterComparison component directory and base structure in src/components/QuarterComparison/
- [ ] T020 [P] [US2] Create QuarterSelector subcomponent in src/components/QuarterComparison/QuarterSelector.tsx (multi-select quarter picker)
- [ ] T021 [P] [US2] Create MetricSelector subcomponent in src/components/QuarterComparison/MetricSelector.tsx (choose which metrics to compare)
- [ ] T022 [P] [US2] Create ComparisonTable subcomponent in src/components/QuarterComparison/ComparisonTable.tsx (side-by-side comparison with difference calculations)
- [ ] T023 [US2] Implement QuarterComparison main component in src/components/QuarterComparison/QuarterComparison.tsx (uses brandAssociationService.compareQuarters)
- [ ] T024 [US2] Add QuarterComparison styles in src/components/QuarterComparison/QuarterComparison.css (accessible comparison table, responsive layout)
- [ ] T025 [US2] Add "Compare Quarters" button to QuarterlyMetrics component in src/components/QuarterlyMetrics/QuarterlyMetrics.tsx (links to comparison view)
- [ ] T026 [US2] Implement percentage change calculation logic in ComparisonTable subcomponent (highlight increases/decreases)
- [ ] T027 [US2] Implement sparse quarter handling in QuarterComparison component (show "No data" for unavailable quarters per acceptance scenario 1)
- [ ] T028 [US2] Add keyboard navigation support for QuarterSelector and MetricSelector (accessibility requirement per Constitution III)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can view quarterly metrics (US1) and compare metrics across quarters (US2)

---

## Phase 5: User Story 3 - Filter Brands by Quarterly Data Availability (Priority: P3)

**Goal**: Users can filter the brand catalog to show only brands with quarterly data or filter by specific quarter. Each brand in the catalog displays an indicator badge showing data availability.

**Independent Test**: Apply "has quarterly data" filter to catalog with 100 brands (25 with data). Verify only 25 brands display. Filter by specific quarter "2010Q1" and verify only brands with 2010Q1 data appear. View catalog and verify each brand shows data availability indicator.

**Acceptance Scenarios**:
1. Filter by "has quarterly data" shows only brands with at least one quarter
2. Filter by specific quarter shows only brands with data in that quarter
3. Brand catalog displays data availability indicator for each brand

### Implementation for User Story 3

- [ ] T029 [P] [US3] Create DataAvailabilityBadge component in src/components/DataAvailabilityBadge/DataAvailabilityBadge.tsx (displays quarter count or "No data")
- [ ] T030 [P] [US3] Add DataAvailabilityBadge styles in src/components/DataAvailabilityBadge/DataAvailabilityBadge.css (badge styling)
- [ ] T031 [US3] Extend searchFilter service in src/services/searchFilter.ts (add filterByQuarterlyDataAvailability function)
- [ ] T032 [US3] Add quarterly data filter to LogoGrid component in src/components/LogoGrid/LogoGrid.tsx (filter controls for "has data" and "by quarter")
- [ ] T033 [US3] Integrate DataAvailabilityBadge into LogoCard component in src/components/LogoCard/LogoCard.tsx (display badge on each brand card)
- [ ] T034 [US3] Implement quarter-specific filter in searchFilter service (getBrandsWithDataInQuarter from brandAssociationService)
- [ ] T035 [US3] Add filter state management to LogoGrid component (track selected filters, update displayed brands)
- [ ] T036 [US3] Add "Clear filters" button to LogoGrid component (reset to show all brands)

**Checkpoint**: All user stories should now be independently functional - users can view metrics (US1), compare quarters (US2), and filter brands by data availability (US3)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T037 [P] Add loading performance monitoring to quarterlyDataLoader service (track load times, warn if >2s per SC-001)
- [ ] T038 [P] Add accessibility audit for all new components using @axe-core/react (verify WCAG 2.1 AA compliance per Constitution III)
- [ ] T039 [P] Optimize quarterly data caching in quarterlyDataLoader service (verify cache hit rate, tune cache strategy)
- [ ] T040 [P] Add error boundaries for quarterly data components (graceful degradation if data load fails)
- [ ] T041 Update brands.json with quarterlyDataAvailable flags (optional optimization from data-model.md) in public/data/brands/brands.json
- [ ] T042 Add comprehensive CSV validation to process-quarterly-data script (warn about invalid metrics, corrupted files per edge cases)
- [ ] T043 Document quarterly data feature in project README or quickstart guide (usage instructions, troubleshooting)
- [ ] T044 Verify all success criteria are met (SC-001 through SC-006 from spec.md)
- [ ] T045 Run full integration test of quarterly data flow (CSV → JSON → UI rendering)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Stories (Phases 3-5)**: All depend on Foundational (Phase 2) completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - Independent of US1 (though UI integrates with US1 components)
  - User Story 3 (P3): Can start after Foundational - Independent of US1/US2 (though UI integrates with catalog)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### Critical Path

1. **Phase 1 (Setup)** → T001, T002, T003 (can run in parallel)
2. **Phase 2 (Foundational)** → T004, T005 (parallel) → T006 → T007, T008 (parallel) → T009 (MUST complete before any user story)
3. **Phase 3 (US1)** → T010, T011, T012 (parallel) → T013 → T014, T016, T017, T018 (parallel) → T015 (integration)
4. **Phase 4 (US2)** → T019, T020, T021, T022 (parallel) → T023 → T024, T026, T027, T028 (parallel) → T025 (integration)
5. **Phase 5 (US3)** → T029, T030, T031 (parallel) → T032, T033, T034, T035 (sequential dependencies) → T036
6. **Phase 6 (Polish)** → T037, T038, T039, T040, T042 (parallel) → T041 (optional), T043, T044, T045 (sequential validation)

### User Story Dependencies

- **User Story 1 (P1)**: Can start immediately after Foundational (Phase 2) - **MVP SCOPE**
- **User Story 2 (P2)**: Can start after Foundational - Integrates with US1 components but independently testable
- **User Story 3 (P3)**: Can start after Foundational - Integrates with catalog but independently testable

### Within Each User Story

- Phase 3 (US1): Subcomponents (T010-T012) → Main component (T013) → Styling/states (T014-T018) → Integration (T015)
- Phase 4 (US2): Subcomponents (T019-T022) → Main component (T023) → Enhancements (T024-T028) → Integration (T025)
- Phase 5 (US3): Badge component (T029-T030) + Filter logic (T031, T034) → Integration (T032-T033, T035) → Polish (T036)

### Parallel Opportunities

**Setup Phase (all parallel)**:
- T001 (types), T002 (directories), T003 (npm script)

**Foundational Phase (partial parallelism)**:
- T004 (brandMatcher) + T005 (csvParser) can run in parallel
- T007 (quarterlyDataLoader) + T008 (brandAssociationService) can run in parallel after T006

**User Story 1 (partial parallelism)**:
- T010 (structure) + T011 (MetricCategory) + T012 (MetricValue) can run in parallel
- T014 (styles) + T016 (loading) + T017 (error) + T018 (empty) can run in parallel after T013

**User Story 2 (partial parallelism)**:
- T019 (structure) + T020 (QuarterSelector) + T021 (MetricSelector) + T022 (ComparisonTable) can run in parallel
- T024 (styles) + T026 (calculations) + T027 (sparse handling) + T028 (keyboard nav) can run in parallel after T023

**User Story 3 (partial parallelism)**:
- T029 (badge component) + T030 (badge styles) + T031 (filter logic) can run in parallel

**Polish Phase (most parallel)**:
- T037 (monitoring) + T038 (accessibility) + T039 (caching) + T040 (error boundaries) + T042 (validation) can run in parallel

**Cross-Story Parallelism**:
- After Foundational completes, all three user stories can be developed in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch subcomponents in parallel:
Task: "Create QuarterlyMetrics component directory and base structure in src/components/QuarterlyMetrics/"
Task: "Create MetricCategory subcomponent in src/components/QuarterlyMetrics/MetricCategory.tsx"
Task: "Create MetricValue subcomponent in src/components/QuarterlyMetrics/MetricValue.tsx"

# After T013 completes, launch styling and state handling in parallel:
Task: "Add QuarterlyMetrics styles in src/components/QuarterlyMetrics/QuarterlyMetrics.css"
Task: "Implement loading state handling in QuarterlyMetrics component"
Task: "Implement error state handling in QuarterlyMetrics component"
Task: "Implement empty state handling in QuarterlyMetrics component"
```

---

## Parallel Example: Foundational Phase

```bash
# Launch utilities in parallel:
Task: "Implement brandMatcher utility in src/utils/brandMatcher.ts"
Task: "Implement csvParser utility in src/utils/csvParser.ts"

# After T006 completes, launch services in parallel:
Task: "Implement quarterlyDataLoader service in src/services/quarterlyDataLoader.ts"
Task: "Implement brandAssociationService in src/services/brandAssociationService.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T009) - **CRITICAL GATE**
3. Complete Phase 3: User Story 1 (T010-T018)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Load brand "7UP" and verify quarterly data displays
   - Load brand with no data and verify "no data available" message
   - Test performance: verify <2 second load time (SC-001)
5. Deploy/demo if ready

**MVP Deliverable**: Users can view quarterly metrics for brands, with proper handling of brands without data and multiple quarters

### Incremental Delivery

1. **Foundation** (Phases 1-2) → Data processing and services ready
2. **MVP** (Phase 3 / US1) → View quarterly metrics → Test independently → Deploy/Demo
3. **Enhancement 1** (Phase 4 / US2) → Compare quarters → Test independently → Deploy/Demo
4. **Enhancement 2** (Phase 5 / US3) → Filter by data availability → Test independently → Deploy/Demo
5. **Polish** (Phase 6) → Performance, accessibility, validation → Final deploy

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers (after Foundational Phase 2 completes):

1. **Team completes Setup + Foundational together** (T001-T009)
2. **Once Foundational is done**:
   - Developer A: User Story 1 (T010-T018)
   - Developer B: User Story 2 (T019-T028)
   - Developer C: User Story 3 (T029-T036)
3. **Stories complete and integrate independently**
4. **Team collaborates on Polish** (T037-T045)

---

## Task Summary

**Total Tasks**: 45
- Setup (Phase 1): 3 tasks
- Foundational (Phase 2): 6 tasks
- User Story 1 (Phase 3): 9 tasks
- User Story 2 (Phase 4): 10 tasks
- User Story 3 (Phase 5): 8 tasks
- Polish (Phase 6): 9 tasks

**Parallel Opportunities**:
- 15 tasks marked [P] can run in parallel within their phase
- 3 user stories can run in parallel after Foundational phase

**Independent Test Criteria**:
- **US1**: View quarterly metrics for brand with data, verify "no data" message for brand without data
- **US2**: Compare quarters side-by-side, verify sparse quarter handling, verify percentage change calculations
- **US3**: Filter catalog by data availability, verify badge display, verify quarter-specific filtering

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 18 tasks

**Format Validation**: ✅ All tasks follow checklist format with checkbox, ID, [P] marker (where applicable), [Story] label (for user story tasks), and file paths

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Tests are optional - not included per specification
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Foundational phase (T004-T009) MUST complete before any user story work begins
- User Story 1 is the MVP - focus on this first for immediate value
