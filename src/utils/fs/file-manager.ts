/**
 * File system operations for managing documentation files
 */
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { DocSource } from '../../types/index.js';
import { FileSystemError } from './index.js';

/**
 * Manages basic file system operations for documentation storage
 */
export class FileManager {
  private docsPath: string;
  private sourcesFile: string;
  private cacheDir: string;

  /**
   * Creates a new FileManager instance
   * @param basePath - Base path for storing documentation
   */
  constructor(basePath: string) {
    try {
      console.error('Initializing FileManager...');
      
      this.docsPath = decodeURIComponent(path.resolve(basePath));
      this.sourcesFile = path.join(this.docsPath, 'sources.json');
      this.cacheDir = path.join(this.docsPath, 'cache');
  
      console.error('Resolved paths for FileManager:');
      console.error('- Base path:', this.docsPath);
      console.error('- Sources file:', this.sourcesFile);
      console.error('- Cache directory:', this.cacheDir);
    } catch (error) {
      console.error('Error initializing FileManager:', error);
      throw new FileSystemError('Failed to initialize FileManager', error);
    }
  }

  /**
   * Ensures required directories exist
   * @throws {FileSystemError} If directory creation fails
   */
  async ensureDirectories(): Promise<void> {
    try {
      console.error('Ensuring directories...');
      console.error('- Docs Path:', this.docsPath);
      console.error('- Cache Dir:', this.cacheDir);
  
      await fs.mkdir(this.docsPath, { recursive: true });
      console.error('Docs path ensured.');
  
      await fs.mkdir(this.cacheDir, { recursive: true });
      console.error('Cache dir ensured.');
    } catch (error) {
      console.error('Failed to ensure directories:', error);
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
    const filename = this.getDocumentationFileName(name);
    const filepath = path.join(this.cacheDir, filename);

    console.error(`Saving documentation to cache: ${filepath}`);
    try {
      // Create a readable stream from the content
      const readableStream = Readable.from([content]);

      // Create a write stream to save the content
      const writeStream = createWriteStream(filepath, { flags: 'w' });

      // Use pipeline for proper error handling during stream operations
      await pipeline(readableStream, writeStream);

      console.error(`File saved successfully: ${filepath}`);
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
  getDocumentationFileName(name: string): string {
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
   * Gets sources file path
   * @returns Path to sources file
   */
  getSourcesFilePath(): string {
    return this.sourcesFile;
  }
}