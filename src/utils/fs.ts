import fs from 'fs/promises';
import path from 'path';
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
 * Manages file system operations for documentation storage
 */
export class FileSystemManager {
  private docsPath: string;
  private sourcesFile: string;
  private cacheDir: string;

  /**
   * Creates a new FileSystemManager instance
   * @param basePath - Base path for storing documentation
   */
  constructor(basePath: string) {
    this.docsPath = basePath;
    this.sourcesFile = path.join(this.docsPath, 'sources.json');
    this.cacheDir = path.join(this.docsPath, 'cache');
  }

  /**
   * Ensures required directories exist
   * @throws {FileSystemError} If directory creation fails
   */
  async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.docsPath, { recursive: true });
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      throw new FileSystemError('Failed to create required directories', error);
    }
  }

  /**
   * Saves documentation content to cache
   * @param name - Documentation name
   * @param content - Content to save
   * @throws {FileSystemError} If save operation fails
   */
  async saveDocumentation(name: string, content: string): Promise<void> {
    try {
      const filename = this.getDocumentationFileName(name);
      await this.ensureDirectories();
      await fs.writeFile(path.join(this.cacheDir, filename), content);
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
      await this.ensureDirectories();
      await fs.writeFile(this.sourcesFile, JSON.stringify(docs, null, 2));
    } catch (error) {
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
      const content = await fs.readFile(this.sourcesFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw new FileSystemError('Failed to load documentation sources', error);
    }
  }

  /**
   * Searches for text in cached documentation
   * @param name - Documentation name
   * @param searchQuery - Text to search for
   * @returns Whether the text was found
   */
  async searchInDocumentation(name: string, searchQuery: string): Promise<boolean> {
    try {
      const filename = this.getDocumentationFileName(name);
      const content = await fs.readFile(path.join(this.cacheDir, filename), 'utf-8');
      return content.toLowerCase().includes(searchQuery.toLowerCase());
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
}
