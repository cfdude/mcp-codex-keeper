/**
 * Categories for organizing documentation
 * @description Defines all available documentation categories
 */
export type DocCategory =
  | 'Languages' // Programming languages documentation
  | 'Frameworks' // Framework documentation
  | 'Libraries' // Library documentation
  | 'Tools' // Development tools documentation
  | 'APIs' // API documentation
  | 'Guides' // Tutorial and how-to guides
  | 'Reference' // Technical reference documentation
  | 'Standards' // Programming standards and specifications
  | 'Other'; // Other documentation types

/**
 * Documentation source structure
 * @description Represents a documentation source with metadata
 */
export interface DocSource {
  /** Unique name of the documentation source */
  name: string;
  /** URL where the documentation can be found */
  url: string;
  /** Description of what this documentation covers */
  description: string;
  /** Category this documentation belongs to */
  category: DocCategory;
  /** ISO timestamp of last update */
  lastUpdated?: string;
  /** Optional tags for additional categorization */
  tags?: string[];
  /** Optional version information */
  version?: string;
}

/**
 * Arguments for listing documentation
 * @description Parameters for filtering documentation lists
 */
export interface ListDocsArgs {
  /** Optional category filter */
  category?: DocCategory;
  /** Optional tag filter */
  tag?: string;
}

/**
 * Arguments for adding new documentation
 * @description Required and optional fields for adding documentation
 */
export interface AddDocArgs {
  /** Unique name for the documentation */
  name: string;
  /** URL where the documentation can be found */
  url: string;
  /** Description of what this documentation covers */
  description: string;
  /** Category this documentation belongs to */
  category: DocCategory;
  /** Optional tags for additional categorization */
  tags?: string[];
  /** Optional version information */
  version?: string;
}

/**
 * Arguments for updating documentation
 * @description Parameters for updating existing documentation
 */
export interface UpdateDocArgs {
  /** Name of the documentation to update */
  name: string;
  /** Optional force flag to overwrite cache */
  force?: boolean;
}

/**
 * Arguments for searching documentation
 * @description Search parameters and filters
 */
export interface SearchDocArgs {
  /** Search query string */
  query: string;
  /** Optional category filter */
  category?: DocCategory;
  /** Optional tag filter */
  tag?: string;
}

/**
 * Custom error for duplicate documentation
 */
export class DocAlreadyExistsError extends Error {
  constructor(name: string) {
    super(`Documentation with name "${name}" already exists`);
    this.name = 'DocAlreadyExistsError';
  }
}

/**
 * Custom error for missing documentation
 */
export class DocNotFoundError extends Error {
  constructor(name: string) {
    super(`Documentation "${name}" not found`);
    this.name = 'DocNotFoundError';
  }
}

/**
 * Custom error for invalid documentation URL
 */
export class InvalidDocUrlError extends Error {
  constructor(url: string) {
    super(`Invalid documentation URL: "${url}"`);
    this.name = 'InvalidDocUrlError';
  }
}
