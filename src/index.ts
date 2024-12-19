#!/usr/bin/env node

/**
 * Aindreyway MCP Codex Keeper
 * An intelligent MCP server for managing development documentation and best practices
 *
 * @author aindreyway
 * @license MIT
 */

import { DocumentationServer } from './server.js';

process.on('uncaughtException', error => {
  console.error('[Fatal Error] Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Fatal Error] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const server = new DocumentationServer();

server.run().catch(error => {
  console.error('[Fatal Error] Failed to start server:', error);
  process.exit(1);
});
