import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import path from 'path';
import { DocCategory, DocSource } from './types/index.js';
import { FileSystemError, FileSystemManager } from './utils/fs.js';
import {
  isValidCategory,
  validateAddDocArgs,
  validateSearchDocArgs,
  validateUpdateDocArgs,
} from './validators/index.js';

// Default documentation sources with best practices and essential references
const defaultDocs: DocSource[] = [
  {
    name: 'TypeScript SDK Documentation',
    url: 'https://github.com/modelcontextprotocol/typescript-sdk/blob/main/README.md',
    description: 'Official TypeScript SDK for MCP development',
    category: 'MCP',
    tags: ['sdk', 'typescript', 'mcp'],
  },
  {
    name: 'Kotlin SDK Documentation',
    url: 'https://github.com/modelcontextprotocol/kotlin-sdk/blob/main/README.md',
    description: 'Official Kotlin SDK for MCP, maintained by JetBrains',
    category: 'MCP',
    tags: ['sdk', 'kotlin', 'mcp', 'jetbrains'],
  },
  {
    name: 'React Best Practices',
    url: 'https://react.dev/learn/thinking-in-react',
    description: 'Official React best practices and patterns',
    category: 'Frontend',
    tags: ['react', 'javascript', 'frontend', 'best-practices'],
  },
  {
    name: 'TypeScript Handbook',
    url: 'https://www.typescriptlang.org/docs/handbook/',
    description: 'Official TypeScript documentation and guides',
    category: 'Language',
    tags: ['typescript', 'javascript', 'language'],
  },
];

/**
 * Main server class for the documentation keeper
 */
export class DocumentationServer {
  private server: Server;
  private fsManager: FileSystemManager;
  private docs: DocSource[];

  constructor() {
    this.server = new Server(
      {
        name: 'aindreyway-mcp-codex-keeper',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize file system manager with proper path
    const moduleURL = new URL(import.meta.url);
    const modulePath = path.dirname(moduleURL.pathname);
    this.fsManager = new FileSystemManager(path.join(modulePath, '..', 'data'));
    this.docs = defaultDocs;

    this.setupToolHandlers();
    this.setupErrorHandlers();
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
  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_documentation',
          description: 'List all available documentation sources',
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
          description: 'Add a new documentation source',
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
          description: 'Update documentation content from source',
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
          description: 'Search through documentation content',
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
      ],
    }));

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

    if (this.docs.some(doc => doc.name === name)) {
      throw new McpError(ErrorCode.InvalidRequest, `Documentation "${name}" already exists`);
    }

    const newDoc: DocSource = {
      name,
      url,
      description,
      category,
      tags,
      version,
      lastUpdated: new Date().toISOString(),
    };

    this.docs.push(newDoc);
    await this.fsManager.saveSources(this.docs);

    return {
      content: [
        {
          type: 'text',
          text: `Added documentation: ${name}`,
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
  async run() {
    await this.fsManager.ensureDirectories();

    try {
      const savedDocs = await this.fsManager.loadSources();
      if (savedDocs.length > 0) {
        this.docs = savedDocs;
      } else {
        await this.fsManager.saveSources(this.docs);
      }
    } catch (error) {
      console.error('Failed to load saved documentation sources:', error);
      await this.fsManager.saveSources(this.docs);
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Documentation MCP server running on stdio');
  }
}
