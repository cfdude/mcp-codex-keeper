/**
 * Cache management for documentation files
 */
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { FileSystemError } from './index.js';
import { FileManager } from './file-manager.js';
import { DocSource } from '../../types/index.js';

/**
 * Configuration for cache management
 */
export interface CacheConfig {
  maxSize: number; // Maximum cache size in bytes (default: 100MB)
  maxAge: number; // Maximum age of cache files in milliseconds (default: 7 days)
  cleanupInterval: number; // Cleanup interval in milliseconds (default: 1 hour)
}

/**
 * Manages cache operations for documentation storage
 */
export class CacheManager {
  private fileManager: FileManager;
  private cacheConfig: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  /**
   * Creates a new CacheManager instance
   * @param fileManager - FileManager instance
   * @param cacheConfig - Cache configuration
   */
  constructor(
    fileManager: FileManager,
    cacheConfig: CacheConfig = {
      maxSize: 100 * 1024 * 1024, // 100MB
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      cleanupInterval: 60 * 60 * 1000, // 1 hour
    }
  ) {
    this.fileManager = fileManager;
    this.cacheConfig = cacheConfig;
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
      const cacheDir = this.fileManager.getCachePath();
      const files = await fs.readdir(cacheDir);
      const now = Date.now();
      let totalSize = 0;

      // Get file stats and sort by access time
      const fileStats = await Promise.all(
        files.map(async file => {
          const filePath = path.join(cacheDir, file);
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
   * Updates cache configuration
   * @param config - New cache configuration
   */
  updateCacheConfig(config: Partial<CacheConfig>): void {
    this.cacheConfig = { ...this.cacheConfig, ...config };
    this.startCleanupTimer(); // Restart timer with new interval
  }

  /**
   * Explicitly updates the cache for all documentation or a specific document
   * This ensures that newly added or updated documentation is immediately searchable
   * @param docs - Array of all documentation sources
   * @param name - Optional name of specific documentation to update
   * @returns Promise resolving to number of documents updated
   */
  async updateCache(docs: DocSource[], name?: string): Promise<number> {
    try {
      console.error(`Updating cache${name ? ` for ${name}` : ' for all documents'}`);
      
      // If a specific document is specified, only update that one
      if (name) {
        const doc = docs.find(d => d.name === name);
        
        if (!doc) {
          console.error(`Document "${name}" not found for cache update`);
          return 0;
        }
        
        try {
          // Use a timeout to prevent hanging on slow responses
          const response = await axios.get(doc.url, {
            timeout: 10000, // 10 second timeout
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; CodexKeeper/1.0; +https://github.com/onvex-ai/codex-keeper)'
            }
          });
          
          await this.fileManager.saveDocumentation(name, response.data);
          console.error(`Cache updated for document: ${name}`);
          return 1;
        } catch (error) {
          console.error(`Failed to update cache for ${name}:`, error);
          // Create a minimal placeholder content to ensure the document is at least searchable by metadata
          const placeholderContent = this.createPlaceholderContent(doc);
          
          try {
            await this.fileManager.saveDocumentation(name, placeholderContent);
            console.error(`Created placeholder cache for ${name}`);
            return 1;
          } catch (saveError) {
            console.error(`Failed to create placeholder for ${name}:`, saveError);
            return 0;
          }
        }
      }
      
      // Otherwise update all documents
      let updatedCount = 0;
      let failedCount = 0;
      
      // Process documents in batches to avoid overwhelming the network
      const batchSize = 5;
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = docs.slice(i, i + batchSize);
        
        // Process batch in parallel
        const results = await Promise.all(
          batch.map(async (doc) => {
            try {
              const response = await axios.get(doc.url, {
                timeout: 10000, // 10 second timeout
                headers: {
                  'User-Agent': 'Mozilla/5.0 (compatible; CodexKeeper/1.0; +https://github.com/onvex-ai/codex-keeper)'
                }
              });
              
              await this.fileManager.saveDocumentation(doc.name, response.data);
              console.error(`Cache updated for document: ${doc.name}`);
              return true;
            } catch (error) {
              console.error(`Failed to update cache for ${doc.name}:`, error);
              
              // Create a minimal placeholder content
              const placeholderContent = this.createPlaceholderContent(doc);
              
              try {
                await this.fileManager.saveDocumentation(doc.name, placeholderContent);
                console.error(`Created placeholder cache for ${doc.name}`);
                return true;
              } catch (saveError) {
                console.error(`Failed to create placeholder for ${doc.name}:`, saveError);
                return false;
              }
            }
          })
        );
        
        // Count successes and failures
        updatedCount += results.filter(Boolean).length;
        failedCount += results.filter(result => !result).length;
      }
      
      console.error(`Cache update completed. Updated ${updatedCount}/${docs.length} documents. Failed: ${failedCount}`);
      return updatedCount;
    } catch (error) {
      console.error('Cache update failed:', error);
      throw new FileSystemError('Failed to update cache', error);
    }
  }

  /**
   * Creates placeholder HTML content for a document
   * @param doc - Document source
   * @returns HTML content
   */
  private createPlaceholderContent(doc: DocSource): string {
    return `
      <html>
        <head><title>${doc.name}</title></head>
        <body>
          <h1>${doc.name}</h1>
          <p>${doc.description || 'No description available'}</p>
          <p>Tags: ${doc.tags?.join(', ') || 'None'}</p>
          <p>Category: ${doc.category}</p>
          <p>URL: <a href="${doc.url}">${doc.url}</a></p>
          <p>Note: This is a placeholder. The actual content could not be fetched.</p>
        </body>
      </html>
    `;
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