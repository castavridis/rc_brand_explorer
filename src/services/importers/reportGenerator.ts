/**
 * Report Generator for import operations
 *
 * Handles output generation including brands.json, logo file copying,
 * and import report JSON files.
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { Brand } from '../../types/brand';
import type { ImportResult } from '../../types/importer';
import { ensureDirectory, resolvePath } from '../../utils/fileSystem';
import { BRANDS_JSON_FILENAME, LOGOS_SUBDIR } from '../../types/importer';

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
