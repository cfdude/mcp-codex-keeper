import { DocumentationServer } from '../../../server.js';
import { FileSystemManager } from '../../../utils/fs.js';
import { ContentFetcher } from '../../../utils/content-fetcher.js';
import { McpError } from '@modelcontextprotocol/sdk/types.js';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

// Mock MCP SDK
jest.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    setRequestHandler: jest.fn(),
    close: jest.fn(),
  })),
}));

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: jest.fn(),
}));

describe('DocumentationServer', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create temp test directory
    testDir = path.join(
      os.tmpdir(),
      'mcp-codex-keeper-test-' + Math.random().toString(36).slice(2)
    );
    await fs.mkdir(testDir, { recursive: true });

    // Set environment variables for testing
    process.env.MCP_ENV = 'local';
    process.env.STORAGE_PATH = testDir;
  });

  afterEach(async () => {
    // Cleanup
    await fs.rm(testDir, { recursive: true, force: true });
    jest.clearAllMocks();
  });

  describe('Server Initialization', () => {
    it('should initialize server with default documentation when no existing docs', async () => {
      const server = await DocumentationServer.start();
      expect(server).toBeDefined();

      // Check if default docs were loaded
      const docs = await fs.readFile(path.join(testDir, 'sources.json'), 'utf-8');
      const parsedDocs = JSON.parse(docs);
      expect(parsedDocs).toHaveLength(8); // Default docs count
      expect(parsedDocs[0].name).toBe('SOLID Principles Guide');
    });

    it('should use existing documentation if available', async () => {
      // Create existing docs
      const existingDocs = [
        {
          name: 'Test Doc',
          url: 'https://example.com/test',
          category: 'Standards',
          description: 'Test documentation',
        },
      ];

      await fs.mkdir(path.join(testDir, 'metadata'), { recursive: true });
      await fs.writeFile(path.join(testDir, 'sources.json'), JSON.stringify(existingDocs));

      const server = await DocumentationServer.start();
      expect(server).toBeDefined();

      // Check if existing docs were loaded
      const docs = await fs.readFile(path.join(testDir, 'sources.json'), 'utf-8');
      const parsedDocs = JSON.parse(docs);
      expect(parsedDocs).toHaveLength(1);
      expect(parsedDocs[0].name).toBe('Test Doc');
    });
  });

  describe('Documentation Management', () => {
    let server: DocumentationServer;

    beforeEach(async () => {
      server = await DocumentationServer.start();
    });

    it('should add new documentation', async () => {
      const result = await server['addDocumentation']({
        name: 'Test Doc',
        url: 'https://example.com/test',
        category: 'Standards',
        description: 'Test documentation',
      });

      expect(result.content[0].text).toBe('Added documentation: Test Doc');

      // Verify doc was saved
      const docs = await fs.readFile(path.join(testDir, 'sources.json'), 'utf-8');
      const parsedDocs = JSON.parse(docs);
      const addedDoc = parsedDocs.find((doc: any) => doc.name === 'Test Doc');
      expect(addedDoc).toBeDefined();
      expect(addedDoc.url).toBe('https://example.com/test');
    });

    it('should update existing documentation', async () => {
      // First add doc
      await server['addDocumentation']({
        name: 'Test Doc',
        url: 'https://example.com/test',
        category: 'Standards',
        description: 'Test documentation',
      });

      // Then update it
      const result = await server['addDocumentation']({
        name: 'Test Doc',
        url: 'https://example.com/test2',
        category: 'Standards',
        description: 'Updated documentation',
      });

      expect(result.content[0].text).toBe('Updated documentation: Test Doc');

      // Verify doc was updated
      const docs = await fs.readFile(path.join(testDir, 'sources.json'), 'utf-8');
      const parsedDocs = JSON.parse(docs);
      const updatedDoc = parsedDocs.find((doc: any) => doc.name === 'Test Doc');
      expect(updatedDoc.url).toBe('https://example.com/test2');
      expect(updatedDoc.description).toBe('Updated documentation');
    });

    it('should remove documentation', async () => {
      // First add doc
      await server['addDocumentation']({
        name: 'Test Doc',
        url: 'https://example.com/test',
        category: 'Standards',
        description: 'Test documentation',
      });

      // Then remove it
      const result = await server['removeDocumentation']('Test Doc');
      expect(result.content[0].text).toBe('Removed documentation: Test Doc');

      // Verify doc was removed
      const docs = await fs.readFile(path.join(testDir, 'sources.json'), 'utf-8');
      const parsedDocs = JSON.parse(docs);
      const removedDoc = parsedDocs.find((doc: any) => doc.name === 'Test Doc');
      expect(removedDoc).toBeUndefined();
    });
  });

  describe('Search and Filtering', () => {
    let server: DocumentationServer;

    beforeEach(async () => {
      server = await DocumentationServer.start();

      // Add test docs
      await server['addDocumentation']({
        name: 'Test Doc 1',
        url: 'https://example.com/test1',
        category: 'Standards',
        tags: ['test', 'documentation'],
        description: 'Test documentation one',
      });

      await server['addDocumentation']({
        name: 'Test Doc 2',
        url: 'https://example.com/test2',
        category: 'Tools',
        tags: ['test', 'tools'],
        description: 'Test documentation two',
      });
    });

    it('should list documentation with category filter', async () => {
      const result = await server['listDocumentation']({ category: 'Standards' });
      const docs = JSON.parse(result.content[0].text);
      expect(docs).toHaveLength(1);
      expect(docs[0].name).toBe('Test Doc 1');
    });

    it('should list documentation with tag filter', async () => {
      const result = await server['listDocumentation']({ tag: 'tools' });
      const docs = JSON.parse(result.content[0].text);
      expect(docs).toHaveLength(1);
      expect(docs[0].name).toBe('Test Doc 2');
    });

    it('should search documentation content', async () => {
      // Mock FileSystemManager's searchInDocumentation
      const mockSearch = jest
        .spyOn(FileSystemManager.prototype, 'searchInDocumentation')
        .mockResolvedValue([{ line: 1, content: 'test match', context: ['test line'] }]);

      const result = await server['searchDocumentation']({
        query: 'test',
        category: 'Standards',
      });

      const searchResults = JSON.parse(result.content[0].text);
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name).toBe('Test Doc 1');

      mockSearch.mockRestore();
    });
  });

  describe('Error Handling', () => {
    let server: DocumentationServer;

    beforeEach(async () => {
      server = await DocumentationServer.start();
    });

    it('should handle invalid documentation name on remove', async () => {
      await expect(server['removeDocumentation']('NonExistent')).rejects.toThrow(
        'Documentation "NonExistent" not found'
      );
    });

    it('should handle invalid documentation name on update', async () => {
      await expect(server['updateDocumentation']({ name: 'NonExistent' })).rejects.toThrow(
        'Documentation "NonExistent" not found'
      );
    });

    it('should handle fetch errors during update', async () => {
      // Add test doc first
      await server['addDocumentation']({
        name: 'Test Doc',
        url: 'https://example.com/test',
        category: 'Standards',
        description: 'Test documentation',
      });

      // Mock ContentFetcher to throw error
      jest
        .spyOn(ContentFetcher.prototype, 'fetchContent')
        .mockRejectedValue(new Error('Fetch failed'));

      await expect(server['updateDocumentation']({ name: 'Test Doc' })).rejects.toThrow(
        'Failed to update documentation: Fetch failed'
      );
    });
  });
});
