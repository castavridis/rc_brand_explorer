# Data Model: Brand Logos Dataset Import

**Feature**: 003-logo-dataset-import
**Date**: 2025-11-14
**Status**: Complete

## Overview

This document defines the data structures and entities used in the brand logos dataset import feature. All types integrate with the existing Brand interface defined in `src/types/brand.ts`.

## Core Entities

### Brand (Existing)

Represents a company or organization with an associated logo. This is the existing data structure that imports must conform to.

**Source**: `src/types/brand.ts`

```typescript
interface Brand {
  id: string;           // Unique identifier (generated from slug)
  name: string;         // Brand name (from CSV logoName column)
  slug: string;         // URL-safe identifier (generated from name)
  category: BrandCategory;  // Classification (inferred or defaulted)
  logoPath: string;     // Relative path to logo file
  websiteUrl?: string | null;  // Optional website
  description?: string; // Optional description
  tags?: string[];      // Optional tags for search
  dateAdded: string;    // ISO 8601 timestamp of import
  featured?: boolean;   // Optional featured flag
}
```

**Validation Rules** (per existing `src/services/brandLoader.ts`):
- `id`: Required, non-empty string
- `name`: Required, non-empty string
- `slug`: Required, non-empty string, URL-safe
- `category`: Required, must be valid BrandCategory
- `logoPath`: Required, non-empty string, valid file path
- `dateAdded`: Required, ISO 8601 formatted date string

**Relationships**:
- One Brand → One Logo File (via logoPath)
- Brand.name maps from CSV logoName column
- Brand.logoPath constructed from CSV fileName column

### ImportInput (New)

Represents the input data for an import operation.

```typescript
interface ImportInput {
  csvPath: string;      // Path to CSV file with brand data
  logosDir: string;     // Path to directory containing logo files
  outputDir?: string;   // Optional output directory (default: public/data/brands/)
}
```

**Validation Rules**:
- `csvPath`: Must exist, must be readable, must have .csv extension
- `logosDir`: Must exist, must be a directory, must be readable
- `outputDir`: If provided, must be writable

### CSVRow (New)

Represents a single row from the import CSV file.

```typescript
interface CSVRow {
  logoName: string;     // Brand name (becomes Brand.name)
  fileName: string;     // Logo file name (relative to logosDir)
  lineNumber: number;   // Line number in CSV (for error reporting)
}
```

**Validation Rules** (per FR-008):
- `logoName`: Required, non-empty after trim, max 200 characters
- `fileName`: Required, non-empty after trim, valid file name characters
- `lineNumber`: Positive integer (1-indexed including header)

**State Transitions**:
- Raw CSV text → CSVRow[] (via parseCSV)
- CSVRow → ValidationResult (via validateRow)
- Valid CSVRow → Brand (via transformToBrand)

### LogoFile (New)

Represents an image file containing a brand's visual identity.

```typescript
interface LogoFile {
  originalPath: string;     // Full path in source logosDir
  fileName: string;         // Original file name (from CSV)
  fileType: ImageFileType;  // Detected file type
  fileSize: number;         // Size in bytes
  isValid: boolean;         // Validation status
  errorMessage?: string;    // Error if isValid = false
}

type ImageFileType = 'png' | 'jpeg' | 'gif' | 'eps' | 'ai' | 'pdf' | 'unknown';

// Supported formats (per FR-004)
const SUPPORTED_FORMATS: ImageFileType[] = ['png', 'jpeg', 'gif'];

// Unsupported formats (per FR-005, FR-006, FR-007)
const UNSUPPORTED_FORMATS: ImageFileType[] = ['eps', 'ai', 'pdf'];
```

**Validation Rules** (per FR-004-FR-010):
- `fileType`: Must be detected via magic bytes, not extension
- Supported: PNG (image/png), JPEG (image/jpeg), GIF (image/gif)
- Unsupported: EPS, AI, PDF (rejected with error)
- `fileSize`: Warn if > 10MB (per spec assumptions)
- `isValid`: True only if fileType in SUPPORTED_FORMATS and file is readable

### ImportResult (New)

Represents the result of processing a single CSV row + logo file.

```typescript
interface ImportResult {
  rowNumber: number;        // CSV line number
  status: ImportStatus;     // Success or failure type
  brand?: Brand;            // Successfully imported brand (if status = 'success')
  error?: ImportError;      // Error details (if status != 'success')
  warnings?: string[];      // Non-fatal warnings (e.g., large file size)
}

type ImportStatus =
  | 'success'               // Brand imported successfully
  | 'csv_validation_error'  // Invalid CSV row data
  | 'file_not_found'        // Logo file doesn't exist
  | 'file_type_error'       // Unsupported or malformed file type
  | 'duplicate_brand'       // Brand name already seen (FR-016)
  | 'unknown_error';        // Unexpected error

interface ImportError {
  code: ImportStatus;       // Error type
  message: string;          // Human-readable error message
  field?: string;           // Field name if validation error (e.g., 'logoName')
  details?: string;         // Additional context (e.g., expected vs actual)
}
```

**State Transitions**:
1. CSVRow → CSV validation → ImportResult (csv_validation_error | continue)
2. LogoFile → File validation → ImportResult (file_* errors | continue)
3. Duplicate check → ImportResult (duplicate_brand | continue)
4. Transform to Brand → ImportResult (success | unknown_error)

### ImportReport (New)

Represents the complete result of an import operation.

```typescript
interface ImportReport {
  timestamp: string;            // ISO 8601 timestamp of import
  inputSummary: {
    csvPath: string;            // Input CSV path
    logosDir: string;           // Input logos directory
    totalRows: number;          // Total CSV rows (excluding header)
  };
  results: ImportResult[];      // Per-row results
  summary: ImportSummary;       // Aggregate statistics
  outputPaths: {
    brandsJson: string;         // Path to generated brands.json
    logosDir: string;           // Path to copied logos directory
  };
}

interface ImportSummary {
  totalProcessed: number;       // Total rows processed
  successful: number;           // Count of status = 'success'
  failed: number;               // Count of status != 'success'
  errorBreakdown: {             // Errors grouped by type
    [K in ImportStatus]?: number;
  };
  warnings: number;             // Total warning count
  processingTimeMs: number;     // Total processing time
}
```

**Relationships**:
- One ImportReport → Many ImportResult (one per CSV row)
- ImportReport.results contains all processed rows
- ImportReport.summary aggregates results statistics

## Data Flow

### Import Processing Pipeline

```
Input: CSV file + Logos directory
  ↓
1. Parse CSV → CSVRow[]
  ↓
2. For each CSVRow:
   a. Validate CSV data → ValidationResult
   b. Check for duplicates → ValidationResult
   c. Locate logo file → LogoFile
   d. Validate file type → LogoFile.isValid
   e. Transform to Brand → Brand | Error
   f. Record result → ImportResult
  ↓
3. Collect results:
   - Successful: Brand[] → brands.json
   - Failed: ImportResult[] (errors)
   - All: ImportResult[] → ImportReport
  ↓
4. Copy valid logo files to output directory
  ↓
Output: brands.json + logos/ + import-report.json
```

### Duplicate Detection (FR-016)

```typescript
// Track seen brand names during import
const seenBrands = new Set<string>();

function checkDuplicate(brandName: string): boolean {
  const normalized = brandName.toLowerCase().trim();
  if (seenBrands.has(normalized)) {
    return true; // Duplicate detected
  }
  seenBrands.add(normalized);
  return false; // First occurrence
}
```

**Rules**:
- Case-insensitive comparison
- Whitespace-trimmed comparison
- First occurrence is kept
- Subsequent duplicates are rejected with `duplicate_brand` status

### Brand Transformation

```typescript
function transformToBrand(row: CSVRow, logoFile: LogoFile): Brand {
  return {
    id: generateId(row.logoName),              // UUID or slug-based ID
    name: row.logoName.trim(),                 // Preserve as-is (FR-015)
    slug: slugify(row.logoName),               // Generate URL-safe slug
    category: inferCategory(row.logoName),     // Infer or default to 'Other'
    logoPath: `/data/brands/logos/${logoFile.fileName}`,
    dateAdded: new Date().toISOString(),       // Current timestamp
    featured: false,                           // Default to non-featured
  };
}
```

**Field Mapping**:
- CSV `logoName` → `Brand.name` (exact, per FR-015)
- CSV `fileName` → `Brand.logoPath` (transformed to public path)
- Generated: `id`, `slug`, `category`, `dateAdded`
- Optional: `websiteUrl`, `description`, `tags`, `featured` (not in CSV)

## Validation Rules Summary

### CSV Validation (FR-001, FR-002, FR-008)

| Field | Rule | Error Code |
|-------|------|-----------|
| logoName | Non-empty, max 200 chars | csv_validation_error |
| fileName | Non-empty, valid filename chars | csv_validation_error |
| Row structure | Exactly 2 columns | csv_validation_error |
| Header | Optional; if present, must be "logoName,fileName" | csv_validation_error |

### File Validation (FR-003-FR-010)

| Check | Rule | Error Code |
|-------|------|-----------|
| File existence | Must exist in logosDir | file_not_found |
| File type | Magic bytes must be PNG/JPEG/GIF | file_type_error |
| Unsupported | EPS/AI/PDF rejected | file_type_error |
| Readability | File must be readable | file_type_error |
| Size warning | Warn if >10MB | (warning only) |

### Brand Validation (FR-011, FR-016)

| Check | Rule | Error Code |
|-------|------|-----------|
| Duplicate name | Case-insensitive, first wins | duplicate_brand |
| Brand completeness | All required fields present | unknown_error |

## Storage Format

### Output: brands.json

```json
{
  "brands": [
    {
      "id": "acme-corp-123",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "category": "Technology",
      "logoPath": "/data/brands/logos/acme.png",
      "dateAdded": "2025-11-14T12:34:56.789Z",
      "featured": false
    }
  ]
}
```

**Format Rules**:
- JSON array under "brands" key (matches existing format)
- ISO 8601 timestamps for dateAdded
- logoPath uses forward slashes (cross-platform)

### Output: import-report.json

```json
{
  "timestamp": "2025-11-14T12:34:56.789Z",
  "inputSummary": {
    "csvPath": "/path/to/brands.csv",
    "logosDir": "/path/to/Logos",
    "totalRows": 100
  },
  "summary": {
    "totalProcessed": 100,
    "successful": 85,
    "failed": 15,
    "errorBreakdown": {
      "file_not_found": 8,
      "file_type_error": 5,
      "duplicate_brand": 2
    },
    "warnings": 3,
    "processingTimeMs": 1523
  },
  "results": [
    {
      "rowNumber": 1,
      "status": "success",
      "brand": { /* Brand object */ }
    },
    {
      "rowNumber": 2,
      "status": "file_not_found",
      "error": {
        "code": "file_not_found",
        "message": "Logo file not found: missing-logo.png",
        "field": "fileName"
      }
    }
  ]
}
```

## Performance Considerations

### Memory Usage

- **CSVRow[]**: ~200 bytes per row × 1,000 rows = ~200KB
- **ImportResult[]**: ~500 bytes per result × 1,000 rows = ~500KB
- **Brand[]**: ~300 bytes per brand × 1,000 brands = ~300KB
- **Total**: ~1MB for 1,000 brand import (well within limits)

### Processing Strategy

- **Streaming CSV**: Parse rows incrementally to avoid loading entire file
- **Sequential file validation**: Process files one at a time (avoid excessive file handles)
- **Batch write**: Collect all successful brands, write JSON once at end
- **Lazy copy**: Copy logo files only for successful imports

## Entity Relationships Diagram

```
┌─────────────┐         ┌──────────────┐
│ ImportInput │────────▶│   CSVRow[]   │
└─────────────┘         └───────┬──────┘
                                │
                                ▼
                        ┌───────────────┐
                        │ ValidationLoop│
                        └───────┬───────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
        ┌──────────────┐  ┌──────────┐  ┌─────────────┐
        │   LogoFile   │  │  Brand   │  │ ImportError │
        └──────────────┘  └─────┬────┘  └──────┬──────┘
                                │               │
                                └───────┬───────┘
                                        ▼
                                ┌───────────────┐
                                │ ImportResult  │
                                └───────┬───────┘
                                        │
                                        ▼
                                ┌───────────────┐
                                │ ImportReport  │
                                └───────────────┘
                                        │
                        ┌───────────────┼───────────────┐
                        ▼               ▼               ▼
                ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐
                │ brands.json  │  │   logos/     │  │ import-report.json │
                └──────────────┘  └──────────────┘  └────────────────────┘
```

## Future Extensions

### Optional Enhancements

If future requirements expand the import capabilities:

1. **Bulk Updates**: Support re-importing to update existing brands
   - Add `mode: 'create' | 'update' | 'upsert'` to ImportInput
   - Match on Brand.name or Brand.slug for updates

2. **Category Inference**: ML-based category detection
   - Add optional `categoryModel?: CategoryModel` to ImportInput
   - Infer BrandCategory from brand name or logo analysis

3. **Image Optimization**: Resize/compress during import
   - Add `imageConfig?: ImageOptimizationConfig` to ImportInput
   - Generate multiple sizes (thumbnail, full)

4. **Metadata Extraction**: Parse additional CSV columns
   - Extend CSVRow to support optional columns
   - Map to Brand.websiteUrl, Brand.description, Brand.tags

These extensions maintain backward compatibility with the core data model defined above.
