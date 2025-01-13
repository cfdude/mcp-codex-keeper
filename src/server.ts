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
    console.error('Tool handlers set:', JSON.stringify(SERVER_OPTIONS.capabilities.tools));

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
    
    await this.fsManager.saveSources(this.docs);

    return {
      content: [
        {
          type: 'text',
          text:
            existingIndex !== -1
              ? `Updated documentation: ${name}`
              : `Added documentation: ${name}`,
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
   * Searches through documentation content
   */
  private async searchDocumentation(args: { query: string; category?: DocCategory; tag?: string }) {
    const { query, category, tag } = args;
    let results = [];

    try {
      if (!this.fsManager) {
        console.error('searchDocumentation(): FileSystemManager failed to initialize. Storage path:', this.storagePath);
        throw new Error('searchDocumentation(): FileSystemManager is not initialized. Did you forget to call initialize()?');
      }
      const files = await this.fsManager.listDocumentationFiles();

      for (const file of files) {
        const doc = this.docs.find(
          d => file === `${d.name.toLowerCase().replace(/\s+/g, '_')}.html`
        );

        if (doc) {
          // Apply filters
          if (category && doc.category !== category) continue;
          if (tag && !doc.tags?.includes(tag)) continue;

          // Search content
          const matches = await this.fsManager.searchInDocumentation(doc.name, query);
          if (matches) {
            results.push({
              name: doc.name,
              url: doc.url,
              category: doc.category,
              tags: doc.tags,
              lastUpdated: doc.lastUpdated,
            });
          }
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new McpError(ErrorCode.InternalError, `Search failed: ${errorMessage}`);
    }
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