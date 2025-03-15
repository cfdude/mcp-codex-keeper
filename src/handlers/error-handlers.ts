/**
 * Error handling for the documentation server
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { McpError } from '@modelcontextprotocol/sdk/types.js';
import { FileSystemError } from '../utils/fs/index.js';

/**
 * Sets up error handlers for the server
 * @param server - MCP server instance
 */
export function setupErrorHandlers(server: Server): void {
  server.onerror = (error: unknown) => {
    if (error instanceof FileSystemError) {
      console.error('[Storage Error]', error.message, error.cause);
    } else if (error instanceof McpError) {
      console.error('[MCP Error]', error.message);
    } else {
      console.error('[Unexpected Error]', error);
    }
  };

  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });
}