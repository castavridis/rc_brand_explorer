#!/usr/bin/env node

/**
 * Brand Logos Dataset Import CLI
 *
 * Command-line tool for importing brand logo datasets from CSV files.
 * Usage: npm run import-brands <csv-path> <logos-dir> [output-dir]
 */

import { Command } from 'commander';
import path from 'path';
import type { ImportInput } from '../types/importer';
import { DEFAULT_OUTPUT_DIR, BRANDS_JSON_FILENAME, LOGOS_SUBDIR } from '../types/importer';
import { validatePath, resolvePath } from '../utils/fileSystem';
import { importBrands } from '../services/importers/brandImporter';
import { writeBrandsJSON, copyLogoFiles, generateReport, writeReportJSON } from '../services/importers/reportGenerator';

/**
 * Main CLI entry point
 */
async function main() {
  const program = new Command();

  program
    .name('import-brands')
    .description('Import brand logos dataset from CSV file')
    .argument('<csv-path>', 'Path to CSV file containing brand data')
    .argument('<logos-dir>', 'Path to directory containing logo image files')
    .argument('[output-dir]', 'Optional output directory (default: public/data/brands/)', DEFAULT_OUTPUT_DIR)
    .option('-v, --verbose', 'Enable detailed logging', false)
    .option('-d, --dry-run', 'Validate data without writing files', false)
    .version('1.0.0')
    .action(async (csvPath: string, logosDir: string, outputDir: string = DEFAULT_OUTPUT_DIR, options?: { verbose?: boolean; dryRun?: boolean }) => {
      const verbose = options?.verbose || false;
      const dryRun = options?.dryRun || false;
      try {
        console.log('='.repeat(60));
        console.log('  Brand Logos Dataset Import');
        if (dryRun) {
          console.log('  [DRY RUN MODE - No files will be written]');
        }
        if (verbose) {
          console.log('  [VERBOSE MODE - Detailed logging enabled]');
        }
        console.log('='.repeat(60));

        // Step 1: Validate input paths
        console.log('\n1. Validating input paths...');

        const csvValidation = await validatePath(csvPath, 'file');
        if (!csvValidation.valid) {
          console.error(`\n❌ Error: ${csvValidation.error}`);
          process.exit(1);
        }

        const logosValidation = await validatePath(logosDir, 'directory');
        if (!logosValidation.valid) {
          console.error(`\n❌ Error: ${logosValidation.error}`);
          process.exit(1);
        }

        console.log('✓ CSV file found and readable');
        console.log('✓ Logos directory found and readable');

        // Step 2: Prepare import configuration
        const input: ImportInput = {
          csvPath: path.resolve(csvPath),
          logosDir: path.resolve(logosDir),
          outputDir: path.resolve(outputDir)
        };

        console.log(`\nInput CSV: ${input.csvPath}`);
        console.log(`Logos directory: ${input.logosDir}`);
        console.log(`Output directory: ${input.outputDir}`);

        // Step 3: Execute import
        console.log('\n2. Importing brand data...');
        if (verbose) {
          console.log('Verbose mode enabled - showing detailed progress');
        }
        const startTime = Date.now();
        const results = await importBrands(input);
        const processingTimeMs = Date.now() - startTime;

        // Step 4: Collect successful brands
        const successfulBrands = results
          .filter(r => r.status === 'success' && r.brand)
          .map(r => r.brand!);

        const failedResults = results.filter(r => r.status !== 'success');
        const resultsWithWarnings = results.filter(r => r.warnings && r.warnings.length > 0);

        // Step 5: Write output files (skip if dry run)
        const outputDirectory = input.outputDir || DEFAULT_OUTPUT_DIR;
        const brandsJsonPath = resolvePath(outputDirectory, BRANDS_JSON_FILENAME);
        const logosDestDir = resolvePath(outputDirectory, LOGOS_SUBDIR);

        if (dryRun) {
          console.log('\n3. Skipping file writes (dry run mode)...');
          console.log('Would write:');
          console.log(`  - ${successfulBrands.length} brands to ${brandsJsonPath}`);
          console.log(`  - ${successfulBrands.length} logos to ${logosDestDir}`);
          console.log(`  - Import report to ${resolvePath(outputDirectory, 'import-report.json')}`);
        } else {
          console.log('\n3. Writing output files...');
          await writeBrandsJSON(successfulBrands, brandsJsonPath);

          // Step 6: Copy logo files
          await copyLogoFiles(results, input.logosDir, logosDestDir);

          // Step 7: Generate and write import report
          const report = generateReport(
            input,
            results,
            processingTimeMs,
            { brandsJson: brandsJsonPath, logosDir: logosDestDir }
          );
          await writeReportJSON(report, outputDirectory);
        }

        // Step 7: Display summary
        console.log('\n' + '='.repeat(60));
        console.log('  Import Summary');
        console.log('='.repeat(60));
        console.log(`\n✓ Successfully imported ${successfulBrands.length} brands`);

        if (failedResults.length > 0) {
          console.log(`✗ Failed to import ${failedResults.length} entries`);

          // Group errors by type
          const errorGroups = new Map<string, number>();
          failedResults.forEach(r => {
            const code = r.error?.code || 'unknown';
            errorGroups.set(code, (errorGroups.get(code) || 0) + 1);
          });

          console.log('\nError breakdown:');
          errorGroups.forEach((count, code) => {
            let description = code.replace(/_/g, ' ');

            // Add helpful descriptions for common errors
            if (code === 'file_type_error') {
              description += ' (unsupported formats: EPS, AI, PDF)';
            } else if (code === 'file_not_found') {
              description += ' (logo files missing from directory)';
            }

            console.log(`  - ${count} ${description}`);
          });

          // Show first few errors as examples
          if (verbose) {
            console.log('\nAll errors:');
            failedResults.forEach(r => {
              console.log(`  Line ${r.rowNumber}: ${r.error?.message}`);
              if (r.error?.details) {
                console.log(`    Details: ${r.error.details}`);
              }
            });
          } else {
            console.log('\nSample errors:');
            failedResults.slice(0, 5).forEach(r => {
              console.log(`  Line ${r.rowNumber}: ${r.error?.message}`);
            });

            if (failedResults.length > 5) {
              console.log(`  ... and ${failedResults.length - 5} more errors`);
              console.log('  (use --verbose to see all errors)');
            }
          }

          // Special note for unsupported file types
          const fileTypeErrors = failedResults.filter(r => r.error?.code === 'file_type_error').length;
          if (fileTypeErrors > 0) {
            console.log(`\nℹ Note: ${fileTypeErrors} file(s) were skipped due to unsupported formats.`);
            console.log('  Supported formats: PNG, JPEG, GIF');
            console.log('  Unsupported formats: EPS, AI, PDF, and others');
          }
        }

        // Display warnings if any
        if (resultsWithWarnings.length > 0) {
          console.log(`\n⚠ ${resultsWithWarnings.length} warnings:`);
          if (verbose) {
            resultsWithWarnings.forEach(r => {
              r.warnings?.forEach(w => {
                console.log(`  Line ${r.rowNumber}: ${w}`);
              });
            });
          } else {
            resultsWithWarnings.slice(0, 3).forEach(r => {
              r.warnings?.forEach(w => {
                console.log(`  Line ${r.rowNumber}: ${w}`);
              });
            });
            if (resultsWithWarnings.length > 3) {
              console.log(`  ... and ${resultsWithWarnings.length - 3} more warnings`);
              console.log('  (use --verbose to see all warnings)');
            }
          }
        }

        console.log('\n' + '='.repeat(60));
        if (!dryRun) {
          console.log(`\nOutput files:`);
          console.log(`  - brands.json: ${brandsJsonPath}`);
          console.log(`  - logos/: ${logosDestDir}`);
          console.log(`  - import-report.json: ${resolvePath(outputDirectory, 'import-report.json')}`);
        }
        console.log(dryRun ? '\n✓ Validation complete (dry run)!\n' : '\n✓ Import complete!\n');

        process.exit(0);

      } catch (error) {
        console.error(`\n❌ Fatal error: ${error}`);
        process.exit(1);
      }
    });

  program.parse();
}

// Run CLI
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
