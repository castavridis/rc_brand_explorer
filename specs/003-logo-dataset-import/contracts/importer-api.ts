/**
 * Importer API Contract
 *
 * This file defines the TypeScript interfaces and function signatures for the
 * brand logos dataset import feature. These contracts define the boundaries
 * between components and ensure type safety across the implementation.
 *
 * Feature: 003-logo-dataset-import
 * Date: 2025-11-14
 */

// ============================================================================
// Input/Output Types
// ============================================================================

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
 * Supported and unsupported image file types
 */
export type ImageFileType = 'png' | 'jpeg' | 'gif' | 'eps' | 'ai' | 'pdf' | 'unknown';

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
 * Brand entity (from existing src/types/brand.ts)
 */
export interface Brand {
  id: string;
  name: string;
  slug: string;
  category: BrandCategory;
  logoPath: string;
  websiteUrl?: string | null;
  description?: string;
  tags?: string[];
  dateAdded: string;
  featured?: boolean;
}

/**
 * Brand categories (from existing src/types/brand.ts)
 */
export type BrandCategory =
  | 'Technology'
  | 'Apparel & Fashion'
  | 'Food & Beverage'
  | 'Automotive'
  | 'Finance & Banking'
  | 'Healthcare'
  | 'Media & Entertainment'
  | 'Retail'
  | 'Sports & Fitness'
  | 'Other';

// ============================================================================
// Function Contracts
// ============================================================================

/**
 * CSV Parser Module
 *
 * Parses CSV files containing brand data
 */
export interface CSVParser {
  /**
   * Parse CSV file and extract brand rows
   *
   * @param csvPath - Path to CSV file
   * @returns Array of parsed CSV rows
   * @throws Error if file cannot be read or parsed
   */
  parseCSV(csvPath: string): Promise<CSVRow[]>;

  /**
   * Validate CSV row structure and data
   *
   * @param row - CSV row to validate
   * @returns Validation error or null if valid
   */
  validateRow(row: CSVRow): ImportError | null;
}

/**
 * File Validator Module
 *
 * Validates logo image files
 */
export interface FileValidator {
  /**
   * Validate logo file type and readability
   *
   * @param filePath - Full path to logo file
   * @param fileName - Original file name from CSV
   * @returns Logo file metadata with validation result
   */
  validateFile(filePath: string, fileName: string): Promise<LogoFile>;

  /**
   * Detect file type via magic bytes
   *
   * @param filePath - Path to file
   * @returns Detected file type
   */
  detectFileType(filePath: string): Promise<ImageFileType>;

  /**
   * Check if file type is supported (PNG, JPEG, GIF)
   *
   * @param fileType - Detected file type
   * @returns True if supported format
   */
  isSupportedFormat(fileType: ImageFileType): boolean;
}

/**
 * Brand Importer Module
 *
 * Main orchestration for import process
 */
export interface BrandImporter {
  /**
   * Execute complete brand import operation
   *
   * @param input - Import configuration
   * @returns Import report with results and statistics
   * @throws Error if critical failure (CSV not found, output dir not writable)
   */
  importBrands(input: ImportInput): Promise<ImportReport>;

  /**
   * Process single CSV row into Brand
   *
   * @param row - CSV row data
   * @param logosDir - Directory containing logo files
   * @returns Import result (success or error)
   */
  processRow(row: CSVRow, logosDir: string): Promise<ImportResult>;

  /**
   * Transform validated CSV row + logo file into Brand entity
   *
   * @param row - Validated CSV row
   * @param logoFile - Validated logo file
   * @returns Brand entity
   */
  transformToBrand(row: CSVRow, logoFile: LogoFile): Brand;

  /**
   * Check if brand name is duplicate (case-insensitive)
   *
   * @param brandName - Brand name to check
   * @param seenBrands - Set of previously seen brand names
   * @returns True if duplicate detected
   */
  isDuplicate(brandName: string, seenBrands: Set<string>): boolean;
}

/**
 * Report Generator Module
 *
 * Generates import reports and output files
 */
export interface ReportGenerator {
  /**
   * Generate import report from results
   *
   * @param input - Original import input
   * @param results - Array of import results
   * @param processingTimeMs - Total processing time
   * @param outputPaths - Generated output file paths
   * @returns Complete import report
   */
  generateReport(
    input: ImportInput,
    results: ImportResult[],
    processingTimeMs: number,
    outputPaths: { brandsJson: string; logosDir: string }
  ): ImportReport;

  /**
   * Write brands.json file
   *
   * @param brands - Array of successfully imported brands
   * @param outputPath - Path to write brands.json
   */
  writeBrandsJSON(brands: Brand[], outputPath: string): Promise<void>;

  /**
   * Write import-report.json file
   *
   * @param report - Import report to write
   * @param outputPath - Path to write report.json
   */
  writeReportJSON(report: ImportReport, outputPath: string): Promise<void>;

  /**
   * Copy logo files to output directory
   *
   * @param successfulResults - Results with valid brands
   * @param sourceDir - Source logos directory
   * @param destDir - Destination logos directory
   */
  copyLogoFiles(
    successfulResults: ImportResult[],
    sourceDir: string,
    destDir: string
  ): Promise<void>;
}

// ============================================================================
// CLI Contract
// ============================================================================

/**
 * CLI options for import-brands script
 */
export interface CLIOptions {
  /** Path to CSV file */
  csv: string;

  /** Path to logos directory */
  logos: string;

  /** Optional output directory */
  output?: string;

  /** Verbose output flag */
  verbose?: boolean;

  /** Dry run (validate only, don't write files) */
  dryRun?: boolean;
}

/**
 * CLI Runner
 *
 * Command-line interface for brand import
 */
export interface CLIRunner {
  /**
   * Parse command-line arguments
   *
   * @param args - Process argv array
   * @returns Parsed CLI options
   */
  parseArgs(args: string[]): CLIOptions;

  /**
   * Execute import from CLI
   *
   * @param options - Parsed CLI options
   * @returns Exit code (0 = success, 1 = failure)
   */
  run(options: CLIOptions): Promise<number>;

  /**
   * Print import report to console
   *
   * @param report - Import report to display
   * @param verbose - Include detailed output
   */
  printReport(report: ImportReport, verbose: boolean): void;
}

// ============================================================================
// Constants
// ============================================================================

/** Supported image file formats (FR-004) */
export const SUPPORTED_FORMATS: ImageFileType[] = ['png', 'jpeg', 'gif'];

/** Unsupported file formats (FR-005, FR-006, FR-007) */
export const UNSUPPORTED_FORMATS: ImageFileType[] = ['eps', 'ai', 'pdf'];

/** Default output directory */
export const DEFAULT_OUTPUT_DIR = 'public/data/brands';

/** Default brands JSON filename */
export const BRANDS_JSON_FILENAME = 'brands.json';

/** Default logos subdirectory */
export const LOGOS_SUBDIR = 'logos';

/** Default report JSON filename */
export const REPORT_JSON_FILENAME = 'import-report.json';

/** Maximum file size warning threshold (10MB) */
export const MAX_FILE_SIZE_WARN = 10 * 1024 * 1024;

/** Maximum brand name length */
export const MAX_BRAND_NAME_LENGTH = 200;
