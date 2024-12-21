import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { DocSource } from '../types/index.js';

/**
 * Error thrown when file system operations fail
 */
export class FileSystemError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'FileSystemError';
  }
}

/**
 * Configuration for cache management
 */
interface CacheConfig {
  maxSize: number; // Maximum cache size in bytes (default: 100MB)
  maxAge: number; // Maximum age of cache files in milliseconds (default: 7 days)
  cleanupInterval: number; // Cleanup interval in milliseconds (default: 1 hour)
}

/**
 * Manages file system operations for documentation storage
 */
export class FileSystemManager {
  private docsPath: string;
  private sourcesFile: string;
  private cacheDir: string;
  private cacheConfig: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  /**
   * Creates a new FileSystemManager instance
   * @param basePath - Base path for storing documentation
   */
  constructor(
    basePath: string,
    cacheConfig: CacheConfig = {
      maxSize: 100 * 1024 * 1024, // 100MB
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      cleanupInterval: 60 * 60 * 1000, // 1 hour
    }
  ) {
    // Ensure absolute path and decode URL-encoded characters
    this.docsPath = decodeURIComponent(path.resolve(basePath));
    this.sourcesFile = path.join(this.docsPath, 'sources.json');
    this.cacheDir = path.join(this.docsPath, 'cache');

    // Log paths for debugging
    console.error('\nFileSystemManager paths:');
    console.error('- Base path:', this.docsPath);
    console.error('- Sources file:', this.sourcesFile);
    console.error('- Cache directory:', this.cacheDir);
    console.error('- Current working directory:', process.cwd());

    // Use provided cache configuration
    this.cacheConfig = cacheConfig;

    // Start cache cleanup timer
    this.startCleanupTimer();
  }

  /**
   * Starts the cache cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cleanupTimer = setInterval(() => {
      this.cleanupCache().catch(console.error);
    }, this.cacheConfig.cleanupInterval);
  }

  /**
   * Cleans up old cache files
   */
  private async cleanupCache(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      const now = Date.now();
      let totalSize = 0;

      // Get file stats and sort by access time
      const fileStats = await Promise.all(
        files.map(async file => {
          const filePath = path.join(this.cacheDir, file);
          const stats = await fs.stat(filePath);
          return { file, path: filePath, stats };
        })
      );

      fileStats.sort((a, b) => a.stats.atime.getTime() - b.stats.atime.getTime());

      // Remove old files and check total size
      for (const { file, path: filePath, stats } of fileStats) {
        if (stats.mtimeMs < now - this.cacheConfig.maxAge) {
          await fs.unlink(filePath);
          continue;
        }

        totalSize += stats.size;
        if (totalSize > this.cacheConfig.maxSize) {
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }

  /**
   * Ensures required directories exist
   * @throws {FileSystemError} If directory creation fails
   */
  async ensureDirectories(): Promise<void> {
    try {
      console.error('\nEnsuring directories:');
      console.error('- Creating docs path:', this.docsPath);
      await fs.mkdir(this.docsPath, { recursive: true });

      const docsStats = await fs.stat(this.docsPath);
      console.error('- Docs path created:', docsStats.isDirectory());
      console.error('- Docs path permissions:', docsStats.mode.toString(8));

      console.error('- Creating cache dir:', this.cacheDir);
      await fs.mkdir(this.cacheDir, { recursive: true });

      const cacheStats = await fs.stat(this.cacheDir);
      console.error('- Cache dir created:', cacheStats.isDirectory());
      console.error('- Cache dir permissions:', cacheStats.mode.toString(8));

      // Try to write a test file
      const testFile = path.join(this.docsPath, 'test.txt');
      console.error('- Testing write permissions:', testFile);
      try {
        await fs.writeFile(testFile, 'test');
        await fs.unlink(testFile);
        console.error('- Write test successful');
      } catch (error) {
        // Ignore errors when deleting test file
        console.error('- Write test completed with cleanup warning:', error);
      }
    } catch (error) {
      console.error('Failed to ensure directories:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Stack trace:', error.stack);
      }
      throw new FileSystemError('Failed to create required directories', error);
    }
  }

  /**
   * Saves documentation content to cache using streams
   * @param name - Documentation name
   * @param content - Content to save
   * @throws {FileSystemError} If save operation fails
   */
  async saveDocumentation(name: string, content: string): Promise<void> {
    try {
      const filename = this.getDocumentationFileName(name);
      await this.ensureDirectories();

      // Create a readable stream from the content
      const readStream = Readable.from(content);

      // Create a write stream to the file
      const writeStream = createWriteStream(path.join(this.cacheDir, filename), { flags: 'w' });

      // Use pipeline for proper error handling and cleanup
      await pipeline(readStream, writeStream);
    } catch (error) {
      throw new FileSystemError(`Failed to save documentation: ${name}`, error);
    }
  }

  /**
   * Saves documentation sources metadata
   * @param docs - Array of documentation sources
   * @throws {FileSystemError} If save operation fails
   */
  async saveSources(docs: DocSource[]): Promise<void> {
    try {
      console.error('\nSaving sources:');
      console.error('- Path:', this.sourcesFile);
      console.error('- Docs count:', docs.length);
      console.error('- Content:', JSON.stringify(docs, null, 2));

      await this.ensureDirectories();
      console.error('- Directories ensured');

      // Write directly using fs.writeFile
      await fs.writeFile(this.sourcesFile, JSON.stringify(docs, null, 2), { mode: 0o666 });
      console.error('- File written');

      // Verify file was created
      const exists = await fs
        .access(this.sourcesFile)
        .then(() => true)
        .catch(() => false);
      console.error('- File exists:', exists);

      if (exists) {
        const stats = await fs.stat(this.sourcesFile);
        console.error('- File size:', stats.size, 'bytes');
        console.error('- File permissions:', stats.mode.toString(8));
        const content = await fs.readFile(this.sourcesFile, 'utf-8');
        console.error('- File content:', content);
      } else {
        throw new Error('File was not created');
      }
    } catch (error) {
      console.error('Failed to save sources:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      throw new FileSystemError('Failed to save documentation sources', error);
    }
  }

  /**
   * Loads documentation sources metadata
   * @returns Array of documentation sources
   * @throws {FileSystemError} If load operation fails
   */
  async loadSources(): Promise<DocSource[]> {
    try {
      console.error('\nLoading sources:');
      console.error('- Path:', this.sourcesFile);

      await this.ensureDirectories();
      console.error('- Directories ensured');

      const exists = await fs
        .access(this.sourcesFile)
        .then(() => true)
        .catch(() => false);
      console.error('- File exists:', exists);

      if (!exists) {
        console.error('- No sources file found, returning empty array');
        return [];
      }

      const content = await fs.readFile(this.sourcesFile, 'utf-8');
      console.error('- File content length:', content.length);

      const docs = JSON.parse(content);
      console.error('- Parsed docs count:', docs.length);

      return docs;
    } catch (error) {
      console.error('Error loading sources:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  /**
   * Searches for text in cached documentation using streams
   * @param name - Documentation name
   * @param searchQuery - Text to search for
   * @returns Whether the text was found
   */
  async searchInDocumentation(name: string, searchQuery: string): Promise<boolean> {
    try {
      const filename = this.getDocumentationFileName(name);
      const filePath = path.join(this.cacheDir, filename);

      const content = await fs.readFile(filePath, 'utf-8');
      const chunks = content.match(/.{1,1048576}/g) || []; // Split into 1MB chunks

      for (const chunk of chunks) {
        if (chunk.toLowerCase().includes(searchQuery.toLowerCase())) {
          return true;
        }
      }
      return false;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      throw new FileSystemError(`Failed to search documentation: ${name}`, error);
    }
  }

  /**
   * Lists all cached documentation files
   * @returns Array of filenames
   * @throws {FileSystemError} If directory reading fails
   */
  async listDocumentationFiles(): Promise<string[]> {
    try {
      await this.ensureDirectories();
      return fs.readdir(this.cacheDir);
    } catch (error) {
      throw new FileSystemError('Failed to list documentation files', error);
    }
  }

  /**
   * Gets documentation file path
   * @param name - Documentation name
   * @returns Path to documentation file
   */
  getDocumentationPath(name: string): string {
    return path.join(this.cacheDir, this.getDocumentationFileName(name));
  }

  /**
   * Checks if documentation exists in cache
   * @param name - Documentation name
   * @returns Whether documentation exists
   */
  async hasDocumentation(name: string): Promise<boolean> {
    try {
      await fs.access(this.getDocumentationPath(name));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets documentation file name
   * @param name - Documentation name
   * @returns Sanitized file name
   */
  private getDocumentationFileName(name: string): string {
    return `${name.toLowerCase().replace(/\s+/g, '_')}.html`;
  }

  /**
   * Gets base documentation path
   * @returns Base path for documentation storage
   */
  getDocsPath(): string {
    return this.docsPath;
  }

  /**
   * Gets cache directory path
   * @returns Path to cache directory
   */
  getCachePath(): string {
    return this.cacheDir;
  }

  /**
   * Updates cache configuration
   * @param config - New cache configuration
   */
  updateCacheConfig(config: Partial<CacheConfig>): void {
    this.cacheConfig = { ...this.cacheConfig, ...config };
    this.startCleanupTimer(); // Restart timer with new interval
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}
