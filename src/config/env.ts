/**
 * Environment configuration for the documentation keeper
 */
import path from 'path';

/**
 * Environment settings from MCP configuration
 */
export const ENV = {
  cacheMaxSize: 104857600, // 100MB
  cacheMaxAge: 604800000, // 7 days
  cacheCleanupInterval: 3600000, // 1 hour
  storagePath: 'data', // Default storage path for local development
};

/**
 * Determines if the server is running in local development mode
 */
export function isLocalEnvironment(): boolean {
  return process.env.MCP_ENV === 'local';
}

/**
 * Resolves the storage path based on environment
 * @param dirname - Current directory name
 * @returns Resolved storage path
 */
export function resolveStoragePath(dirname: string): string {
  if (isLocalEnvironment()) {
    const resolvedPath = path.join(dirname, '..', ENV.storagePath);
    console.error('Resolved local path:', resolvedPath);
    return resolvedPath;
  } else {
    const resolvedPath = process.env.MCP_STORAGE_PATH || path.join(process.env.HOME || '', 'mcp-storage');
    console.error('Resolved production path:', resolvedPath);
    return resolvedPath;
  }
}