// Import the proper types from SDK
import { Server, ServerOptions } from '@modelcontextprotocol/sdk/server/index.js';
import { ServerCapabilities } from '@modelcontextprotocol/sdk/types.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  Implementation,
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
//import fs from 'fs/promises';
import path from 'path';
import { DocCategory, DocSource } from './types/index.js';
import { FileSystemError, FileSystemManager } from './utils/fs.js';
import {
  isValidCategory,
  validateAddDocArgs,
  validateSearchDocArgs,
  validateUpdateDocArgs,
} from './validators/index.js';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default documentation sources with best practices and essential references
const defaultDocs: DocSource[] = [
  // Core Development Standards
  {
    name: 'SOLID Principles Guide',
    url: 'https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design',
    description: 'Comprehensive guide to SOLID principles in software development',
    category: 'Standards',
    tags: ['solid', 'oop', 'design-principles', 'best-practices'],
  },
  {
    name: 'Design Patterns Catalog',
    url: 'https://refactoring.guru/design-patterns/catalog',
    description: 'Comprehensive catalog of software design patterns with examples',
    category: 'Standards',
    tags: ['design-patterns', 'architecture', 'best-practices', 'oop'],
  },
  {
    name: 'Clean Code Principles',
    url: 'https://gist.github.com/wojteklu/73c6914cc446146b8b533c0988cf8d29',
    description: 'Universal Clean Code principles for any programming language',
    category: 'Standards',
    tags: ['clean-code', 'best-practices', 'code-quality'],
  },
  {
    name: 'Unit Testing Principles',
    url: 'https://martinfowler.com/bliki/UnitTest.html',
    description: "Martin Fowler's guide to unit testing principles and practices",
    category: 'Standards',
    tags: ['testing', 'unit-tests', 'best-practices', 'tdd'],
  },
  {
    name: 'OWASP Top Ten',
    url: 'https://owasp.org/www-project-top-ten/',
    description: 'Top 10 web application security risks and prevention',
    category: 'Standards',
    tags: ['security', 'web', 'owasp', 'best-practices'],
  },
  {
    name: 'Conventional Commits',
    url: 'https://www.conventionalcommits.org/',
    description: 'Specification for standardized commit messages',
    category: 'Standards',
    tags: ['git', 'commits', 'versioning', 'best-practices'],
  },
  {
    name: 'Semantic Versioning',
    url: 'https://semver.org/',
    description: 'Semantic Versioning Specification',
    category: 'Standards',
    tags: ['versioning', 'releases', 'best-practices'],
  },

  // Essential Tools
  {
    name: 'Git Workflow Guide',
    url: 'https://www.atlassian.com/git/tutorials/comparing-workflows',
    description: 'Comprehensive guide to Git workflows and team collaboration',
    category: 'Tools',
    tags: ['git', 'version-control', 'workflow', 'collaboration'],
  },
];

// Server capabilities configuration
const SERVER_CAPABILITIES: ServerCapabilities = {
  tools: {
    list_documentation: true,
    add_documentation: true,
    update_documentation: true,
    search_documentation: true,
    remove_documentation: true,
    update_cache: true,
  },
  resources: {
    'docs://sources': {
      read: true,
      write: false,
    },
  },
  logging: {
    level: 'debug',
  },
};

// Server options configuration
const SERVER_OPTIONS: ServerOptions = {
  capabilities: SERVER_CAPABILITIES,
};

// Server configuration
const SERVER_CONFIG = {
  name: 'mcp-codex-keeper',
  version: '1.1.10',
  description: 'Documentation keeper MCP server',
  capabilities: SERVER_CAPABILITIES
};

// Environment settings from MCP configuration
const ENV = {
  cacheMaxSize: 104857600, // 100MB
  cacheMaxAge: 604800000, // 7 days
  cacheCleanupInterval: 3600000, // 1 hour
  storagePath: 'data', // Default storage path for local development
};

/**
 * Main server class for the documentation keeper
 */
export class DocumentationServer {
  private readonly server: Server;
  private fsManager!: FileSystemManager;
  private docs: DocSource[] = [];
  private readonly isLocal: boolean;
  private readonly storagePath: string;

  constructor() {
    // Set environment variables first
    this.isLocal = process.env.MCP_ENV === 'local';
    
    // Resolve storage path
    if (this.isLocal) {
      const resolvedPath = join(__dirname, '..', ENV.storagePath);
      console.error('Resolved local path:', resolvedPath);
      this.storagePath = resolvedPath;
    } else {
      const resolvedPath = process.env.MCP_STORAGE_PATH || join(process.env.HOME || '', 'mcp-storage');
      console.error('Resolved production path:', resolvedPath);
      this.storagePath = resolvedPath;
    }
    
    // Create server implementation
    const implementation: Implementation = {
      name: SERVER_CONFIG.name,
      version: SERVER_CONFIG.version,
      description: SERVER_CONFIG.description,
    };

    // Initialize server with proper configuration
    this.server = new Server(implementation, SERVER_OPTIONS);
        
    // Log initial configuration
    console.error('Server initialized with storage path:', this.storagePath);
  }

  private async initialize(): Promise<void> {
    try {
      console.error('Initializing server...');
      console.error('Using storage path:', this.storagePath);
      
      // Check if storage path exists
      try {
        const stats = await fs.stat(this.storagePath);
        console.error('Storage path exists:', stats.isDirectory());
      } catch (error) {
        console.error('Storage path does not exist or is inaccessible:', error);
      }

      // Initialize FileSystemManager
      this.fsManager = new FileSystemManager(this.storagePath, {
        maxSize: ENV.cacheMaxSize,
        maxAge: ENV.cacheMaxAge,
        cleanupInterval: ENV.cacheCleanupInterval,
      });

      // Set up filesystem
      await this.fsManager.ensureDirectories();
      
      // Initialize handlers
      this.setupErrorHandlers();
      this.setupResourceHandlers();
      this.setupToolHandlers();

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
      
      console.error('Server initialization complete');
    } catch (error) {
      console.error('Error during server initialization:', error);
      throw new Error(`Failed to initialize server: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  

  /**
   * Get initial documentation state
   * This information will be available in the environment details
   * when the server starts
   */
  private getInitialState(): string {
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

  /**
   * Sets up error handlers for the server
   */
  private setupErrorHandlers(): void {
    this.server.onerror = (error: unknown) => {
      if (error instanceof FileSystemError) {
        console.error('[Storage Error]', error.message, error.cause);
      } else if (error instanceof McpError) {
        console.error('[MCP Error]', error.message);
      } else {
        console.error('[Unexpected Error]', error);
      }
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Sets up tool handlers for the server
   */
  private setupResourceHandlers(): void {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'docs://sources',
          name: 'Documentation Sources',
          description: 'List of all available documentation sources',
          mimeType: 'application/json',
        },
      ],
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async request => {
      if (request.params.uri === 'docs://sources') {
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: 'application/json',
              text: JSON.stringify(this.docs, null, 2),
            },
          ],
        };
      }
      throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${request.params.uri}`);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_documentation',
          description:
            'List all available documentation sources. Use this tool to discover relevant documentation before starting tasks to ensure best practices and standards compliance.',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Filter documentation by category',
              },
              tag: {
                type: 'string',
                description: 'Filter documentation by tag',
              },
            },
          },
        },
        {
          name: 'update_cache',
          description:
            'Update the documentation cache to ensure all documentation is searchable. Use this after adding or updating documentation, especially when performing bulk operations.',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Optional name of specific documentation to update. If not provided, all documentation will be updated.',
              },
              force: {
                type: 'boolean',
                description: 'Force update even if recently updated',
              },
            },
          },
        },
        {
          name: 'add_documentation',
          description:
            'Add a new documentation source. When working on tasks, add any useful documentation you discover to help maintain a comprehensive knowledge base.',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the documentation',
              },
              url: {
                type: 'string',
                description: 'URL of the documentation',
              },
              description: {
                type: 'string',
                description: 'Description of the documentation',
              },
              category: {
                type: 'string',
                description: 'Category of the documentation',
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Tags for additional categorization',
              },
              version: {
                type: 'string',
                description: 'Version information',
              },
            },
            required: ['name', 'url', 'category'],
          },
        },
        {
          name: 'update_documentation',
          description:
            'Update documentation content from source. Always update relevant documentation before starting a task to ensure you have the latest information and best practices.',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the documentation to update',
              },
              force: {
                type: 'boolean',
                description: 'Force update even if recently updated',
              },
            },
            required: ['name'],
          },
        },
        {
          name: 'search_documentation',
          description:
            'Search through documentation content. Use this to find specific information, best practices, or guidelines relevant to your current task. Remember to check documentation before making important decisions.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query',
              },
              category: {
                type: 'string',
                description: 'Filter by category',
              },
              tag: {
                type: 'string',
                description: 'Filter by tag',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'remove_documentation',
          description:
            'Remove a documentation source. Use this when you no longer need specific documentation.',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the documentation to remove',
              },
            },
            required: ['name'],
          },
        },
      ],
    }));
    console.error('Tool handlers set:', JSON.stringify(SERVER_CAPABILITIES.tools));

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: { params: { name: string; arguments?: Record<string, unknown> } }) => {
        const args = request.params.arguments || {};

        switch (request.params.name) {
          case 'list_documentation':
            return this.listDocumentation({
              category: isValidCategory(args.category) ? args.category : undefined,
              tag: typeof args.tag === 'string' ? args.tag : undefined,
            });
          case 'add_documentation':
            return this.addDocumentation(validateAddDocArgs(args));
          case 'update_documentation':
            return this.updateDocumentation(validateUpdateDocArgs(args));
          case 'search_documentation':
            return this.searchDocumentation(validateSearchDocArgs(args));
          case 'remove_documentation':
            return this.removeDocumentation(args.name as string);
          case 'update_cache':
            return this.updateCache({
              name: typeof args.name === 'string' ? args.name : undefined,
              force: args.force === true,
            });
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      }
    );
  }

  /**
   * Lists documentation sources with optional filtering
   */
  private async listDocumentation(args: { category?: DocCategory; tag?: string }) {
    const { category, tag } = args;
    let filteredDocs = this.docs;

    if (category) {
      filteredDocs = filteredDocs.filter(doc => doc.category === category);
    }

    if (tag) {
      filteredDocs = filteredDocs.filter(doc => doc.tags?.includes(tag));
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(filteredDocs, null, 2),
        },
      ],
    };
  }

  /**
   * Adds new documentation source
   */
  private async addDocumentation(args: DocSource) {
    const { name, url, description, category, tags, version } = args;

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

    if (!this.fsManager) {
      console.error('addDocumentation(): FileSystemManager is not initialized.');
      throw new Error('FileSystemManager is not initialized.');
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
      
      // Create a minimal placeholder content to ensure the document is at least searchable by metadata
      try {
        const placeholderContent = `
          <html>
            <head><title>${name}</title></head>
            <body>
              <h1>${name}</h1>
              <p>${description || 'No description available'}</p>
              <p>Tags: ${tags?.join(', ') || 'None'}</p>
              <p>Category: ${category}</p>
              <p>URL: <a href="${url}">${url}</a></p>
              <p>Note: This is a placeholder. The actual content could not be fetched.</p>
            </body>
          </html>
        `;
        
        await this.fsManager.saveDocumentation(name, placeholderContent);
        console.error(`Created placeholder cache for ${name}`);
        cacheUpdateSuccess = true;
      } catch (saveError) {
        console.error(`Failed to create placeholder for ${name}:`, saveError);
        // Continue even if cache update fails - the document is still added to sources
      }
    }

    return {
      content: [
        {
          type: 'text',
          text:
            existingIndex !== -1
              ? `Updated documentation: ${name}`
              : `Added documentation: ${name}${cacheUpdateSuccess ? '' : ' (Note: Document was added but cache update failed. Use the update_cache tool to make it searchable.)'}`,
        },
      ],
    };
  }

  /**
   * Updates documentation content from source
   */
  private async updateDocumentation(args: { name: string; force?: boolean }) {
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
        return {
          content: [
            {
              type: 'text',
              text: `Documentation "${name}" was recently updated. Use force=true to update anyway.`,
            },
          ],
        };
      }
    }

    try {
      const response = await axios.get(doc.url);
      if (!this.fsManager) {
        console.error('updateDocumentation(): FileSystemManager is not initialized.');
        throw new Error('FileSystemManager is not initialized.');
      }
      await this.fsManager.saveDocumentation(name, response.data);

      doc.lastUpdated = new Date().toISOString();
      await this.fsManager.saveSources(this.docs);

      return {
        content: [
          {
            type: 'text',
            text: `Updated documentation: ${name}`,
          },
        ],
      };
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
   */
  private async updateCache(args: { name?: string; force?: boolean }) {
    try {
      if (!this.fsManager) {
        console.error('updateCache(): FileSystemManager is not initialized.');
        throw new Error('FileSystemManager is not initialized.');
      }
      
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
            return {
              content: [
                {
                  type: 'text',
                  text: `Cache for "${name}" was recently updated. Use force=true to update anyway.`,
                },
              ],
            };
          }
        }
        
        await this.fsManager.updateCache(name);
        
        return {
          content: [
            {
              type: 'text',
              text: `Cache updated for documentation: ${name}`,
            },
          ],
        };
      }
      
      // Update all documents
      const updatedCount = await this.fsManager.updateCache();
      
      return {
        content: [
          {
            type: 'text',
            text: `Cache update completed. Updated ${updatedCount}/${this.docs.length} documents.`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to update cache: ${errorMessage}`
      );
    }
  }

  /**
   * Searches through documentation content with improved scoring
   */
  private async searchDocumentation(args: { query: string; category?: DocCategory; tag?: string }) {
    const { query, category, tag } = args;
    let searchResults = [];

    try {
      if (!this.fsManager) {
        console.error('searchDocumentation(): FileSystemManager failed to initialize. Storage path:', this.storagePath);
        throw new Error('searchDocumentation(): FileSystemManager is not initialized. Did you forget to call initialize()?');
      }
      
      // Filter docs based on category and tag first
      let filteredDocs = this.docs;
      
      if (category) {
        filteredDocs = filteredDocs.filter(doc => doc.category === category);
      }
      
      if (tag) {
        filteredDocs = filteredDocs.filter(doc => doc.tags?.includes(tag));
      }
      
      // Split query into keywords for better matching
      const queryLower = query.toLowerCase();
      const keywords = queryLower.split(/\s+/).filter(kw => kw.length > 1);
      
      // Process each document in the filtered list
      for (const doc of filteredDocs) {
        // Try to search in the document content if it's cached
        const searchResult = await this.fsManager.searchInDocumentation(doc.name, query, doc);
        
        if (searchResult) {
          searchResults.push({
            doc: {
              name: doc.name,
              url: doc.url,
              category: doc.category,
              description: doc.description,
              tags: doc.tags,
              lastUpdated: doc.lastUpdated,
            },
            score: searchResult.score,
            matches: searchResult.matches.slice(0, 3) // Limit to top 3 matches for readability
          });
        } else {
          // If document isn't cached or no content match, still check metadata
          // This ensures newly added documents appear in search results
          const metadataScore = this.calculateMetadataScore(doc, query);
          
          if (metadataScore > 0) {
            searchResults.push({
              doc: {
                name: doc.name,
                url: doc.url,
                category: doc.category,
                description: doc.description,
                tags: doc.tags,
                lastUpdated: doc.lastUpdated,
              },
              score: metadataScore,
              matches: this.generateMetadataMatches(doc, query)
            });
          }
        }
      }

      // Sort results by score (highest first)
      searchResults.sort((a, b) => b.score - a.score);
      
      // Format results for display
      const formattedResults = searchResults.map(result => ({
        name: result.doc.name,
        url: result.doc.url,
        category: result.doc.category,
        description: result.doc.description,
        tags: result.doc.tags,
        relevance_score: result.score,
        match_highlights: result.matches
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(formattedResults, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new McpError(ErrorCode.InternalError, `Search failed: ${errorMessage}`);
    }
  }
  
  /**
   * Calculate metadata score for a document based on search query
   * This is used when document content isn't cached yet
   */
  private calculateMetadataScore(doc: DocSource, query: string): number {
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(/\s+/).filter(kw => kw.length > 1);
    let score = 0;
    
    // Calculate exact phrase match score
    // Exact phrase matches are highly valuable
    if (doc.name.toLowerCase().includes(queryLower)) {
      score += 150; // Exact name match is extremely relevant
    }
    
    if (doc.description.toLowerCase().includes(queryLower)) {
      score += 100; // Exact description match is very relevant
    }
    
    // Calculate keyword match scores
    // This helps with partial matches and multi-word queries
    for (const keyword of keywords) {
      // Name keyword matches (high priority)
      if (doc.name.toLowerCase().includes(keyword)) {
        // Word boundary match is better than substring match
        const wordBoundaryRegex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (wordBoundaryRegex.test(doc.name)) {
          score += 75; // Word boundary match in name
        } else {
          score += 50; // Substring match in name
        }
      }
      
      // Description keyword matches
      if (doc.description.toLowerCase().includes(keyword)) {
        const wordBoundaryRegex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (wordBoundaryRegex.test(doc.description)) {
          score += 40; // Word boundary match in description
        } else {
          score += 25; // Substring match in description
        }
      }
      
      // Category keyword matches
      if (doc.category.toLowerCase().includes(keyword)) {
        score += 30;
      }
    }
    
    // Check tags (very important for relevance)
    if (doc.tags) {
      // Calculate how many query words match across all tags
      const queryWords = new Set(queryLower.split(/\s+/).filter(w => w.length > 1));
      let matchedQueryWords = 0;
      
      for (const tag of doc.tags) {
        // Direct tag match with full query
        if (tag.toLowerCase() === queryLower) {
          score += 200; // Exact tag match is extremely relevant
        }
        
        // Tag contains full query
        else if (tag.toLowerCase().includes(queryLower)) {
          score += 150;
        }
        
        // Normalized tag match (e.g., "vector-database" matches "vector database")
        else if (tag.toLowerCase().replace(/-/g, ' ').includes(queryLower)) {
          score += 150;
        }
        
        // Check for individual query words in tags
        for (const word of queryWords) {
          if (tag.toLowerCase().includes(word) ||
              tag.toLowerCase().replace(/-/g, ' ').includes(word)) {
            matchedQueryWords++;
            break; // Count each query word only once
          }
        }
      }
      
      // Add score based on percentage of query words matched in tags
      if (queryWords.size > 0) {
        const matchPercentage = matchedQueryWords / queryWords.size;
        score += matchPercentage * 100;
      }
    }
    
    return score;
  }
  
  /**
   * Generate metadata match highlights for search results
   */
  private generateMetadataMatches(doc: DocSource, query: string): string[] {
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(/\s+/).filter(kw => kw.length > 1);
    const matches: string[] = [];
    
    // Check name for exact phrase match
    if (doc.name.toLowerCase().includes(queryLower)) {
      matches.push(`Name match: "${doc.name}"`);
    } else {
      // Check for keyword matches in name
      const nameMatches = keywords
        .filter(keyword => doc.name.toLowerCase().includes(keyword))
        .map(keyword => `Name contains "${keyword}"`);
      
      if (nameMatches.length > 0) {
        matches.push(nameMatches[0]); // Add the first keyword match
      }
    }
    
    // Check description for exact phrase match
    if (doc.description.toLowerCase().includes(queryLower)) {
      // Get context around the match
      const matchIndex = doc.description.toLowerCase().indexOf(queryLower);
      const contextStart = Math.max(0, matchIndex - 20);
      const contextEnd = Math.min(doc.description.length, matchIndex + queryLower.length + 20);
      const context = doc.description.substring(contextStart, contextEnd);
      
      matches.push(`Description match: "...${context}..."`);
    } else {
      // Check for keyword matches in description
      for (const keyword of keywords) {
        if (doc.description.toLowerCase().includes(keyword)) {
          const matchIndex = doc.description.toLowerCase().indexOf(keyword);
          const contextStart = Math.max(0, matchIndex - 15);
          const contextEnd = Math.min(doc.description.length, matchIndex + keyword.length + 15);
          const context = doc.description.substring(contextStart, contextEnd);
          
          matches.push(`Description contains "${keyword}": "...${context}..."`);
          break;
        }
      }
    }
    
    // Check tags
    if (doc.tags) {
      // Check for exact query match in tags
      const exactTagMatches = doc.tags.filter(tag =>
        tag.toLowerCase() === queryLower ||
        tag.toLowerCase().replace(/-/g, ' ') === queryLower
      );
      
      if (exactTagMatches.length > 0) {
        matches.push(`Tag exact match: "${exactTagMatches[0]}"`);
      } else {
        // Check for tags containing the query
        const containsTagMatches = doc.tags.filter(tag =>
          tag.toLowerCase().includes(queryLower) ||
          tag.toLowerCase().replace(/-/g, ' ').includes(queryLower)
        );
        
        if (containsTagMatches.length > 0) {
          matches.push(`Tag match: "${containsTagMatches[0]}" contains "${query}"`);
        } else {
          // Check for keyword matches in tags
          for (const tag of doc.tags) {
            for (const keyword of keywords) {
              if (tag.toLowerCase().includes(keyword) ||
                  tag.toLowerCase().replace(/-/g, ' ').includes(keyword)) {
                matches.push(`Tag contains keyword: "${tag}" contains "${keyword}"`);
                break;
              }
            }
          }
        }
      }
    }
    
    return matches;
  }

  /**
   * Starts the server
   */
  async run(): Promise<void> {
    try {
      console.error('\nStarting server...');
      console.error('Environment Configuration:');
      console.error('- MCP_ENV:', process.env.MCP_ENV || 'undefined');
      console.error('- MCP_STORAGE_PATH:', process.env.MCP_STORAGE_PATH || 'undefined');
  
      // Initialize FileSystemManager and server
      await this.initialize();
  
      // Set up transport and start server
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
  
      console.error('MCP server started successfully.');
    } catch (error) {
      console.error('Error during server run:', error);
      throw error;
    }
  }
  

  /**
   * Removes documentation source
   */
  private async removeDocumentation(name: string) {
    const index = this.docs.findIndex(doc => doc.name === name);
    if (index === -1) {
      throw new McpError(ErrorCode.InvalidRequest, `Documentation "${name}" not found`);
    }

    // Remove from memory and storage
    this.docs.splice(index, 1);
    if (!this.fsManager) {
      console.error('removeDocumentation(): FileSystemManager is not initialized.');
      throw new Error('FileSystemManager is not initialized.');
    }
    
    await this.fsManager.saveSources(this.docs);

    return {
      content: [
        {
          type: 'text',
          text: `Removed documentation: ${name}`,
        },
      ],
    };
  }

}