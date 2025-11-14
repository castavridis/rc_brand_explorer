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
import { writeBrandsJSON, copyLogoFiles } from '../services/importers/reportGenerator';

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
    .version('1.0.0')
    .action(async (csvPath: string, logosDir: string, outputDir: string = DEFAULT_OUTPUT_DIR) => {
      try {
        console.log('='.repeat(60));
        console.log('  Brand Logos Dataset Import');
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
        const results = await importBrands(input);

        // Step 4: Collect successful brands
        const successfulBrands = results
          .filter(r => r.status === 'success' && r.brand)
          .map(r => r.brand!);

        const failedResults = results.filter(r => r.status !== 'success');

        // Step 5: Write brands.json
        console.log('\n3. Writing output files...');
        const brandsJsonPath = resolvePath(input.outputDir, BRANDS_JSON_FILENAME);
        await writeBrandsJSON(successfulBrands, brandsJsonPath);

        // Step 6: Copy logo files
        const logosDestDir = resolvePath(input.outputDir, LOGOS_SUBDIR);
        await copyLogoFiles(results, input.logosDir, logosDestDir);

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
            console.log(`  - ${count} ${code.replace(/_/g, ' ')}`);
          });

          // Show first few errors as examples
          console.log('\nSample errors:');
          failedResults.slice(0, 3).forEach(r => {
            console.log(`  Line ${r.rowNumber}: ${r.error?.message}`);
          });

          if (failedResults.length > 3) {
            console.log(`  ... and ${failedResults.length - 3} more errors`);
          }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`\nOutput files:`);
        console.log(`  - brands.json: ${brandsJsonPath}`);
        console.log(`  - logos/: ${logosDestDir}`);
        console.log('\n✓ Import complete!\n');

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
