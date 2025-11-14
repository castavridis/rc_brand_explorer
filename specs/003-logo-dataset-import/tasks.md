# Tasks: Brand Logos Dataset Import

**Input**: Design documents from `/specs/003-logo-dataset-import/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the specification, so test tasks are NOT included in this implementation plan.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths follow existing project structure from plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependencies

- [x] T001 Install Node.js dependencies: file-type@19.0.0, csv-parser@3.0.0, commander@11.1.0
- [x] T002 [P] Add npm script "import-brands" in package.json pointing to src/scripts/import-brands.ts
- [x] T003 [P] Create src/types/importer.ts with ImportInput, CSVRow, LogoFile, ImportResult, ImportReport types
- [x] T004 [P] Create src/services/importers/ directory structure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Create src/utils/fileSystem.ts with file existence/readability check utilities
- [x] T006 [P] Extend src/utils/slugify.ts to support brand ID generation from brand name
- [x] T007 [P] Create src/utils/categoryInference.ts with basic category inference (defaults to "Other")
- [x] T008 Verify existing Brand interface in src/types/brand.ts matches data-model.md requirements

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Import Valid Brand Logos (Priority: P1) 🎯 MVP

**Goal**: Enable importing brand data from CSV file with valid PNG, JPEG, and GIF logo files, outputting brands.json and copied logos

**Independent Test**: Provide a CSV file with valid brand entries and a /Logos directory with matching PNG, JPEG, and GIF files, then verify that brands.json is generated and logos are accessible in public/data/brands/logos/

### Implementation for User Story 1

- [x] T009 [P] [US1] Create src/services/importers/csvParser.ts with parseCSV() function
- [x] T010 [P] [US1] Implement CSV row validation (logoName and fileName non-empty) in csvParser.ts
- [x] T011 [P] [US1] Create src/services/importers/fileValidator.ts with detectFileType() using file-type library
- [x] T012 [P] [US1] Implement isSupportedFormat() in fileValidator.ts (PNG, JPEG, GIF only)
- [x] T013 [P] [US1] Implement validateFile() in fileValidator.ts returning LogoFile metadata
- [x] T014 [US1] Create src/services/importers/brandImporter.ts with transformToBrand() function
- [x] T015 [US1] Implement processRow() in brandImporter.ts (CSV row + file validation → Brand or error)
- [x] T016 [US1] Implement main importBrands() orchestration function in brandImporter.ts
- [x] T017 [US1] Create src/services/importers/reportGenerator.ts with writeBrandsJSON() function
- [x] T018 [US1] Implement copyLogoFiles() in reportGenerator.ts to copy valid logos to public/data/brands/logos/
- [x] T019 [US1] Create src/scripts/import-brands.ts CLI entry point with commander argument parsing
- [x] T020 [US1] Integrate csvParser, fileValidator, brandImporter, reportGenerator in import-brands.ts
- [x] T021 [US1] Add console output for import progress (processing X of Y rows)
- [x] T022 [US1] Handle critical errors (CSV not found, output directory not writable) with clear error messages

**Checkpoint**: At this point, User Story 1 should be fully functional - users can import CSV with all valid brand logos and get brands.json output

---

## Phase 4: User Story 2 - Handle Invalid and Unsupported Files (Priority: P2)

**Goal**: Gracefully skip malformed/unsupported files (EPS, AI, PDF) without breaking the import, ensuring maximum data recovery

**Independent Test**: Include malformed EPS, AI files, and other non-image documents in the /Logos directory along with valid images, then verify that valid logos are imported successfully while invalid files are identified and logged

### Implementation for User Story 2

- [ ] T023 [P] [US2] Extend isSupportedFormat() in fileValidator.ts to explicitly reject EPS format
- [ ] T024 [P] [US2] Extend isSupportedFormat() in fileValidator.ts to explicitly reject AI format
- [ ] T025 [P] [US2] Extend isSupportedFormat() in fileValidator.ts to explicitly reject PDF format
- [ ] T026 [US2] Update validateFile() in fileValidator.ts to set isValid=false for unsupported formats
- [ ] T027 [US2] Add error message generation for unsupported file types in validateFile()
- [ ] T028 [US2] Update processRow() in brandImporter.ts to handle file_not_found status
- [ ] T029 [US2] Update processRow() in brandImporter.ts to handle file_type_error status
- [ ] T030 [US2] Ensure importBrands() continues processing after encountering invalid files
- [ ] T031 [US2] Add console logging for skipped files with reasons (EPS/AI/PDF/not found)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - imports handle mixed valid/invalid files without breaking

---

## Phase 5: User Story 3 - Validate and Report Import Results (Priority: P3)

**Goal**: Provide detailed visibility into import results with counts, error breakdowns, and validation issues

**Independent Test**: Run imports with various datasets (all valid, mixed valid/invalid, all invalid) and verify that accurate summary reports are generated showing success/failure counts and specific issues

### Implementation for User Story 3

- [ ] T032 [P] [US3] Implement duplicate brand name detection in brandImporter.ts with isDuplicate() function
- [ ] T033 [P] [US3] Add Set<string> tracking for seen brand names (case-insensitive) in importBrands()
- [ ] T034 [US3] Update processRow() to check for duplicates and return duplicate_brand status
- [ ] T035 [US3] Implement ImportSummary aggregation logic in reportGenerator.ts
- [ ] T036 [US3] Create generateReport() function in reportGenerator.ts producing complete ImportReport
- [ ] T037 [US3] Implement writeReportJSON() in reportGenerator.ts to save import-report.json
- [ ] T038 [US3] Add detailed console summary output (total processed, successful, failed, error breakdown)
- [ ] T039 [US3] Add validation for empty CSV rows in csvParser.ts with line number tracking
- [ ] T040 [US3] Add validation for malformed CSV rows (not exactly 2 columns) in csvParser.ts
- [ ] T041 [US3] Update import-brands.ts to call generateReport() and writeReportJSON()
- [ ] T042 [US3] Add file size warning detection (>10MB) in fileValidator.ts
- [ ] T043 [US3] Add warnings array to ImportResult for non-fatal issues

**Checkpoint**: All user stories should now be independently functional - imports provide complete visibility into results

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and finalization

- [ ] T044 [P] Add TypeScript type checking for all importer modules (run tsc --noEmit)
- [ ] T045 [P] Verify UTF-8 and ASCII encoding handling in csvParser.ts per FR-014
- [ ] T046 [P] Verify brand name preservation (FR-015) - exact case, spacing, special characters
- [ ] T047 [P] Add --verbose flag support in import-brands.ts CLI for detailed logging
- [ ] T048 [P] Add --dry-run flag support in import-brands.ts CLI for validation without writing
- [ ] T049 [P] Add error handling for Windows (CRLF) and Unix (LF) line endings in csvParser.ts
- [ ] T050 [P] Update CLAUDE.md with import-brands command usage
- [ ] T051 Create sample test data: test-brands.csv with 10 brands in public/test-data/
- [ ] T052 Create sample test logos directory in public/test-data/Logos/ with mixed file types
- [ ] T053 Run import-brands script with test data and verify output
- [ ] T054 Validate quickstart.md instructions match implemented CLI interface
- [ ] T055 Add JSDoc comments to all public functions in importer modules
- [ ] T056 Performance validation: Test import of 1,000 brands completes in <60 seconds (SC-003)

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
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 file validation but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Adds reporting to US1/US2 but independently testable

### Within Each User Story

- Models/types before services
- Services before CLI integration
- Core implementation before error handling enhancements
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T004) marked [P] can run in parallel
- All Foundational tasks (T005-T007) marked [P] can run in parallel within Phase 2
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within User Story 1: T009-T013 (csvParser and fileValidator creation) can run in parallel
- Within User Story 2: T023-T025 (format rejections) can run in parallel
- Within User Story 3: T032-T033 (duplicate detection) can run in parallel
- All Polish tasks (T044-T049) marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch parallel tasks for User Story 1 core modules:
Task: "Create src/services/importers/csvParser.ts with parseCSV() function"
Task: "Implement CSV row validation (logoName and fileName non-empty) in csvParser.ts"
Task: "Create src/services/importers/fileValidator.ts with detectFileType() using file-type library"
Task: "Implement isSupportedFormat() in fileValidator.ts (PNG, JPEG, GIF only)"
Task: "Implement validateFile() in fileValidator.ts returning LogoFile metadata"

# These can all run together since they work on different files
```

---

## Parallel Example: User Story 2

```bash
# Launch parallel tasks for User Story 2 format rejections:
Task: "Extend isSupportedFormat() in fileValidator.ts to explicitly reject EPS format"
Task: "Extend isSupportedFormat() in fileValidator.ts to explicitly reject AI format"
Task: "Extend isSupportedFormat() in fileValidator.ts to explicitly reject PDF format"

# These modify the same file but can be done in parallel by editing different sections
```

---

## Parallel Example: User Story 3

```bash
# Launch parallel tasks for User Story 3 reporting features:
Task: "Implement duplicate brand name detection in brandImporter.ts with isDuplicate() function"
Task: "Add Set<string> tracking for seen brand names (case-insensitive) in importBrands()"

# These work on the same file but different functions, can be parallelized
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T008) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T009-T022)
4. **STOP and VALIDATE**: Test User Story 1 independently with sample CSV + valid logos
5. Verify brands.json generated correctly and logos copied to public/data/brands/logos/
6. Ready for basic use - can import all-valid datasets

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (T009-T022) → Test independently → **Deploy/Demo (MVP!)**
   - Value: Can import valid brand datasets
3. Add User Story 2 (T023-T031) → Test independently → Deploy/Demo
   - Value: Robust handling of mixed valid/invalid files
4. Add User Story 3 (T032-T043) → Test independently → Deploy/Demo
   - Value: Full visibility and troubleshooting capability
5. Add Polish (T044-T056) → Production ready
   - Value: CLI flags, performance validation, documentation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T008)
2. Once Foundational is done:
   - Developer A: User Story 1 (T009-T022) - Core import functionality
   - Developer B: User Story 2 (T023-T031) - Error handling
   - Developer C: User Story 3 (T032-T043) - Reporting
3. Stories complete and integrate independently
4. Team completes Polish tasks together (T044-T056)

---

## Task Summary

**Total Tasks**: 56

### Task Count Per User Story

- **Setup (Phase 1)**: 4 tasks
- **Foundational (Phase 2)**: 4 tasks (BLOCKS all user stories)
- **User Story 1 (Phase 3)**: 14 tasks - Core import functionality
- **User Story 2 (Phase 4)**: 9 tasks - Invalid file handling
- **User Story 3 (Phase 5)**: 12 tasks - Detailed reporting
- **Polish (Phase 6)**: 13 tasks - Cross-cutting improvements

### Parallel Opportunities Identified

- **Setup Phase**: 3 parallel tasks (T002-T004)
- **Foundational Phase**: 3 parallel tasks (T005-T007)
- **User Story 1**: 5 parallel tasks (T009-T013)
- **User Story 2**: 4 parallel tasks (T023-T026)
- **User Story 3**: 2 parallel tasks (T032-T033)
- **Polish Phase**: 6 parallel tasks (T044-T049)
- **Total parallel opportunities**: 23 tasks can run concurrently

### Independent Test Criteria

- **User Story 1**: CSV with 100 valid brands + matching PNG/JPEG/GIF files → brands.json generated with 100 entries
- **User Story 2**: CSV with mixed valid/invalid files → valid brands imported, invalid files logged, no crashes
- **User Story 3**: Multiple import runs → import-report.json shows accurate counts, duplicate detection works, error breakdown correct

### Suggested MVP Scope

**Minimum Viable Product = User Story 1 only (T001-T022)**

This delivers:
- CSV parsing and validation
- File type detection and validation (PNG, JPEG, GIF)
- Brand transformation and ID generation
- brands.json output
- Logo file copying
- CLI tool with basic error handling

**Value**: Enables importing clean, all-valid brand datasets - sufficient for initial setup and testing.

**Future enhancements**: Add US2 for robustness, US3 for reporting, and Polish for production readiness.

---

## Notes

- [P] tasks = different files or independent sections, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No test tasks included since tests were not explicitly requested in specification
- Follow existing project conventions (TypeScript 5.3+, Vite, Vitest available if tests added later)
