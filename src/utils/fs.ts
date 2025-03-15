import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { DocSource } from '../types/index.js';
import axios from 'axios';

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
    try {
      console.error('Initializing FileSystemManager...');
      
      this.docsPath = decodeURIComponent(path.resolve(basePath));
      this.sourcesFile = path.join(this.docsPath, 'sources.json');
      this.cacheDir = path.join(this.docsPath, 'cache');
  
      console.error('Resolved paths for FileSystemManager:');
      console.error('- Base path:', this.docsPath);
      console.error('- Sources file:', this.sourcesFile);
      console.error('- Cache directory:', this.cacheDir);
  
      // Validate and create directories if they don't exist
      fs.mkdir(this.docsPath, { recursive: true }).catch(error => {
        console.error('Failed to create docs path:', error);
        throw new FileSystemError('Failed to create docs path', error);
      });
  
      fs.mkdir(this.cacheDir, { recursive: true }).catch(error => {
        console.error('Failed to create cache directory:', error);
        throw new FileSystemError('Failed to create cache directory', error);
      });
  
      // Use cache configuration and start cleanup timer
      this.cacheConfig = cacheConfig;
      this.startCleanupTimer();
      console.error('FileSystemManager initialized successfully.');
    } catch (error) {
      console.error('Error initializing FileSystemManager:', error);
      throw new FileSystemError('Failed to initialize FileSystemManager', error);
    }
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
   * Searches for text in cached documentation with advanced scoring
   * @param name - Documentation name
   * @param searchQuery - Text to search for
   * @param doc - Optional document metadata for scoring
   * @returns Score object with match details or null if no match
   */
  async searchInDocumentation(
    name: string,
    searchQuery: string,
    doc?: DocSource
  ): Promise<{ score: number; matches: string[] } | null> {
    try {
      const filename = this.getDocumentationFileName(name);
      const filePath = path.join(this.cacheDir, filename);

      // Split search query into keywords
      const keywords = searchQuery.toLowerCase()
        .split(/\s+/)
        .filter(kw => kw.length > 1); // Filter out single-character words
      
      if (keywords.length === 0) {
        return null;
      }

      // Check if file exists
      let fileExists = false;
      try {
        await fs.access(filePath);
        fileExists = true;
      } catch {
        // File doesn't exist, but we'll still check metadata
        fileExists = false;
      }

      let totalScore = 0;
      const matches: string[] = [];
      
      // If file exists, search content
      if (fileExists) {
        try {
          // Read content
          const content = await fs.readFile(filePath, 'utf-8');
          const contentLower = content.toLowerCase();
          
          const matchedKeywords = new Set<string>();
          
          // Check for exact phrase match first (highest score)
          const exactPhraseScore = 100;
          if (contentLower.includes(searchQuery.toLowerCase())) {
            totalScore += exactPhraseScore;
            
            // Extract context around the exact match
            const matchIndex = contentLower.indexOf(searchQuery.toLowerCase());
            const contextStart = Math.max(0, matchIndex - 50);
            const contextEnd = Math.min(content.length, matchIndex + searchQuery.length + 50);
            const matchContext = content.substring(contextStart, contextEnd).trim();
            
            matches.push(`Exact match: "${matchContext}"`);
          }
          
          // Check for individual keyword matches
          for (const keyword of keywords) {
            if (contentLower.includes(keyword)) {
              matchedKeywords.add(keyword);
              
              // Find a representative match for this keyword
              const matchIndex = contentLower.indexOf(keyword);
              const contextStart = Math.max(0, matchIndex - 30);
              const contextEnd = Math.min(content.length, matchIndex + keyword.length + 30);
              const matchContext = content.substring(contextStart, contextEnd).trim();
              
              if (!matches.some(m => m.includes(matchContext))) {
                matches.push(`Keyword match (${keyword}): "${matchContext}"`);
              }
            }
          }
          
          // Calculate keyword match score
          const keywordMatchScore = (matchedKeywords.size / keywords.length) * 50;
          totalScore += keywordMatchScore;
        } catch (readError) {
          console.error(`Error reading file ${filePath}:`, readError);
          // Continue to metadata matching even if file read fails
        }
      }
      
      // Add metadata matching score if document metadata is provided
      if (doc) {
        let metadataScore = 0;
        const metadataMatches: string[] = [];
        
        // Check name (higher weight than before)
        if (doc.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          metadataScore += 50;
          metadataMatches.push(`Name match: "${doc.name}"`);
        }
        
        // Check description (higher weight than before)
        if (doc.description.toLowerCase().includes(searchQuery.toLowerCase())) {
          metadataScore += 40;
          metadataMatches.push(`Description match: "${doc.description}"`);
        }
        
        // Check category
        if (doc.category.toLowerCase().includes(searchQuery.toLowerCase())) {
          metadataScore += 20;
          metadataMatches.push(`Category match: "${doc.category}"`);
        }
        
        // Check tags (higher weight for tags)
        if (doc.tags) {
          // Check for exact tag matches
          for (const tag of doc.tags) {
            // Check if any keyword is part of the tag
            for (const keyword of keywords) {
              if (tag.toLowerCase().includes(keyword)) {
                metadataScore += 33.33;
                metadataMatches.push(`Tag match: "${tag}" contains "${keyword}"`);
                break;
              }
            }
            
            // Check if the tag is a hyphenated version of the search query
            // e.g., "vector database" matches "vector-database"
            const normalizedTag = tag.toLowerCase().replace(/-/g, ' ');
            if (normalizedTag.includes(searchQuery.toLowerCase())) {
              metadataScore += 50;
              metadataMatches.push(`Tag normalized match: "${tag}" matches "${searchQuery}"`);
            }
          }
        }
        
        totalScore += metadataScore;
        matches.push(...metadataMatches);
      }
      
      // Return null if no matches found
      if (totalScore === 0) {
        return null;
      }
      
      return {
        score: totalScore,
        matches: matches
      };
    } catch (error) {
      console.error(`Error in searchInDocumentation for ${name}:`, error);
      
      // Even if there's an error, still try to match metadata if document is provided
      if (doc) {
        const metadataScore = this.calculateMetadataOnlyScore(doc, searchQuery);
        if (metadataScore > 0) {
          return {
            score: metadataScore,
            matches: this.generateMetadataOnlyMatches(doc, searchQuery)
          };
        }
      }
      
      return null;
    }
  }
  
  /**
   * Calculate metadata-only score for a document
   * Used as a fallback when file access fails
   */
  private calculateMetadataOnlyScore(doc: DocSource, searchQuery: string): number {
    const queryLower = searchQuery.toLowerCase();
    const keywords = queryLower.split(/\s+/).filter(kw => kw.length > 1);
    let score = 0;
    
    // Check name
    if (doc.name.toLowerCase().includes(queryLower)) {
      score += 50;
    }
    
    // Check description
    if (doc.description.toLowerCase().includes(queryLower)) {
      score += 40;
    }
    
    // Check category
    if (doc.category.toLowerCase().includes(queryLower)) {
      score += 20;
    }
    
    // Check tags
    if (doc.tags) {
      for (const tag of doc.tags) {
        if (tag.toLowerCase().includes(queryLower) ||
            tag.toLowerCase().replace(/-/g, ' ').includes(queryLower)) {
          score += 50;
        }
        
        for (const keyword of keywords) {
          if (tag.toLowerCase().includes(keyword)) {
            score += 25;
          }
        }
      }
    }
    
    return score;
  }
  
  /**
   * Generate metadata-only matches for search results
   * Used as a fallback when file access fails
   */
  private generateMetadataOnlyMatches(doc: DocSource, searchQuery: string): string[] {
    const queryLower = searchQuery.toLowerCase();
    const matches: string[] = [];
    
    // Check name
    if (doc.name.toLowerCase().includes(queryLower)) {
      matches.push(`Name match: "${doc.name}"`);
    }
    
    // Check description
    if (doc.description.toLowerCase().includes(queryLower)) {
      matches.push(`Description match: "${doc.description}"`);
    }
    
    // Check category
    if (doc.category.toLowerCase().includes(queryLower)) {
      matches.push(`Category match: "${doc.category}"`);
    }
    
    // Check tags
    if (doc.tags) {
      for (const tag of doc.tags) {
        if (tag.toLowerCase().includes(queryLower) ||
            tag.toLowerCase().replace(/-/g, ' ').includes(queryLower)) {
          matches.push(`Tag match: "${tag}"`);
        }
      }
    }
    
    return matches;
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
 * Explicitly updates the cache for all documentation or a specific document
 * This ensures that newly added or updated documentation is immediately searchable
 * @param name - Optional name of specific documentation to update
 * @returns Promise resolving to number of documents updated
 */
async updateCache(name?: string): Promise<number> {
  try {
    console.error(`Updating cache${name ? ` for ${name}` : ' for all documents'}`);
    
    // If a specific document is specified, only update that one
    if (name) {
      const doc = await this.loadSources().then(docs =>
        docs.find(d => d.name === name)
      );
      
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
        
        await this.saveDocumentation(name, response.data);
        console.error(`Cache updated for document: ${name}`);
        return 1;
      } catch (error) {
        console.error(`Failed to update cache for ${name}:`, error);
        // Create a minimal placeholder content to ensure the document is at least searchable by metadata
        const placeholderContent = `
          <html>
            <head><title>${name}</title></head>
            <body>
              <h1>${name}</h1>
              <p>${doc.description || 'No description available'}</p>
              <p>Tags: ${doc.tags?.join(', ') || 'None'}</p>
              <p>Category: ${doc.category}</p>
              <p>URL: <a href="${doc.url}">${doc.url}</a></p>
              <p>Note: This is a placeholder. The actual content could not be fetched.</p>
            </body>
          </html>
        `;
        
        try {
          await this.saveDocumentation(name, placeholderContent);
          console.error(`Created placeholder cache for ${name}`);
          return 1;
        } catch (saveError) {
          console.error(`Failed to create placeholder for ${name}:`, saveError);
          return 0;
        }
      }
    }
    
    // Otherwise update all documents
    const docs = await this.loadSources();
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
            
            await this.saveDocumentation(doc.name, response.data);
            console.error(`Cache updated for document: ${doc.name}`);
            return true;
          } catch (error) {
            console.error(`Failed to update cache for ${doc.name}:`, error);
            
            // Create a minimal placeholder content
            const placeholderContent = `
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
            
            try {
              await this.saveDocumentation(doc.name, placeholderContent);
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
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}
