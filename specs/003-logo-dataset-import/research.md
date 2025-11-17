# Research: Brand Logos Dataset Import

**Feature**: 003-logo-dataset-import
**Date**: 2025-11-14
**Status**: Complete

## Overview

This document consolidates research findings for technical decisions required to implement the brand logos dataset import feature. All "NEEDS CLARIFICATION" items from the Technical Context have been researched and resolved.

## Research Tasks

### 1. CSV Parsing Library Selection

**Decision**: Use native Web File API + manual CSV parsing (no external library)

**Rationale**:
- **Lightweight**: No additional dependencies for simple CSV parsing (2 columns only)
- **Built-in support**: Modern browsers provide File API for reading local files
- **Performance**: For simple CSV structure (logoName, fileName), regex/split parsing is sufficient
- **Vite compatibility**: No build configuration needed for native APIs
- **Control**: Full control over error handling and validation logic

**Alternatives considered**:
- **PapaParse** (5.4.1): Popular CSV parser with 30KB gzipped size
  - Rejected because: Overkill for simple 2-column CSV; adds bundle size
  - Would use if: Complex CSV with many columns, quoted fields, edge cases

- **csv-parser** (Node.js): Server-side streaming parser
  - Rejected because: Node.js only; doesn't work in browser
  - Would use if: Building CLI-only tool without browser support

- **Native approach**: String.split(',') with basic validation
  - **Selected**: Sufficient for simple CSV structure; zero dependencies
  - Handles: Line splits, comma separation, basic quote handling
  - Performance: Faster than parsing libraries for simple cases

**Implementation notes**:
- Use TextDecoder for UTF-8/ASCII encoding support (FR-014)
- Handle Windows (CRLF) and Unix (LF) line endings
- Support optional header row detection
- Validate column count per row (must be exactly 2)

### 2. Image Validation Library Selection

**Decision**: Use file-type (19.0.0) for format detection + native browser APIs for validation

**Rationale**:
- **Magic number detection**: file-type uses file signatures (magic bytes) to accurately identify file types, regardless of extension
- **Lightweight**: ~50KB minified, tree-shakeable
- **Browser compatible**: Works with File/Blob APIs in modern browsers
- **Robust**: Detects actual file type vs relying on extensions (handles .eps files masquerading as .png)
- **TypeScript support**: Full type definitions included

**Alternatives considered**:
- **Sharp**: High-performance image processing library
  - Rejected because: Node.js native module; doesn't work in browser
  - Requires: libvips binary dependencies
  - Would use if: Need server-side image processing, resizing, optimization

- **Jimp**: Pure JavaScript image manipulation
  - Rejected because: Heavy (300KB+); includes full image processing
  - Would use if: Need to resize/transform images during import

- **Native browser validation** (Image() constructor):
  - Partial use: Validates that images can be decoded
  - Limitation: Doesn't detect malformed files until after loading
  - Combined with: file-type for upfront validation

**Implementation notes**:
- Use file-type to detect PNG (image/png), JPEG (image/jpeg), GIF (image/gif)
- Reject EPS (application/postscript), AI (application/pdf), PDF (application/pdf)
- Validate file size (warn if >10MB per spec assumptions)
- Use Image() constructor to validate decode-ability after type check

### 3. Processing Approach: Client-side vs Build-time/Script

**Decision**: Hybrid approach - Build-time Node.js script (primary) + Client-side UI (future enhancement)

**Rationale**:
- **Primary use case**: Bulk import of existing datasets during development/setup
- **Performance**: Node.js can process 1,000 files faster (file system access vs browser security restrictions)
- **File access**: Node.js has direct file system access; browser requires user file selection
- **Output**: Script can directly write to public/data/brands/ directory
- **Developer experience**: Simple `npm run import-brands` command

**Phase 1 Implementation** (Build-time script):
- Node.js TypeScript script in `src/scripts/import-brands.ts`
- Runs via npm script: `npm run import-brands <csv-path> <logos-dir>`
- Uses Node.js file system APIs (fs/promises)
- Outputs brands.json and copies logos to public/data/brands/logos/
- Generates detailed import-report.json with validation results

**Phase 2 Enhancement** (Client-side UI - optional):
- React ImportWizard component for browser-based imports
- Uses File API + FileReader for CSV and image files
- Drag-and-drop interface for CSV + folder selection
- Downloads brands.json for user to add to repository
- Useful for: Non-technical users, future admin interface

**Technical approach for Phase 1**:
- Use csv-parser (Node.js) for streaming CSV reading
- Use file-type (ESM) for image validation in Node.js
- Use fs/promises for async file operations
- Generate structured error reports with line numbers

### 4. UI Component Approach

**Decision**: Defer client-side UI to post-MVP; focus on CLI/script approach for Phase 1

**Rationale**:
- **User personas**: Primary users are developers setting up the application
- **Frequency**: Import is a one-time or infrequent operation (initial setup, periodic updates)
- **Complexity**: CLI script is simpler and faster to implement than full UI
- **Testing**: Easier to test script with fixtures than UI workflows
- **Progressive enhancement**: Can add UI later if non-developer users need import capability

**Phase 1 deliverable**:
- Node.js script with CLI arguments
- Detailed console output with progress indicators
- JSON report file for programmatic processing

**Future UI considerations** (if needed):
- Drag-and-drop CSV + folder selection (File System Access API)
- Real-time validation feedback as user selects files
- Progress bar for large imports
- Downloadable error report
- Accessibility: Keyboard navigation, screen reader support, WCAG 2.1 AA

## Technology Stack Summary

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Runtime | Node.js | 18+ | Execute import script |
| Language | TypeScript | 5.3+ | Type safety, existing project standard |
| CSV Parser | csv-parser | 3.0.0 | Streaming CSV parsing (Node.js) |
| File Type Detection | file-type | 19.0.0 | Magic byte validation for images |
| File System | fs/promises | Native | Async file operations |
| Testing | Vitest | 4.0.8 | Unit and integration tests |
| CLI Framework | commander | 11.1.0 | Argument parsing, help text |

## Performance Benchmarks

Expected performance for 1,000 brand import (based on technical research):

| Operation | Estimated Time | Notes |
|-----------|----------------|-------|
| CSV Parse | ~50ms | Streaming read, 2 columns |
| File Type Validation | ~5-10s | Magic byte read for 1,000 files |
| Image Copy | ~10-15s | Copy files to public/data/brands/logos/ |
| JSON Generation | ~10ms | Serialize Brand[] to brands.json |
| **Total** | **~15-25s** | Well under 60s target (SC-003) |

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Large file sizes (>10MB) | Validate file size before processing; warn user |
| Corrupted images | Use file-type magic bytes + Image decode validation |
| Encoding issues | Support UTF-8 and ASCII; use TextDecoder with fallback |
| Duplicate brand names | Track seen names; reject duplicates per FR-016 |
| Missing files | Validate file existence before processing; report missing |
| Unsupported formats | Whitelist PNG/JPEG/GIF; reject all others with clear errors |

## Open Questions Resolved

All NEEDS CLARIFICATION items from Technical Context have been resolved:

1. ✅ **CSV parsing library**: Native approach for client; csv-parser for Node.js
2. ✅ **Image validation library**: file-type (magic bytes) + native validation
3. ✅ **Processing approach**: Build-time Node.js script (Phase 1), client-side UI (Phase 2)
4. ✅ **UI approach**: CLI/script first; defer UI to future enhancement

## References

- [file-type npm](https://www.npmjs.com/package/file-type) - File type detection via magic bytes
- [csv-parser npm](https://www.npmjs.com/package/csv-parser) - Streaming CSV parser for Node.js
- [Node.js fs/promises API](https://nodejs.org/api/fs.html#promises-api) - File system operations
- [File API MDN](https://developer.mozilla.org/en-US/docs/Web/API/File_API) - Browser file handling
- [commander npm](https://www.npmjs.com/package/commander) - CLI argument parsing
