#!/usr/bin/env node

/**
 * Quarterly Data Processing Script
 * Feature: 004-quarterly-data-association
 *
 * Processes quarterly brand perception CSV files:
 * 1. Scans for CSV files in /public/test-data/
 * 2. Parses each CSV and matches brands to brands.json
 * 3. Generates JSON files in /public/assets/data/quarterly/
 * 4. Creates index.json with list of available quarters
 *
 * Usage: npm run process-quarterly-data
 */

import { promises as fs } from 'fs';
import path from 'path';
import { parseQuarterlyCSV, csvRowToMetrics, extractQuarter, QuarterlyCSVRow } from '../utils/csvParser';
import { findBrandByName } from '../utils/brandMatcher';
import type { Brand } from '../types/brand';
import type { QuarterlyData, QuarterlyDataRecord, QuarterIndex } from '../types/quarterlyData';

// Configuration
const CSV_SOURCE_DIR = path.resolve(process.cwd(), 'public/test-data');
const OUTPUT_DIR = path.resolve(process.cwd(), 'public/assets/data/quarterly');
const BRANDS_JSON_PATH = path.resolve(process.cwd(), 'public/data/brands/brands.json');

// T042: Validation configuration
const REQUIRED_CSV_COLUMNS = [
  'Brand name',
  'Brand id',
  'Category',
  'Total_Users_pct',
  'Total_Prefer_pct',
];

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * T042: Validate CSV structure and content
 */
function validateCSVData(rows: QuarterlyCSVRow[], filename: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // Check if CSV has any rows
  if (rows.length === 0) {
    result.isValid = false;
    result.errors.push('CSV file is empty or could not be parsed');
    return result;
  }

  // Check for required columns
  const firstRow = rows[0];
  const columns = Object.keys(firstRow);
  const missingColumns = REQUIRED_CSV_COLUMNS.filter(col => !columns.includes(col));

  if (missingColumns.length > 0) {
    result.isValid = false;
    result.errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    return result;
  }

  // Validate row data
  let emptyBrandCount = 0;
  let invalidMetricCount = 0;
  const invalidRows: number[] = [];

  rows.forEach((row, index) => {
    const brandName = row['Brand name'];

    // Check for empty brand names
    if (!brandName || brandName.trim() === '') {
      emptyBrandCount++;
      if (invalidRows.length < 5) {
        invalidRows.push(index + 1);
      }
    }

    // Validate numeric fields (sample key metrics)
    const metricsToCheck = [
      'Total_Users_pct',
      'Total_Prefer_pct',
      'Brand_Stature_C',
      'Brand_Strength_C',
    ];

    metricsToCheck.forEach(metric => {
      const value = row[metric];
      if (value !== '' && value !== null && value !== undefined) {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          invalidMetricCount++;
          if (!result.warnings.includes(`Row ${index + 1}: Invalid numeric value for ${metric}: "${value}"`)) {
            result.warnings.push(`Row ${index + 1}: Invalid numeric value for ${metric}: "${value}"`);
          }
        }
        // Check for reasonable ranges (percentages should be 0-100)
        if (metric.endsWith('_pct') && !isNaN(numValue)) {
          if (numValue < 0 || numValue > 100) {
            result.warnings.push(`Row ${index + 1}: ${metric} value ${numValue} is outside expected range [0-100]`);
          }
        }
      }
    });
  });

  // Add warnings summary
  if (emptyBrandCount > 0) {
    result.warnings.push(`${emptyBrandCount} rows have empty brand names (will be skipped)`);
    if (invalidRows.length > 0) {
      result.warnings.push(`  Example rows: ${invalidRows.join(', ')}${invalidRows.length < emptyBrandCount ? '...' : ''}`);
    }
  }

  if (invalidMetricCount > 0) {
    result.warnings.push(`${invalidMetricCount} invalid metric values detected (will be stored as null)`);
  }

  // Check for duplicate brand names
  const brandNames = rows.map(row => row['Brand name']).filter(name => name && name.trim());
  const duplicates = brandNames.filter((name, index) => brandNames.indexOf(name) !== index);
  const uniqueDuplicates = [...new Set(duplicates)];

  if (uniqueDuplicates.length > 0) {
    result.warnings.push(`${uniqueDuplicates.length} duplicate brand names found (only first occurrence will be used)`);
    if (uniqueDuplicates.length <= 5) {
      result.warnings.push(`  Duplicates: ${uniqueDuplicates.join(', ')}`);
    }
  }

  return result;
}

/**
 * T042: Validate CSV file before processing
 */
async function validateCSVFile(filePath: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  try {
    // Check if file exists and is readable
    const stats = await fs.stat(filePath);

    // Check file size (warn if > 10MB)
    const fileSizeMB = stats.size / (1024 * 1024);
    if (fileSizeMB > 10) {
      result.warnings.push(`Large file size: ${fileSizeMB.toFixed(2)}MB (may take longer to process)`);
    }

    // Check if file is empty
    if (stats.size === 0) {
      result.isValid = false;
      result.errors.push('CSV file is empty');
    }

  } catch (error) {
    result.isValid = false;
    result.errors.push(`Cannot access file: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Main processing function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('  Quarterly Brand Data Processing');
  console.log('='.repeat(60));

  try {
    // Step 1: Load brands.json
    console.log('\n1. Loading brands.json...');
    const brandsData = await fs.readFile(BRANDS_JSON_PATH, 'utf-8');
    const { brands } = JSON.parse(brandsData) as { brands: Brand[] };
    console.log(`✓ Loaded ${brands.length} brands from brands.json`);

    // Step 2: Scan for CSV files
    console.log('\n2. Scanning for CSV files...');
    const csvFiles = await findCSVFiles(CSV_SOURCE_DIR);
    console.log(`✓ Found ${csvFiles.length} CSV files`);

    if (csvFiles.length === 0) {
      console.log(`\n⚠️  No CSV files found in ${CSV_SOURCE_DIR}`);
      console.log('   Place quarterly CSV files (e.g., 2010Q1-Table 1.csv) in /public/test-data/');
      return;
    }

    // Step 3: Process each CSV file
    console.log('\n3. Processing CSV files...');
    const quarterlyDataList: QuarterlyData[] = [];

    for (const csvFile of csvFiles) {
      const filename = path.basename(csvFile);
      const quarter = extractQuarter(filename);

      console.log(`\n   Processing ${filename} → ${quarter}.json`);

      try {
        // T042: Validate CSV file before processing
        const fileValidation = await validateCSVFile(csvFile);
        if (!fileValidation.isValid) {
          console.error(`   ❌ File validation failed:`);
          fileValidation.errors.forEach(err => console.error(`      - ${err}`));
          continue; // Skip this file
        }
        if (fileValidation.warnings.length > 0) {
          fileValidation.warnings.forEach(warn => console.warn(`   ⚠️  ${warn}`));
        }

        // Parse CSV
        const rows = await parseQuarterlyCSV(csvFile);
        console.log(`   - Parsed ${rows.length} rows`);

        // T042: Validate CSV data structure and content
        const dataValidation = validateCSVData(rows, filename);
        if (!dataValidation.isValid) {
          console.error(`   ❌ Data validation failed:`);
          dataValidation.errors.forEach(err => console.error(`      - ${err}`));
          continue; // Skip this file
        }
        if (dataValidation.warnings.length > 0) {
          console.log(`   ⚠️  Data validation warnings:`);
          // Limit warnings to 10 to avoid cluttering output
          dataValidation.warnings.slice(0, 10).forEach(warn => console.warn(`      - ${warn}`));
          if (dataValidation.warnings.length > 10) {
            console.warn(`      ... and ${dataValidation.warnings.length - 10} more warnings`);
          }
        }

        // Match brands and create records
        const { records, unmatchedBrands } = await processCSVRows(rows, brands);

        console.log(`   - Matched ${records.length} brands`);
        if (unmatchedBrands.length > 0) {
          console.log(`   ⚠️  ${unmatchedBrands.length} unmatched brands:`);
          unmatchedBrands.slice(0, 5).forEach(name => console.log(`      - ${name}`));
          if (unmatchedBrands.length > 5) {
            console.log(`      ... and ${unmatchedBrands.length - 5} more`);
          }
        }

        // Create QuarterlyData object
        const quarterlyData: QuarterlyData = {
          quarter,
          sourceFile: filename,
          processedAt: new Date().toISOString(),
          recordCount: rows.length,
          matchedBrands: records.length,
          unmatchedBrands,
          records,
        };

        quarterlyDataList.push(quarterlyData);

        // Write quarter JSON file
        const outputPath = path.join(OUTPUT_DIR, `${quarter}.json`);
        await fs.writeFile(outputPath, JSON.stringify(quarterlyData, null, 2), 'utf-8');
        console.log(`   ✓ Written ${outputPath}`);

      } catch (error) {
        console.error(`   ❌ Error processing ${filename}:`, error);
        // Continue with other files
      }
    }

    // Step 4: Generate index.json
    console.log('\n4. Generating index.json...');
    const index = createQuarterIndex(quarterlyDataList, csvFiles);
    const indexPath = path.join(OUTPUT_DIR, 'index.json');
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');
    console.log(`✓ Written ${indexPath}`);

    // Step 5: Summary
    console.log('\n' + '='.repeat(60));
    console.log('  Processing Complete');
    console.log('='.repeat(60));
    console.log(`\n✓ Processed ${quarterlyDataList.length} quarterly CSV files`);
    console.log(`✓ Generated ${quarterlyDataList.length} JSON files in ${OUTPUT_DIR}`);
    console.log(`✓ Total quarters available: ${index.quarters.length}`);

    const totalMatched = quarterlyDataList.reduce((sum, q) => sum + q.matchedBrands, 0);
    const totalRecords = quarterlyDataList.reduce((sum, q) => sum + q.recordCount, 0);
    console.log(`\n📊 Statistics:`);
    console.log(`   - Total CSV rows: ${totalRecords}`);
    console.log(`   - Total matched brands: ${totalMatched}`);
    console.log(`   - Match rate: ${((totalMatched / totalRecords) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

/**
 * Find all CSV files in directory
 */
async function findCSVFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.csv'))
      .map(entry => path.join(dir, entry.name));
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    return [];
  }
}

/**
 * Process CSV rows and match to brands
 */
async function processCSVRows(
  rows: QuarterlyCSVRow[],
  brands: Brand[]
): Promise<{ records: QuarterlyDataRecord[]; unmatchedBrands: string[] }> {
  const records: QuarterlyDataRecord[] = [];
  const unmatchedBrands: string[] = [];

  for (const row of rows) {
    const csvBrandName = row['Brand name'];
    const csvBrandId = row['Brand id'];
    const csvCategory = row.Category;

    // Skip rows with no brand name
    if (!csvBrandName || csvBrandName.trim() === '') {
      continue;
    }

    // Try to match brand by name (case-insensitive)
    const matchedBrand = findBrandByName(csvBrandName, brands);

    if (matchedBrand) {
      // Create QuarterlyDataRecord
      const record: QuarterlyDataRecord = {
        brandId: matchedBrand.id,
        brandName: matchedBrand.name,
        csvBrandId,
        category: csvCategory,
        metrics: csvRowToMetrics(row),
      };
      records.push(record);
    } else {
      // Track unmatched brand
      if (!unmatchedBrands.includes(csvBrandName)) {
        unmatchedBrands.push(csvBrandName);
      }
    }
  }

  return { records, unmatchedBrands };
}

/**
 * Create quarter index from processed data
 */
function createQuarterIndex(
  quarterlyDataList: QuarterlyData[],
  csvFiles: string[]
): QuarterIndex {
  // Sort quarters chronologically
  const quarters = quarterlyDataList
    .map(q => q.quarter)
    .filter(q => q !== 'UNKNOWN')
    .sort();

  // Create quarter → filename mapping
  const quarterFiles: Record<string, string> = {};
  quarterlyDataList.forEach(q => {
    quarterFiles[q.quarter] = q.sourceFile;
  });

  return {
    quarters,
    quarterFiles,
    lastUpdated: new Date().toISOString(),
    totalQuarters: quarters.length,
  };
}

// Run main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
