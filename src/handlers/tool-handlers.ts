/**
 * Tool handlers for the documentation server
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import { DocumentationService } from '../services/documentation-service.js';
import { SearchService } from '../services/search-service.js';
import {
  isValidCategory,
  validateAddDocArgs,
  validateSearchDocArgs,
  validateUpdateDocArgs,
} from '../validators/index.js';

/**
 * Sets up tool handlers for the server
 * @param server - MCP server instance
 * @param docService - DocumentationService instance
 * @param searchService - SearchService instance
 */
export function setupToolHandlers(
  server: Server,
  docService: DocumentationService,
  searchService: SearchService
): void {
  // Handler for listing available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
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

  // Handler for calling tools
  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: { params: { name: string; arguments?: Record<string, unknown> } }) => {
      const args = request.params.arguments || {};

      switch (request.params.name) {
        case 'list_documentation':
          return handleListDocumentation(docService, {
            category: isValidCategory(args.category) ? args.category : undefined,
            tag: typeof args.tag === 'string' ? args.tag : undefined,
          });
        case 'add_documentation':
          return handleAddDocumentation(docService, validateAddDocArgs(args));
        case 'update_documentation':
          return handleUpdateDocumentation(docService, validateUpdateDocArgs(args));
        case 'search_documentation':
          return handleSearchDocumentation(docService, searchService, validateSearchDocArgs(args));
        case 'remove_documentation':
          return handleRemoveDocumentation(docService, args.name as string);
        case 'update_cache':
          return handleUpdateCache(docService, {
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
 * Handles the list_documentation tool
 */
async function handleListDocumentation(
  docService: DocumentationService,
  args: { category?: string; tag?: string }
) {
  const filteredDocs = docService.listDocumentation({
    category: args.category as any,
    tag: args.tag
  });
  
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
 * Handles the add_documentation tool
 */
async function handleAddDocumentation(docService: DocumentationService, args: any) {
  const result = await docService.addDocumentation(args);
  const existingIndex = docService.getAllDocs().findIndex(doc => doc.name === args.name) !== -1;
  
  return {
    content: [
      {
        type: 'text',
        text:
          existingIndex
            ? `Updated documentation: ${args.name}`
            : `Added documentation: ${args.name}${(result as any).cacheUpdateSuccess === false ? ' (Note: Document was added but cache update failed. Use the update_cache tool to make it searchable.)' : ''}`,
      },
    ],
  };
}

/**
 * Handles the update_documentation tool
 */
async function handleUpdateDocumentation(docService: DocumentationService, args: any) {
  await docService.updateDocumentation(args);
  
  return {
    content: [
      {
        type: 'text',
        text: `Updated documentation: ${args.name}`,
      },
    ],
  };
}

/**
 * Handles the search_documentation tool
 */
async function handleSearchDocumentation(
  docService: DocumentationService,
  searchService: SearchService,
  args: any
) {
  const results = await searchService.searchDocumentation(docService.getAllDocs(), args);
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(results, null, 2),
      },
    ],
  };
}

/**
 * Handles the remove_documentation tool
 */
async function handleRemoveDocumentation(docService: DocumentationService, name: string) {
  await docService.removeDocumentation(name);
  
  return {
    content: [
      {
        type: 'text',
        text: `Removed documentation: ${name}`,
      },
    ],
  };
}

/**
 * Handles the update_cache tool
 */
async function handleUpdateCache(docService: DocumentationService, args: any) {
  const { name, force } = args;
  
  // If a specific document is specified
  if (name) {
    await docService.updateCache({ name, force });
    
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
  const updatedCount = await docService.updateCache({ force });
  
  return {
    content: [
      {
        type: 'text',
        text: `Cache update completed. Updated ${updatedCount}/${docService.getAllDocs().length} documents.`,
      },
    ],
  };
}