/**
 * Report Generator for import operations
 *
 * Handles output generation including brands.json, logo file copying,
 * import report JSON generation, and summary statistics.
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { Brand } from '../../types/brand';
import type { ImportResult, ImportReport, ImportSummary, ImportInput } from '../../types/importer';
import { ensureDirectory, resolvePath } from '../../utils/fileSystem';
import { REPORT_JSON_FILENAME } from '../../types/importer';

/**
 * Write brands.json file
 *
 * Creates the brands.json file with the standard format expected by the application.
 *
 * @param brands - Array of successfully imported brands
 * @param outputPath - Path to write brands.json
 */
export async function writeBrandsJSON(brands: Brand[], outputPath: string): Promise<void> {
  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await ensureDirectory(outputDir);

    // Create brands.json content
    const content = {
      brands: brands
    };

    // Write file with pretty formatting
    await fs.writeFile(outputPath, JSON.stringify(content, null, 2), 'utf-8');

    console.log(`\n✓ Wrote ${brands.length} brands to ${outputPath}`);
  } catch (error) {
    throw new Error(`Failed to write brands.json: ${error}`);
  }
}

/**
 * Copy logo files to output directory
 *
 * Copies validated logo files from source directory to public/data/brands/logos/
 * Only copies files for successfully imported brands.
 *
 * @param successfulResults - Results with valid brands
 * @param sourceDir - Source logos directory
 * @param destDir - Destination logos directory
 */
export async function copyLogoFiles(
  successfulResults: ImportResult[],
  sourceDir: string,
  destDir: string
): Promise<void> {
  try {
    // Ensure destination directory exists
    await ensureDirectory(destDir);

    let copiedCount = 0;

    for (const result of successfulResults) {
      if (result.status === 'success' && result.brand) {
        // Extract filename from brand logoPath
        const fileName = path.basename(result.brand.logoPath);
        const sourcePath = resolvePath(sourceDir, fileName);
        const destPath = resolvePath(destDir, fileName);

        // Copy file
        await fs.copyFile(sourcePath, destPath);
        copiedCount++;
      }
    }

    console.log(`✓ Copied ${copiedCount} logo files to ${destDir}`);
  } catch (error) {
    throw new Error(`Failed to copy logo files: ${error}`);
  }
}

/**
 * Generate import summary from results
 *
 * Aggregates statistics including success/failure counts, error breakdown,
 * and processing time.
 *
 * @param results - Array of import results
 * @param processingTimeMs - Total processing time in milliseconds
 * @returns Import summary with aggregate statistics
 */
function generateSummary(results: ImportResult[], processingTimeMs: number): ImportSummary {
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status !== 'success').length;

  // Count warnings
  const totalWarnings = results.reduce((sum, r) => {
    return sum + (r.warnings?.length || 0);
  }, 0);

  // Group errors by type
  const errorBreakdown: Partial<Record<string, number>> = {};
  results.forEach(r => {
    if (r.status !== 'success') {
      const code = r.error?.code || r.status;
      errorBreakdown[code] = (errorBreakdown[code] || 0) + 1;
    }
  });

  return {
    totalProcessed: results.length,
    successful,
    failed,
    errorBreakdown,
    warnings: totalWarnings,
    processingTimeMs
  };
}

/**
 * Generate complete import report
 *
 * Creates a comprehensive report including input summary, all results,
 * aggregate statistics, and output file paths.
 *
 * @param input - Original import input
 * @param results - Array of import results
 * @param processingTimeMs - Total processing time
 * @param outputPaths - Generated output file paths
 * @returns Complete import report
 */
export function generateReport(
  input: ImportInput,
  results: ImportResult[],
  processingTimeMs: number,
  outputPaths: { brandsJson: string; logosDir: string }
): ImportReport {
  return {
    timestamp: new Date().toISOString(),
    inputSummary: {
      csvPath: input.csvPath,
      logosDir: input.logosDir,
      totalRows: results.length
    },
    results,
    summary: generateSummary(results, processingTimeMs),
    outputPaths
  };
}

/**
 * Write import report JSON file
 *
 * Saves the complete import report to a JSON file for programmatic processing
 * and detailed review.
 *
 * @param report - Import report to write
 * @param outputDir - Directory to write report.json
 */
export async function writeReportJSON(report: ImportReport, outputDir: string): Promise<void> {
  try {
    const reportPath = resolvePath(outputDir, REPORT_JSON_FILENAME);

    // Write report with pretty formatting
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');

    console.log(`✓ Wrote import report to ${reportPath}`);
  } catch (error) {
    throw new Error(`Failed to write import report: ${error}`);
  }
}
