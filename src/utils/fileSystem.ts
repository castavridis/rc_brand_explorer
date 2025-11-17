/**
 * File system utility functions for the import process
 *
 * Provides cross-platform file and directory operations including existence checks,
 * readability validation, and directory creation.
 */

import { promises as fs } from 'fs';
import { access, constants } from 'fs';
import { promisify } from 'util';
import path from 'path';

const accessAsync = promisify(access);

/**
 * Check if a file or directory exists
 *
 * @param filePath - Path to check
 * @returns True if the path exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await accessAsync(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a file is readable
 *
 * @param filePath - Path to check
 * @returns True if the file is readable
 */
export async function isReadable(filePath: string): Promise<boolean> {
  try {
    await accessAsync(filePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a directory is writable
 *
 * @param dirPath - Directory path to check
 * @returns True if the directory is writable
 */
export async function isWritable(dirPath: string): Promise<boolean> {
  try {
    await accessAsync(dirPath, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a path is a directory
 *
 * @param dirPath - Path to check
 * @returns True if the path is a directory
 */
export async function isDirectory(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Ensure a directory exists, creating it if necessary
 *
 * @param dirPath - Directory path to ensure
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error}`);
  }
}

/**
 * Get file size in bytes
 *
 * @param filePath - Path to file
 * @returns File size in bytes
 */
export async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    throw new Error(`Failed to get file size for ${filePath}: ${error}`);
  }
}

/**
 * Validate file path for import operations
 *
 * @param filePath - Path to validate
 * @param type - Type of path ('file' or 'directory')
 * @returns Validation result with error message if invalid
 */
export async function validatePath(
  filePath: string,
  type: 'file' | 'directory'
): Promise<{ valid: boolean; error?: string }> {
  // Check existence
  const exists = await fileExists(filePath);
  if (!exists) {
    return {
      valid: false,
      error: `${type === 'file' ? 'File' : 'Directory'} not found: ${filePath}`
    };
  }

  // Check type
  if (type === 'directory') {
    const isDir = await isDirectory(filePath);
    if (!isDir) {
      return {
        valid: false,
        error: `Path is not a directory: ${filePath}`
      };
    }
  } else {
    const isDir = await isDirectory(filePath);
    if (isDir) {
      return {
        valid: false,
        error: `Path is a directory, not a file: ${filePath}`
      };
    }
  }

  // Check readability
  const readable = await isReadable(filePath);
  if (!readable) {
    return {
      valid: false,
      error: `${type === 'file' ? 'File' : 'Directory'} is not readable: ${filePath}`
    };
  }

  return { valid: true };
}

/**
 * Resolve a file path relative to a base directory
 *
 * @param basePath - Base directory path
 * @param relativePath - Relative file path
 * @returns Absolute resolved path
 */
export function resolvePath(basePath: string, relativePath: string): string {
  return path.resolve(basePath, relativePath);
}

/**
 * Get file extension (without dot)
 *
 * @param filePath - File path
 * @returns File extension in lowercase (e.g., 'png', 'jpg')
 */
export function getFileExtension(filePath: string): string {
  const ext = path.extname(filePath);
  return ext.toLowerCase().replace('.', '');
}
