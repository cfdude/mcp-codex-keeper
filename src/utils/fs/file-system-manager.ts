/**
 * Combined file system manager for documentation storage
 */
import { DocSource } from '../../types/index.js';
import { FileManager } from './file-manager.js';
import { CacheManager, CacheConfig } from './cache-manager.js';
import { SearchUtils, SearchResult } from './search-utils.js';
import { FileSystemError } from './index.js';

/**
 * Manages file system operations for documentation storage
 * Combines file management, caching, and search functionality
 */
export class FileSystemManager {
  private fileManager: FileManager;
  private cacheManager: CacheManager;
  private searchUtils: SearchUtils;

  /**
   * Creates a new FileSystemManager instance
   * @param basePath - Base path for storing documentation
   * @param cacheConfig - Cache configuration
   */
  constructor(
    basePath: string,
    cacheConfig: CacheConfig = {
      maxSize: 100 * 1024 * 1024, // 100MB
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      cleanupInterval: 60 * 60 * 1000, // 1 hour
    }
  ) {
    try {
      console.error('Initializing FileSystemManager...');
      
      // Initialize components
      this.fileManager = new FileManager(basePath);
      this.cacheManager = new CacheManager(this.fileManager, cacheConfig);
      this.searchUtils = new SearchUtils(this.fileManager);
      
      console.error('FileSystemManager initialized successfully.');
    } catch (error) {
      console.error('Error initializing FileSystemManager:', error);
      throw new FileSystemError('Failed to initialize FileSystemManager', error);
    }
  }

  /**
   * Ensures required directories exist
   * @throws {FileSystemError} If directory creation fails
   */
  async ensureDirectories(): Promise<void> {
    return this.fileManager.ensureDirectories();
  }

  /**
   * Saves documentation content to cache
   * @param name - Documentation name
   * @param content - Content to save
   * @throws {FileSystemError} If save operation fails
   */
  async saveDocumentation(name: string, content: string): Promise<void> {
    return this.fileManager.saveDocumentation(name, content);
  }

  /**
   * Saves documentation sources metadata
   * @param docs - Array of documentation sources
   * @throws {FileSystemError} If save operation fails
   */
  async saveSources(docs: DocSource[]): Promise<void> {
    return this.fileManager.saveSources(docs);
  }

  /**
   * Loads documentation sources metadata
   * @returns Array of documentation sources
   * @throws {FileSystemError} If load operation fails
   */
  async loadSources(): Promise<DocSource[]> {
    return this.fileManager.loadSources();
  }

  /**
   * Searches for text in cached documentation
   * @param name - Documentation name
   * @param searchQuery - Text to search for
   * @param doc - Optional document metadata for scoring
   * @returns Score object with match details or null if no match
   */
  async searchInDocumentation(
    name: string,
    searchQuery: string,
    doc?: DocSource
  ): Promise<SearchResult | null> {
    return this.searchUtils.searchInDocumentation(name, searchQuery, doc);
  }

  /**
   * Calculate metadata score for a document based on search query
   * @param doc - Document to score
   * @param query - Search query
   * @returns Score value
   */
  calculateMetadataScore(doc: DocSource, query: string): number {
    return this.searchUtils.calculateMetadataScore(doc, query);
  }

  /**
   * Generate metadata match highlights for search results
   * @param doc - Document to generate matches for
   * @param query - Search query
   * @returns Array of match strings
   */
  generateMetadataMatches(doc: DocSource, query: string): string[] {
    return this.searchUtils.generateMetadataMatches(doc, query);
  }

  /**
   * Lists all cached documentation files
   * @returns Array of filenames
   * @throws {FileSystemError} If directory reading fails
   */
  async listDocumentationFiles(): Promise<string[]> {
    return this.fileManager.listDocumentationFiles();
  }

  /**
   * Gets documentation file path
   * @param name - Documentation name
   * @returns Path to documentation file
   */
  getDocumentationPath(name: string): string {
    return this.fileManager.getDocumentationPath(name);
  }

  /**
   * Checks if documentation exists in cache
   * @param name - Documentation name
   * @returns Whether documentation exists
   */
  async hasDocumentation(name: string): Promise<boolean> {
    return this.fileManager.hasDocumentation(name);
  }

  /**
   * Gets base documentation path
   * @returns Base path for documentation storage
   */
  getDocsPath(): string {
    return this.fileManager.getDocsPath();
  }

  /**
   * Gets cache directory path
   * @returns Path to cache directory
   */
  getCachePath(): string {
    return this.fileManager.getCachePath();
  }

  /**
   * Updates cache configuration
   * @param config - New cache configuration
   */
  updateCacheConfig(config: Partial<CacheConfig>): void {
    this.cacheManager.updateCacheConfig(config);
  }

  /**
   * Explicitly updates the cache for all documentation or a specific document
   * @param name - Optional name of specific documentation to update
   * @returns Promise resolving to number of documents updated
   */
  async updateCache(name?: string): Promise<number> {
    const docs = await this.loadSources();
    return this.cacheManager.updateCache(docs, name);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.cacheManager.destroy();
  }
}