/**
 * File Validator for brand logo images
 *
 * Validates logo image files using magic byte detection to identify file types.
 * Supports PNG, JPEG, and GIF formats. Rejects EPS, AI, PDF, and other unsupported formats.
 */

import { promises as fs } from 'fs';
import { fileTypeFromBuffer } from 'file-type';
import type { LogoFile, ImageFileType } from '../../types/importer';
import { SUPPORTED_FORMATS, MAX_FILE_SIZE_WARN } from '../../types/importer';
import { getFileSize } from '../../utils/fileSystem';

/**
 * Detect file type via magic bytes
 *
 * Reads the file header and uses magic byte detection to identify the actual file type,
 * regardless of file extension.
 *
 * @param filePath - Path to file
 * @returns Detected file type
 */
export async function detectFileType(filePath: string): Promise<ImageFileType> {
  try {
    // Read first 4100 bytes (enough for most file type detection)
    const buffer = await fs.readFile(filePath);
    const fileTypeResult = await fileTypeFromBuffer(buffer);

    if (!fileTypeResult) {
      return 'unknown';
    }

    // Map MIME types to our ImageFileType
    const mimeType = fileTypeResult.mime;

    if (mimeType === 'image/png') return 'png';
    if (mimeType === 'image/jpeg') return 'jpeg';
    if (mimeType === 'image/gif') return 'gif';
    if (mimeType === 'application/postscript') return 'eps';
    if (mimeType === 'application/pdf') return 'pdf';

    // Check for Adobe Illustrator (.ai) - often detected as PDF
    if (mimeType === 'application/pdf' && buffer.toString('utf-8', 0, 100).includes('%!PS-Adobe')) {
      return 'ai';
    }

    return 'unknown';
  } catch (error) {
    throw new Error(`Failed to detect file type for ${filePath}: ${error}`);
  }
}

/**
 * Check if file type is supported (PNG, JPEG, GIF only)
 *
 * @param fileType - Detected file type
 * @returns True if supported format
 */
export function isSupportedFormat(fileType: ImageFileType): boolean {
  return SUPPORTED_FORMATS.includes(fileType);
}

/**
 * Validate logo file type and readability
 *
 * Performs comprehensive validation including:
 * - File existence and readability
 * - Magic byte file type detection
 * - Format support check (PNG/JPEG/GIF)
 * - File size warning (>10MB)
 *
 * @param filePath - Full path to logo file
 * @param fileName - Original file name from CSV
 * @returns Logo file metadata with validation result
 */
export async function validateFile(filePath: string, fileName: string): Promise<LogoFile> {
  const result: LogoFile = {
    originalPath: filePath,
    fileName,
    fileType: 'unknown',
    fileSize: 0,
    isValid: false
  };

  try {
    // Get file size
    result.fileSize = await getFileSize(filePath);

    // Detect actual file type
    result.fileType = await detectFileType(filePath);

    // Check if format is supported
    if (!isSupportedFormat(result.fileType)) {
      result.isValid = false;
      result.errorMessage = `Unsupported file format: ${result.fileType.toUpperCase()}. Supported formats: PNG, JPEG, GIF`;
      return result;
    }

    // File is valid
    result.isValid = true;

    // Check file size for warning (non-fatal)
    if (result.fileSize > MAX_FILE_SIZE_WARN) {
      // Warning will be added by caller
    }

    return result;

  } catch (error) {
    result.isValid = false;
    result.errorMessage = `Failed to validate file: ${error}`;
    return result;
  }
}
