# Tasks: Brand Logo Browser

**Input**: Design documents from `/specs/001-logo-browser/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL and not included in this task list unless explicitly requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below use web application structure as defined in plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize Vite project with React and TypeScript template
- [ ] T002 Install dependencies (React 18+, TypeScript 5.3+, Vite 5+) per package.json
- [ ] T003 [P] Configure TypeScript with path aliases in tsconfig.json
- [ ] T004 [P] Configure Vite with module aliases and test setup in vite.config.ts
- [ ] T005 [P] Install development dependencies (Vitest, React Testing Library, axe-core/react, Playwright)
- [ ] T006 Create directory structure (assets/logos/, data/brands/, src/components/, src/services/, src/utils/, src/types/, tests/)
- [ ] T007 [P] Configure ESLint and Prettier for code quality
- [ ] T008 [P] Create test setup file in src/test/setup.ts with testing-library/jest-dom

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Create TypeScript type definitions in src/types/brand.ts (Brand, BrandCategory, SortOption, LoadingState)
- [ ] T010 Copy JSON Schema from contracts/brand-schema.json to data/brands/schema.json
- [ ] T011 Create sample brands.json with 5-10 sample brands in data/brands/brands.json
- [ ] T012 [P] Add 5-10 sample logo files (SVG/PNG) to assets/logos/ directory
- [ ] T013 Implement brandLoader service in src/services/brandLoader.ts (loadBrands, validateBrand functions)
- [ ] T014 Implement searchFilter service in src/services/searchFilter.ts (searchBrands, filterByCategory, sortBrands functions)
- [ ] T015 [P] Create global CSS styles in src/index.css (reset, typography, color variables)
- [ ] T016 [P] Create utility functions in src/utils/slugify.ts and src/utils/validation.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Logo Collection (Priority: P1) 🎯 MVP

**Goal**: Users can browse brand logos in a responsive grid, click to view details

**Independent Test**: Load browser with dataset of 50 logos, verify all display in grid, click logo to open detail modal, verify aspect ratios maintained

### Implementation for User Story 1

- [ ] T017 [P] [US1] Create LogoCard component in src/components/LogoCard/LogoCard.tsx with TypeScript interface
- [ ] T018 [P] [US1] Create LogoCard styles in src/components/LogoCard/LogoCard.module.css (responsive card, hover effects, accessibility focus)
- [ ] T019 [P] [US1] Create LogoGrid component in src/components/LogoGrid/LogoGrid.tsx with grid layout logic
- [ ] T020 [P] [US1] Create LogoGrid styles in src/components/LogoGrid/LogoGrid.module.css (responsive grid, loading/empty states)
- [ ] T021 [US1] Create LogoModal component in src/components/LogoModal/LogoModal.tsx (full-screen detail view, close handlers)
- [ ] T022 [US1] Create LogoModal styles in src/components/LogoModal/LogoModal.module.css (modal overlay, content container, close button)
- [ ] T023 [US1] Implement main App component in src/App.tsx (load brands, manage state, render LogoGrid)
- [ ] T024 [US1] Create App styles in src/App.css (layout, header, main content area)
- [ ] T025 [US1] Update main.tsx to add axe-core for development accessibility audits
- [ ] T026 [US1] Add keyboard navigation support (Tab, Enter, Escape) to LogoCard and LogoModal
- [ ] T027 [US1] Implement lazy loading for logo images using native loading="lazy" attribute
- [ ] T028 [US1] Add error handling for missing/corrupted images with placeholder fallback
- [ ] T029 [US1] Add ARIA labels and semantic HTML for accessibility (WCAG 2.1 AA)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can view logos in a grid and click to see details.

---

## Phase 4: User Story 2 - Search and Filter Logos (Priority: P2)

**Goal**: Users can search brands by name and filter by category

**Independent Test**: Enter "Nike" in search field, verify only matching logos display. Select "Technology" filter, verify only tech brands display. Clear filters, verify all logos return.

### Implementation for User Story 2

- [ ] T030 [P] [US2] Create SearchBar component in src/components/SearchBar/SearchBar.tsx with debounced input
- [ ] T031 [P] [US2] Create SearchBar styles in src/components/SearchBar/SearchBar.module.css (input styling, search icon)
- [ ] T032 [P] [US2] Create FilterPanel component in src/components/FilterPanel/FilterPanel.tsx with category checkboxes
- [ ] T033 [P] [US2] Create FilterPanel styles in src/components/FilterPanel/FilterPanel.module.css (checkbox group, layout)
- [ ] T034 [US2] Integrate SearchBar into App.tsx with search query state management
- [ ] T035 [US2] Integrate FilterPanel into App.tsx with category filter state management
- [ ] T036 [US2] Wire up searchFilter service to filter displayed brands based on search query and categories
- [ ] T037 [US2] Implement empty state message when search/filter returns no results
- [ ] T038 [US2] Add "Clear filters" functionality to reset search and category filters
- [ ] T039 [US2] Add aria-live region to announce search results count for screen readers
- [ ] T040 [US2] Optimize performance with React.useMemo for filtered brands calculation

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can view, search, and filter logos.

---

## Phase 5: User Story 3 - Sort Logo Collection (Priority: P3)

**Goal**: Users can sort logos by different criteria (A-Z, date, random)

**Independent Test**: Select "A-Z" sort, verify alphabetical order. Select "Newest first", verify date order. Select "Random", verify shuffled order.

### Implementation for User Story 3

- [ ] T041 [P] [US3] Create SortControls component in src/components/SortControls/SortControls.tsx with sort dropdown/select
- [ ] T042 [P] [US3] Create SortControls styles in src/components/SortControls/SortControls.module.css (dropdown styling)
- [ ] T043 [US3] Integrate SortControls into App.tsx with sort option state management
- [ ] T044 [US3] Wire up sortBrands function from searchFilter service to reorder brands
- [ ] T045 [US3] Ensure sort persists when search/filter changes (maintain sort order)
- [ ] T046 [US3] Add sort options: alphabetical-asc, alphabetical-desc, newest, oldest, random
- [ ] T047 [US3] Add keyboard navigation for sort dropdown (arrow keys, Enter to select)

**Checkpoint**: All user stories should now be independently functional. Complete feature set delivered.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T048 [P] Add comprehensive error boundaries in src/components/ErrorBoundary.tsx
- [ ] T049 [P] Optimize bundle size by analyzing with vite build --mode production
- [ ] T050 [P] Add loading skeletons for better perceived performance during initial load
- [ ] T051 [P] Implement responsive design breakpoints for mobile/tablet (test < 768px, < 1024px)
- [ ] T052 [P] Add brand count indicator showing X of Y logos displayed
- [ ] T053 Run Lighthouse accessibility audit, target score 90+ (WCAG 2.1 AA)
- [ ] T054 Run performance audit with 100+ logos, verify <3s load time and 60fps scroll
- [ ] T055 [P] Add README documentation with setup instructions and feature overview
- [ ] T056 Test keyboard navigation end-to-end (Tab, Enter, Escape, focus order)
- [ ] T057 Test with screen reader (VoiceOver/NVDA) to verify accessibility
- [ ] T058 Add visual regression tests with Playwright for logo rendering consistency
- [ ] T059 Validate brands.json against JSON Schema (data/brands/schema.json)
- [ ] T060 Create production build and test locally with npm run preview

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 but independently testable (adds search/filter to existing grid)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Builds on US1/US2 but independently testable (adds sort to existing display)

**Note**: US2 and US3 integrate with US1 (they all use the same LogoGrid component), but each adds independent functionality that can be tested separately.

### Within Each User Story

- Components marked [P] (parallel) can be built simultaneously (different files, no dependencies)
- Styles can be written in parallel with component logic
- Integration tasks (wiring into App.tsx) must happen after components are created
- Performance optimizations happen after basic functionality works

### Parallel Opportunities

- **Setup Phase**: All tasks marked [P] can run in parallel (T003, T004, T005, T007, T008)
- **Foundational Phase**: T010, T012, T015, T016 can run in parallel after T009 completes
- **User Story 1**: T017-T018, T019-T020, T021-T022 can run in parallel (different components)
- **User Story 2**: T030-T031, T032-T033 can run in parallel (different components)
- **User Story 3**: T041-T042 can run in parallel
- **Polish Phase**: Most tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all component creation tasks for User Story 1 together:
Task: "Create LogoCard component in src/components/LogoCard/LogoCard.tsx"
Task: "Create LogoCard styles in src/components/LogoCard/LogoCard.module.css"
Task: "Create LogoGrid component in src/components/LogoGrid/LogoGrid.tsx"
Task: "Create LogoGrid styles in src/components/LogoGrid/LogoGrid.module.css"
Task: "Create LogoModal component in src/components/LogoModal/LogoModal.tsx"
Task: "Create LogoModal styles in src/components/LogoModal/LogoModal.module.css"

# After these complete, integrate into App.tsx sequentially
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T016) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T017-T029)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Open browser, verify 50 logos display in grid
   - Click logo, verify modal opens with details
   - Test keyboard navigation (Tab, Enter, Escape)
   - Run Lighthouse accessibility audit (target 90+)
5. Deploy/demo if ready - this is a complete MVP

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! Users can browse logos)
3. Add User Story 2 → Test independently → Deploy/Demo (users can now search/filter)
4. Add User Story 3 → Test independently → Deploy/Demo (users can now sort)
5. Add Polish (Phase 6) → Final production-ready release
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T016)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T017-T029)
   - **Developer B**: User Story 2 (T030-T040) - can start in parallel
   - **Developer C**: User Story 3 (T041-T047) - can start in parallel
3. Stories complete and integrate independently
4. Team collaborates on Polish phase

**Note**: While US2 and US3 integrate with US1's LogoGrid component, they can be developed in parallel because they add separate functionality (search/filter and sort respectively) that doesn't conflict.

---

## Notes

- [P] tasks = different files, no dependencies, can be parallelized
- [Story] label maps task to specific user story for traceability (US1, US2, US3)
- Each user story should be independently completable and testable
- Tests are OPTIONAL - not included in this task list (add if TDD approach requested)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Validation

**Total Tasks**: 60 tasks
- Phase 1 (Setup): 8 tasks
- Phase 2 (Foundational): 8 tasks (BLOCKS all user stories)
- Phase 3 (US1 - View Collection): 13 tasks (MVP)
- Phase 4 (US2 - Search/Filter): 11 tasks
- Phase 5 (US3 - Sort): 7 tasks
- Phase 6 (Polish): 13 tasks

**Parallel Opportunities**: 25 tasks marked [P] can run in parallel with other tasks in their phase

**Independent Test Criteria**:
- **US1**: Load 50 logos → verify grid display → click logo → verify modal → test keyboard nav
- **US2**: Enter search query → verify filtered results → select category → verify filtered → clear filters → verify all logos return
- **US3**: Select A-Z sort → verify order → select date sort → verify order → select random → verify shuffled

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 29 tasks

**Format Validation**: ✅ All tasks follow checklist format with ID, [P] marker (if parallel), [Story] label (for user story tasks), description, and file path where applicable.
