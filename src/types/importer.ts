/**
 * Type definitions for the brand logos dataset import feature
 *
 * These types define the data structures used throughout the import process,
 * from CSV parsing to final output generation.
 */

import type { Brand } from './brand';

/**
 * Input configuration for an import operation
 */
export interface ImportInput {
  /** Path to CSV file containing brand data */
  csvPath: string;

  /** Path to directory containing logo image files */
  logosDir: string;

  /** Optional output directory for brands.json and logos (default: public/data/brands/) */
  outputDir?: string;
}

/**
 * CSV row representing a single brand entry
 */
export interface CSVRow {
  /** Brand name (from logoName column) */
  logoName: string;

  /** Logo file name (from fileName column) */
  fileName: string;

  /** Line number in CSV file (for error reporting) */
  lineNumber: number;
}

/**
 * Supported and unsupported image file types
 */
export type ImageFileType = 'png' | 'jpeg' | 'gif' | 'eps' | 'ai' | 'pdf' | 'unknown';

/**
 * Logo file metadata and validation result
 */
export interface LogoFile {
  /** Full path to logo file in source directory */
  originalPath: string;

  /** Original file name (from CSV fileName column) */
  fileName: string;

  /** Detected file type via magic bytes */
  fileType: ImageFileType;

  /** File size in bytes */
  fileSize: number;

  /** Whether file passed validation */
  isValid: boolean;

  /** Error message if validation failed */
  errorMessage?: string;
}

/**
 * Import status codes
 */
export type ImportStatus =
  | 'success'               // Brand imported successfully
  | 'csv_validation_error'  // Invalid CSV row data
  | 'file_not_found'        // Logo file doesn't exist
  | 'file_type_error'       // Unsupported or malformed file type
  | 'duplicate_brand'       // Brand name already seen (first wins)
  | 'unknown_error';        // Unexpected error

/**
 * Structured error information
 */
export interface ImportError {
  /** Error status code */
  code: ImportStatus;

  /** Human-readable error message */
  message: string;

  /** Field name if validation error (e.g., 'logoName', 'fileName') */
  field?: string;

  /** Additional error context */
  details?: string;
}

/**
 * Result of processing a single CSV row + logo file
 */
export interface ImportResult {
  /** CSV row number (1-indexed) */
  rowNumber: number;

  /** Import status for this entry */
  status: ImportStatus;

  /** Successfully created Brand object (if status = 'success') */
  brand?: Brand;

  /** Error details (if status != 'success') */
  error?: ImportError;

  /** Non-fatal warnings (e.g., large file size) */
  warnings?: string[];
}

/**
 * Aggregate import statistics
 */
export interface ImportSummary {
  /** Total rows processed */
  totalProcessed: number;

  /** Successfully imported count */
  successful: number;

  /** Failed import count */
  failed: number;

  /** Errors grouped by status code */
  errorBreakdown: Partial<Record<ImportStatus, number>>;

  /** Total warnings count */
  warnings: number;

  /** Processing time in milliseconds */
  processingTimeMs: number;
}

/**
 * Complete import operation report
 */
export interface ImportReport {
  /** ISO 8601 timestamp of import operation */
  timestamp: string;

  /** Input summary */
  inputSummary: {
    csvPath: string;
    logosDir: string;
    totalRows: number;
  };

  /** Per-row import results */
  results: ImportResult[];

  /** Aggregate statistics */
  summary: ImportSummary;

  /** Output file paths */
  outputPaths: {
    brandsJson: string;
    logosDir: string;
  };
}

/**
 * Supported image file formats (FR-004)
 */
export const SUPPORTED_FORMATS: ImageFileType[] = ['png', 'jpeg', 'gif'];

/**
 * Unsupported file formats (FR-005, FR-006, FR-007)
 */
export const UNSUPPORTED_FORMATS: ImageFileType[] = ['eps', 'ai', 'pdf'];

/**
 * Default output directory
 */
export const DEFAULT_OUTPUT_DIR = 'public/data/brands';

/**
 * Default brands JSON filename
 */
export const BRANDS_JSON_FILENAME = 'brands.json';

/**
 * Default logos subdirectory
 */
export const LOGOS_SUBDIR = 'logos';

/**
 * Default report JSON filename
 */
export const REPORT_JSON_FILENAME = 'import-report.json';

/**
 * Maximum file size warning threshold (10MB)
 */
export const MAX_FILE_SIZE_WARN = 10 * 1024 * 1024;

/**
 * Maximum brand name length
 */
export const MAX_BRAND_NAME_LENGTH = 200;
