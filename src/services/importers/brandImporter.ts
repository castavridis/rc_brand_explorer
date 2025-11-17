/**
 * Brand Importer - Main orchestration for import process
 *
 * Coordinates CSV parsing, file validation, and brand transformation.
 * Handles error recovery and generates import results for each CSV row.
 */

import type { Brand } from '../../types/brand';
import type { CSVRow, LogoFile, ImportInput, ImportResult } from '../../types/importer';
import { generateBrandId, slugify } from '../../utils/slugify';
import { inferCategory } from '../../utils/categoryInference';
import { fileExists, resolvePath } from '../../utils/fileSystem';
import { parseCSV, validateRow } from './csvParser';
import { validateFile } from './fileValidator';
import { MAX_FILE_SIZE_WARN } from '../../types/importer';

/**
 * Transform validated CSV row + logo file into Brand entity
 *
 * Creates a complete Brand object with generated ID, slug, category, and timestamp.
 *
 * @param row - Validated CSV row
 * @param logoFile - Validated logo file
 * @returns Brand entity
 */
export function transformToBrand(row: CSVRow, logoFile: LogoFile): Brand {
  const brandName = row.logoName.trim();

  return {
    id: generateBrandId(brandName),
    name: brandName, // Preserve exact as-is (FR-015)
    slug: slugify(brandName),
    category: inferCategory(brandName),
    logoPath: `/data/brands/logos/${logoFile.fileName}`,
    dateAdded: new Date().toISOString(),
    featured: false
  };
}

/**
 * Process single CSV row into Brand
 *
 * Validates CSV data, locates and validates logo file, transforms to Brand entity.
 * Returns success or detailed error information.
 *
 * @param row - CSV row data
 * @param logosDir - Directory containing logo files
 * @returns Import result (success or error)
 */
export async function processRow(row: CSVRow, logosDir: string): Promise<ImportResult> {
  const result: ImportResult = {
    rowNumber: row.lineNumber,
    status: 'success'
  };

  try {
    // Step 1: Validate CSV row data
    const csvError = validateRow(row);
    if (csvError) {
      result.status = 'csv_validation_error';
      result.error = csvError;
      return result;
    }

    // Step 2: Locate logo file
    const logoPath = resolvePath(logosDir, row.fileName);
    const exists = await fileExists(logoPath);

    if (!exists) {
      result.status = 'file_not_found';
      result.error = {
        code: 'file_not_found',
        message: `Logo file not found: ${row.fileName}`,
        field: 'fileName',
        details: `Line ${row.lineNumber}`
      };
      return result;
    }

    // Step 3: Validate logo file
    const logoFile = await validateFile(logoPath, row.fileName);

    if (!logoFile.isValid) {
      result.status = 'file_type_error';
      result.error = {
        code: 'file_type_error',
        message: logoFile.errorMessage || 'File validation failed',
        field: 'fileName',
        details: `Line ${row.lineNumber}: ${row.fileName}`
      };
      return result;
    }

    // Step 4: Check for file size warnings (non-fatal)
    const warnings: string[] = [];
    if (logoFile.fileSize > MAX_FILE_SIZE_WARN) {
      const sizeMB = (logoFile.fileSize / (1024 * 1024)).toFixed(2);
      warnings.push(`Large file size: ${sizeMB}MB (consider optimizing for web)`);
    }

    // Step 5: Transform to Brand
    const brand = transformToBrand(row, logoFile);
    result.brand = brand;
    result.status = 'success';
    if (warnings.length > 0) {
      result.warnings = warnings;
    }

    return result;

  } catch (error) {
    result.status = 'unknown_error';
    result.error = {
      code: 'unknown_error',
      message: `Unexpected error processing row: ${error}`,
      details: `Line ${row.lineNumber}`
    };
    return result;
  }
}

/**
 * Check if brand name is duplicate (case-insensitive)
 *
 * @param brandName - Brand name to check
 * @param seenBrands - Set of previously seen brand names (lowercase)
 * @returns True if duplicate detected
 */
export function isDuplicate(brandName: string, seenBrands: Set<string>): boolean {
  const normalized = brandName.toLowerCase().trim();
  return seenBrands.has(normalized);
}

/**
 * Execute complete brand import operation
 *
 * Main orchestration function that:
 * 1. Parses CSV file
 * 2. Processes each row (validate + transform)
 * 3. Detects duplicate brand names
 * 4. Collects successful brands and errors
 * 5. Returns results for report generation
 *
 * @param input - Import configuration
 * @returns Array of import results (one per CSV row)
 */
export async function importBrands(input: ImportInput): Promise<ImportResult[]> {
  const startTime = Date.now();

  try {
    // Step 1: Parse CSV file
    console.log(`\nParsing CSV file: ${input.csvPath}`);
    const rows = await parseCSV(input.csvPath);
    console.log(`Found ${rows.length} rows to process`);

    // Step 2: Initialize duplicate tracking (case-insensitive)
    const seenBrands = new Set<string>();

    // Step 3: Process each row
    const results: ImportResult[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      console.log(`Processing ${i + 1}/${rows.length}: ${row.logoName}`);

      // Check for duplicate brand name (FR-016)
      if (isDuplicate(row.logoName, seenBrands)) {
        const result: ImportResult = {
          rowNumber: row.lineNumber,
          status: 'duplicate_brand',
          error: {
            code: 'duplicate_brand',
            message: `Duplicate brand name: "${row.logoName}" (first occurrence kept)`,
            field: 'logoName',
            details: `Line ${row.lineNumber}`
          }
        };
        results.push(result);
        continue; // Skip duplicate, don't add to seenBrands again
      }

      // Process the row
      const result = await processRow(row, input.logosDir);

      // If successful, mark brand name as seen
      if (result.status === 'success') {
        seenBrands.add(row.logoName.toLowerCase().trim());
      }

      results.push(result);
    }

    const elapsed = Date.now() - startTime;
    console.log(`\nProcessing complete in ${elapsed}ms`);

    return results;

  } catch (error) {
    throw new Error(`Import failed: ${error}`);
  }
}
