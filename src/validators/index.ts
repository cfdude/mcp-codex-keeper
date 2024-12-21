import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import {
  DocCategory,
  AddDocArgs,
  UpdateDocArgs,
  SearchDocArgs,
  InvalidDocUrlError,
} from '../types/index.js';

/**
 * Validates if a value is a valid DocCategory
 * @param category - Value to check
 * @returns Type guard for DocCategory
 */
export function isValidCategory(category: unknown): category is DocCategory {
  return (
    typeof category === 'string' &&
    [
      'Languages',
      'Frameworks',
      'Libraries',
      'Tools',
      'APIs',
      'Guides',
      'Reference',
      'Standards',
      'Other',
    ].includes(category)
  );
}

/**
 * Validates a URL string
 * @param url - URL to validate
 * @throws {InvalidDocUrlError} If URL is invalid
 */
function validateUrl(url: string): void {
  try {
    new URL(url);
  } catch {
    throw new InvalidDocUrlError(url);
  }
}

/**
 * Validates tags array
 * @param tags - Array of tags to validate
 * @returns Cleaned and validated tags array
 */
function validateTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }
  return tags
    .filter((tag): tag is string => typeof tag === 'string')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
}

/**
 * Validates version string
 * @param version - Version to validate
 * @returns Cleaned version string or undefined
 */
function validateVersion(version: unknown): string | undefined {
  if (typeof version !== 'string') {
    return undefined;
  }
  const cleaned = version.trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Validates arguments for adding documentation
 * @param args - Arguments to validate
 * @throws {McpError} If validation fails
 * @returns Validated AddDocArgs
 */
export function validateAddDocArgs(args: Record<string, unknown>): AddDocArgs {
  // Check required fields
  if (
    typeof args.name !== 'string' ||
    typeof args.url !== 'string' ||
    !isValidCategory(args.category)
  ) {
    throw new McpError(
      ErrorCode.InvalidParams,
      'Invalid parameters: name (string), url (string), and category (valid category) are required'
    );
  }

  // Validate URL format
  validateUrl(args.url);

  // Validate description
  if (args.description !== undefined && typeof args.description !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, 'Description must be a string if provided');
  }

  return {
    name: args.name.trim(),
    url: args.url.trim(),
    description: (args.description as string)?.trim() || '',
    category: args.category,
    tags: validateTags(args.tags),
    version: validateVersion(args.version),
  };
}

/**
 * Validates arguments for updating documentation
 * @param args - Arguments to validate
 * @throws {McpError} If validation fails
 * @returns Validated UpdateDocArgs
 */
export function validateUpdateDocArgs(args: Record<string, unknown>): UpdateDocArgs {
  if (typeof args.name !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, 'Invalid parameters: name (string) is required');
  }

  return {
    name: args.name.trim(),
    force: args.force === true,
  };
}

/**
 * Validates arguments for searching documentation
 * @param args - Arguments to validate
 * @throws {McpError} If validation fails
 * @returns Validated SearchDocArgs
 */
export function validateSearchDocArgs(args: Record<string, unknown>): SearchDocArgs {
  if (typeof args.query !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, 'Invalid parameters: query (string) is required');
  }

  const category = args.category;
  if (category !== undefined && !isValidCategory(category)) {
    throw new McpError(ErrorCode.InvalidParams, 'Invalid category');
  }

  return {
    query: args.query.trim(),
    category: category as DocCategory | undefined,
    tag: typeof args.tag === 'string' ? args.tag.trim() : undefined,
  };
}
