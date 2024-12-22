import { TestServer, ServerResponse } from '../../helpers/test-server.js';
import { createTestEnvironment } from '../../helpers/test-utils.js';

describe('Documentation Server API Integration', () => {
  let server: TestServer;
  let env: { testDir: string; cleanup: () => Promise<void> };

  beforeEach(async () => {
    env = await createTestEnvironment(`docserver-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    server = await TestServer.createTestInstance();
  });

  afterEach(async () => {
    await env.cleanup();
  });

  describe('Documentation Management', () => {
    it('should handle complete documentation lifecycle', async () => {
      // 1. Add documentation
      const addResult = await server.addTestDoc({
        name: 'Test Doc',
        url: 'https://example.com/doc',
        category: 'Base.Standards',
        description: 'Test description',
        tags: ['best-practices', 'principles'],
      });
      expect(addResult.content?.[0].text).toBe('Added documentation: Test Doc');

      // 2. List documentation
      const listResult = await server.listDocumentation({});
      const docs = JSON.parse(listResult.content?.[0].text || '[]');
      expect(docs).toContainEqual(
        expect.objectContaining({
          name: 'Test Doc',
          category: 'Base.Standards',
        })
      );

      // 3. Search documentation
      const searchResult = await server.searchDocumentation({
        query: 'test',
        category: 'Base.Standards',
      });
      const searchDocs = JSON.parse(searchResult.content?.[0].text || '[]');
      expect(searchDocs).toContainEqual(
        expect.objectContaining({
          name: 'Test Doc',
        })
      );

      // 4. Update documentation
      const updateResult = await server.updateDocumentation({
        name: 'Test Doc',
        force: true,
      });
      expect(updateResult.content?.[0].text).toBe('Updated documentation: Test Doc');

      // 5. Remove documentation
      const removeResult = await server.removeDocumentation('Test Doc');
      expect(removeResult.content?.[0].text).toBe('Removed documentation: Test Doc');

      // 6. Verify removal
      const finalListResult = await server.listDocumentation({});
      const finalDocs = JSON.parse(finalListResult.content?.[0].text || '[]');
      expect(finalDocs).not.toContainEqual(
        expect.objectContaining({
          name: 'Test Doc',
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid documentation data', async () => {
      await expect(
        server.addTestDoc({
          name: 'Test Doc',
          url: 'invalid-url',
          category: 'Invalid' as any,
        })
      ).rejects.toThrow();
    });

    it('should handle network errors during update', async () => {
      // Add test doc
      await server.addTestDoc({
        name: 'Test Doc',
        url: 'https://example.com/doc',
        category: 'Base.Standards',
      });

      // Mock network error
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      // Attempt update
      await expect(
        server.updateDocumentation({
          name: 'Test Doc',
          force: true,
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent documentation updates', async () => {
      // Add initial docs with retry logic for concurrent operations
      const docs = ['Doc1', 'Doc2', 'Doc3'];
      
      // Helper function to add or update doc with retry logic
      const addOrUpdateDoc = async (name: string) => {
        try {
          await server.addTestDoc({
            name,
            url: `https://example.com/${name}`,
            category: 'Base.Standards',
          });
        } catch (error: any) {
          if (error.message?.includes('already exists')) {
            await server.updateDocumentation({ name, force: true });
          } else {
            throw error;
          }
        }
      };

      await Promise.all(docs.map(addOrUpdateDoc));

      // Perform concurrent updates
      await Promise.all(
        docs.map(name =>
          server.updateDocumentation({
            name,
            force: true,
          })
        )
      );

      // Verify all docs were updated
      const listResult = await server.listDocumentation({});
      const updatedDocs = JSON.parse(listResult.content?.[0].text || '[]');
      docs.forEach(name => {
        expect(updatedDocs).toContainEqual(
          expect.objectContaining({
            name,
            lastUpdated: expect.any(String),
          })
        );
      });
    });

    it('should handle concurrent searches', async () => {
      // Add test docs
      await Promise.all(
        ['Test1', 'Test2', 'Test3'].map(name =>
          server.addTestDoc({
            name,
            url: `https://example.com/${name}`,
            category: 'Base.Standards',
          })
        )
      );

      // Perform concurrent searches
      const searches = ['Test1', 'Test2', 'Test3'].map(query =>
        server.searchDocumentation({
          query,
          category: 'Base.Standards',
        })
      );

      const results = await Promise.all(searches);
      results.forEach((result: ServerResponse, index: number) => {
        const docs = JSON.parse(result.content?.[0].text || '[]');
        expect(docs).toContainEqual(
          expect.objectContaining({
            name: `Test${index + 1}`,
          })
        );
      });
    });
  });

  describe('Resource Management', () => {
    it('should cleanup resources after removing documentation', async () => {
      // Add doc with resources
      await server.addTestDoc({
        name: 'Resource Test',
        url: 'https://example.com/resource',
        category: 'Base.Standards',
      });

      // Get initial resource count
      const initialResources = await server.listResources();

      // Remove doc
      await server.removeDocumentation('Resource Test');

      // Get final resource count
      const finalResources = await server.listResources();

      // Verify resources were cleaned up
      expect(finalResources.length).toBeLessThan(initialResources.length);
    });

    it('should handle resource updates correctly', async () => {
      // Add doc
      await server.addTestDoc({
        name: 'Update Test',
        url: 'https://example.com/update',
        category: 'Base.Standards',
      });

      // Update with new content
      const mockContent = 'Updated content';
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        text: async () => mockContent,
      } as Response);

      await server.updateDocumentation({
        name: 'Update Test',
        force: true,
      });

      // Verify resource was updated
      const resource = await server.getResource('Update Test');
      expect(resource.content).toBe(mockContent);
    });
  });
});
