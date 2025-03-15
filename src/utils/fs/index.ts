/**
 * File system utilities for documentation management
 */

/**
 * Error thrown when file system operations fail
 */
export class FileSystemError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'FileSystemError';
  }
}

// Export all file system utilities
export * from './file-manager.js';
export * from './cache-manager.js';
export * from './search-utils.js';
export * from './file-system-manager.js';