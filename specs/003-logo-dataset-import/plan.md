# Implementation Plan: Brand Logos Dataset Import

**Branch**: `003-logo-dataset-import` | **Date**: 2025-11-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-logo-dataset-import/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature enables importing brand logo datasets from CSV files with associated image files. The system reads a CSV with `logoName` (brand name) and `fileName` columns, validates and processes PNG/JPEG/GIF images from a /Logos directory, handles malformed/unsupported files (EPS, AI, PDF) gracefully, and generates detailed import reports. The implementation will use TypeScript with Node.js for CSV processing and file validation, integrating with the existing React 18+ frontend application structure.

## Technical Context

**Language/Version**: TypeScript 5.3+ (existing project standard)
**Primary Dependencies**:
- React 18+ (existing frontend framework)
- Vite 5+ (existing build tool)
- Vitest (existing test framework)
- CSV parsing library (NEEDS CLARIFICATION: papaparse vs csv-parser vs native approach)
- Image validation library (NEEDS CLARIFICATION: sharp vs jimp vs file-type for format detection)

**Storage**: File system (CSV and image files; output to /data/brands/ directory structure)
**Testing**: Vitest (existing test framework) + @testing-library/react for components
**Target Platform**: Web (Vite dev server + static deployment via Vercel)
**Project Type**: Single web application (existing React SPA structure)
**Performance Goals**:
- Import 1,000 brand entries in under 60 seconds (per spec SC-003)
- Support datasets with at least 1,000 logos without degradation (per spec SC-001)

**Constraints**:
- Browser file API limitations for client-side processing (NEEDS CLARIFICATION: client-side vs build-time/script approach)
- Image files typically under 10MB each (per spec assumptions)
- Must integrate with existing Brand interface and data structure

**Scale/Scope**:
- Support 1,000+ brand entries per import
- Handle mixed file types (PNG, JPEG, GIF valid; EPS, AI, PDF invalid)
- Generate detailed reports with line-by-line validation results

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. User-Centric Design

**Status**: ✅ PASS

- **User Scenarios Defined**: Yes - spec.md contains 3 prioritized user stories (P1-P3)
- **Measurable Success Criteria**: Yes - 7 measurable outcomes defined (SC-001 through SC-007)
- **User Value Proposition**: Clear - enables users to import existing brand logo datasets into the application, saving manual data entry time
- **User Testing Plan**: Defined via acceptance scenarios for each priority level

### II. Modular Architecture

**Status**: ✅ PASS

- **Self-Contained Components**: Import functionality will be isolated in dedicated services/importers/ module
- **Clear Contracts**: Input (CSV + /Logos directory) and output (Brand[] + ImportReport) are well-defined
- **Independent Testing**: Import logic can be tested independently with mock file systems and fixtures
- **No Circular Dependencies**: Import service will depend only on existing Brand types and validation utilities
- **Reusability**: CSV parser and file validator can be extracted as reusable utilities

### III. Novel and Usable UI

**Status**: ✅ PASS - CLI-first approach with optional future UI

- **UI Innovation**: CLI tool (Phase 1) provides straightforward developer experience; browser UI deferred to Phase 2
- **Usability Testing**: CLI tested via developer workflows; browser UI (if implemented) will require user testing
- **Accessibility**: CLI inherits terminal accessibility features; future browser UI must meet WCAG 2.1 AA
- **Progressive Disclosure**: Import report provides detailed errors without cluttering main output; `--verbose` flag for advanced users

**Rationale**: Primary users are developers performing initial setup or periodic updates. CLI meets user needs with minimal complexity. Browser UI can be added later if non-technical users need import capability.

**Post-Design Re-evaluation**: ✅ Design maintains constitutional compliance:
- Modular services (csvParser, fileValidator, brandImporter, reportGenerator) are independently testable
- Clear contracts defined in contracts/importer-api.ts
- No circular dependencies introduced
- User value demonstrated: saves hours of manual data entry for bulk imports

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
│   ├── brand.ts              # Existing - Brand interface
│   └── importer.ts           # NEW - ImportReport, ImportResult types
├── services/
│   ├── brandLoader.ts        # Existing - loads brands.json
│   ├── searchFilter.ts       # Existing - search functionality
│   └── importers/            # NEW - import functionality
│       ├── csvParser.ts      # CSV parsing logic
│       ├── fileValidator.ts  # Image file validation
│       ├── brandImporter.ts  # Main import orchestration
│       └── reportGenerator.ts # Import report generation
├── utils/
│   ├── slugify.ts            # Existing - slug generation
│   └── validation.ts         # Existing - validation utilities
├── components/
│   ├── LogoCard/             # Existing
│   ├── LogoGrid/             # Existing
│   ├── LogoModal/            # Existing
│   └── ImportWizard/         # NEW - UI for import process (TBD)
│       ├── ImportWizard.tsx
│       ├── FileUpload.tsx
│       └── ImportReport.tsx
└── scripts/                  # NEW - CLI/build-time scripts
    └── import-brands.ts      # Node.js script for server-side import

tests/
├── unit/
│   └── services/
│       └── importers/        # NEW - unit tests for import logic
│           ├── csvParser.test.ts
│           ├── fileValidator.test.ts
│           └── brandImporter.test.ts
└── integration/
    └── import-workflow.test.ts # NEW - end-to-end import tests

public/
└── data/
    └── brands/
        ├── brands.json       # Existing - output target for imports
        └── logos/            # Existing - logo storage directory
```

**Structure Decision**: Single web application structure (Option 1) with modular services organization. Import functionality is isolated in `src/services/importers/` for reusability and independent testing. The implementation will support both browser-based imports (via ImportWizard component) and build-time/CLI imports (via scripts/import-brands.ts) to handle different use cases.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
