/**
 * Resource handlers for the documentation server
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import { DocSource } from '../types/index.js';

/**
 * Sets up resource handlers for the server
 * @param server - MCP server instance
 * @param getDocSources - Function to get current documentation sources
 */
export function setupResourceHandlers(
  server: Server,
  getDocSources: () => DocSource[]
): void {
  // Handler for listing available resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri: 'docs://sources',
        name: 'Documentation Sources',
        description: 'List of all available documentation sources',
        mimeType: 'application/json',
      },
    ],
  }));

  // Handler for reading resource content
  server.setRequestHandler(ReadResourceRequestSchema, async request => {
    if (request.params.uri === 'docs://sources') {
      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: 'application/json',
            text: JSON.stringify(getDocSources(), null, 2),
          },
        ],
      };
    }
    throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${request.params.uri}`);
  });
}