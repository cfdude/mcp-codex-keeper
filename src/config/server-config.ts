/**
 * Server configuration for the documentation keeper
 */
import { ServerCapabilities } from '@modelcontextprotocol/sdk/types.js';
import { ServerOptions } from '@modelcontextprotocol/sdk/server/index.js';

/**
 * Server capabilities configuration
 */
export const SERVER_CAPABILITIES: ServerCapabilities = {
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

/**
 * Server options configuration
 */
export const SERVER_OPTIONS: ServerOptions = {
  capabilities: SERVER_CAPABILITIES,
};

/**
 * Server configuration
 */
export const SERVER_CONFIG = {
  name: 'mcp-codex-keeper',
  version: '2.0.0',
  description: 'Documentation keeper MCP server',
  capabilities: SERVER_CAPABILITIES
};