/**
 * CSV Parser for brand logos dataset import
 *
 * Parses CSV files containing brand logo metadata and validates row data.
 * Supports standard CSV format with logoName and fileName columns.
 */

import { promises as fs } from 'fs';
import type { CSVRow, ImportError } from '../../types/importer';
import { MAX_BRAND_NAME_LENGTH } from '../../types/importer';

/**
 * Parse CSV file and extract brand rows
 *
 * Reads a CSV file, parses rows, and extracts logoName and fileName columns.
 * Handles both Windows (CRLF) and Unix (LF) line endings.
 * Supports optional header row.
 *
 * @param csvPath - Path to CSV file
 * @returns Array of parsed CSV rows with line numbers
 * @throws Error if file cannot be read or parsed
 */
export async function parseCSV(csvPath: string): Promise<CSVRow[]> {
  try {
    // Read file contents with UTF-8 encoding
    const fileContent = await fs.readFile(csvPath, 'utf-8');

    // Split into lines (handle both CRLF and LF)
    const lines = fileContent.split(/\r?\n/);

    const rows: CSVRow[] = [];
    let hasHeader = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) continue;

      // Check if first line is header
      if (i === 0 && (line.toLowerCase().includes('logoname') || line.toLowerCase().includes('filename'))) {
        hasHeader = true;
        continue;
      }

      // Parse CSV line (basic parsing - handles quoted fields)
      const columns = parseCSVLine(line);

      // Validate column count (must be exactly 2)
      if (columns.length !== 2) {
        // Add malformed row with empty values for error reporting
        rows.push({
          logoName: columns[0] || '',
          fileName: columns[1] || '',
          lineNumber: hasHeader ? i + 1 : i + 1
        });
        continue;
      }

      const [logoName, fileName] = columns;

      rows.push({
        logoName: logoName.trim(),
        fileName: fileName.trim(),
        lineNumber: hasHeader ? i + 1 : i + 1 // Adjust for header
      });
    }

    return rows;
  } catch (error) {
    throw new Error(`Failed to parse CSV file ${csvPath}: ${error}`);
  }
}

/**
 * Parse a single CSV line handling quoted fields
 *
 * @param line - CSV line to parse
 * @returns Array of column values
 */
function parseCSVLine(line: string): string[] {
  const columns: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // End of column
      columns.push(current);
      current = '';
    } else {
      // Add character to current column
      current += char;
    }
  }

  // Add last column
  columns.push(current);

  return columns;
}

/**
 * Validate CSV row structure and data
 *
 * Checks that logoName and fileName are non-empty and within length limits.
 *
 * @param row - CSV row to validate
 * @returns Validation error or null if valid
 */
export function validateRow(row: CSVRow): ImportError | null {
  // Validate logoName
  if (!row.logoName || row.logoName.trim().length === 0) {
    return {
      code: 'csv_validation_error',
      message: 'Brand name (logoName) is required and cannot be empty',
      field: 'logoName',
      details: `Line ${row.lineNumber}`
    };
  }

  if (row.logoName.length > MAX_BRAND_NAME_LENGTH) {
    return {
      code: 'csv_validation_error',
      message: `Brand name exceeds maximum length of ${MAX_BRAND_NAME_LENGTH} characters`,
      field: 'logoName',
      details: `Line ${row.lineNumber}: "${row.logoName.substring(0, 50)}..."`
    };
  }

  // Validate fileName
  if (!row.fileName || row.fileName.trim().length === 0) {
    return {
      code: 'csv_validation_error',
      message: 'File name (fileName) is required and cannot be empty',
      field: 'fileName',
      details: `Line ${row.lineNumber}`
    };
  }

  // Check for invalid file name characters (basic validation)
  const invalidChars = /[<>:"|?*]/;
  if (invalidChars.test(row.fileName)) {
    return {
      code: 'csv_validation_error',
      message: 'File name contains invalid characters',
      field: 'fileName',
      details: `Line ${row.lineNumber}: "${row.fileName}"`
    };
  }

  return null; // Valid
}
