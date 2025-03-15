/**
 * Documentation service for managing documentation sources
 */
import { DocSource, DocCategory } from '../types/index.js';
import { FileSystemManager } from '../utils/fs/index.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

/**
 * Service for managing documentation sources and operations
 */
export class DocumentationService {
  private docs: DocSource[] = [];
  private fsManager: FileSystemManager;

  /**
   * Creates a new DocumentationService instance
   * @param fsManager - FileSystemManager instance
   */
  constructor(fsManager: FileSystemManager) {
    this.fsManager = fsManager;
  }

  /**
   * Initializes the service with documentation sources
   * @param defaultDocs - Default documentation sources to use if none exist
   */
  async initialize(defaultDocs: DocSource[]): Promise<void> {
    // Load initial documentation
    const savedDocs = await this.fsManager.loadSources();

    if (savedDocs.length === 0) {
      console.error('No sources found. Saving default documentation...');
      this.docs = [...defaultDocs];
    
      try {
        await this.fsManager.saveSources(this.docs);
        console.error('Default documentation saved successfully.');
      } catch (error) {
        console.error('Failed to save default documentation:', error);
        throw new Error('Initialization failed while saving default documentation.');
      }
    } else {
      this.docs = savedDocs;
      console.error(`Loaded ${savedDocs.length} documentation sources.`);
    }
  }

  /**
   * Gets all documentation sources
   * @returns Array of documentation sources
   */
  getAllDocs(): DocSource[] {
    return this.docs;
  }

  /**
   * Lists documentation sources with optional filtering
   * @param category - Optional category filter
   * @param tag - Optional tag filter
   * @returns Filtered documentation sources
   */
  listDocumentation(args: { category?: DocCategory; tag?: string }): DocSource[] {
    const { category, tag } = args;
    let filteredDocs = this.docs;

    if (category) {
      filteredDocs = filteredDocs.filter(doc => doc.category === category);
    }

    if (tag) {
      filteredDocs = filteredDocs.filter(doc => doc.tags?.includes(tag));
    }

    return filteredDocs;
  }

  /**
   * Adds new documentation source
   * @param doc - Documentation source to add
   * @returns Added or updated documentation source
   */
  async addDocumentation(doc: DocSource): Promise<DocSource> {
    const { name, url, description, category, tags, version } = doc;

    // Find existing doc index
    const existingIndex = this.docs.findIndex(doc => doc.name === name);

    const updatedDoc: DocSource = {
      name,
      url,
      description,
      category,
      tags,
      version,
      lastUpdated: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      // Update existing doc
      this.docs[existingIndex] = updatedDoc;
    } else {
      // Add new doc
      this.docs.push(updatedDoc);
    }
    
    // Save the updated sources list first
    await this.fsManager.saveSources(this.docs);
    
    // Update the cache for this document to make it immediately searchable
    let cacheUpdateSuccess = false;
    try {
      // Try to update the cache
      await this.fsManager.updateCache(name);
      cacheUpdateSuccess = true;
    } catch (error) {
      console.error(`Warning: Failed to update cache for ${name}:`, error);
      cacheUpdateSuccess = false;
    }

    return {
      ...updatedDoc,
      cacheUpdateSuccess
    } as DocSource;
  }

  /**
   * Updates documentation content from source
   * @param name - Documentation name
   * @param force - Whether to force update even if recently updated
   * @returns Updated documentation source
   */
  async updateDocumentation(args: { name: string; force?: boolean }): Promise<DocSource> {
    const { name, force } = args;
    const doc = this.docs.find(d => d.name === name);

    if (!doc) {
      throw new McpError(ErrorCode.InvalidRequest, `Documentation "${name}" not found`);
    }

    // Skip update if recently updated and not forced
    if (!force && doc.lastUpdated) {
      const lastUpdate = new Date(doc.lastUpdated);
      const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
      if (hoursSinceUpdate < 24) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Documentation "${name}" was recently updated. Use force=true to update anyway.`
        );
      }
    }

    try {
      await this.fsManager.updateCache(name);

      doc.lastUpdated = new Date().toISOString();
      await this.fsManager.saveSources(this.docs);

      return doc;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to update documentation: ${errorMessage}`
      );
    }
  }

  /**
   * Updates the documentation cache
   * @param name - Optional name of specific documentation to update
   * @param force - Whether to force update even if recently updated
   * @returns Number of documents updated
   */
  async updateCache(args: { name?: string; force?: boolean }): Promise<number> {
    try {
      const { name, force } = args;
      
      // If a specific document is specified
      if (name) {
        const doc = this.docs.find(d => d.name === name);
        
        if (!doc) {
          throw new McpError(ErrorCode.InvalidRequest, `Documentation "${name}" not found`);
        }
        
        // Skip update if recently updated and not forced
        if (!force && doc.lastUpdated) {
          const lastUpdate = new Date(doc.lastUpdated);
          const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
          if (hoursSinceUpdate < 24) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cache for "${name}" was recently updated. Use force=true to update anyway.`
            );
          }
        }
        
        await this.fsManager.updateCache(name);
        return 1;
      }
      
      // Otherwise update all documents
      return await this.fsManager.updateCache();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to update cache: ${errorMessage}`
      );
    }
  }

  /**
   * Removes documentation source
   * @param name - Documentation name
   * @returns Removed documentation source
   */
  async removeDocumentation(name: string): Promise<string> {
    const index = this.docs.findIndex(doc => doc.name === name);
    if (index === -1) {
      throw new McpError(ErrorCode.InvalidRequest, `Documentation "${name}" not found`);
    }

    // Remove from memory and storage
    this.docs.splice(index, 1);
    await this.fsManager.saveSources(this.docs);

    return name;
  }

  /**
   * Get initial documentation state for display
   * @returns Formatted documentation overview
   */
  getInitialState(): string {
    const categories = [...new Set(this.docs.map(doc => doc.category))];
    let state = 'Documentation Overview:\n\n';

    categories.forEach(category => {
      const docsInCategory = this.docs.filter(doc => doc.category === category);
      state += `${category}:\n`;
      docsInCategory.forEach(doc => {
        state += `- ${doc.name}\n`;
        state += `  ${doc.description}\n`;
        if (doc.tags?.length) {
          state += `  Tags: ${doc.tags.join(', ')}\n`;
        }
        state += '\n';
      });
    });

    return state;
  }
}