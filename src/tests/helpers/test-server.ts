import { jest } from '@jest/globals';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { EventEmitter } from 'events';
import { DocumentationServer } from '../../server.js';
import { DocSource, ValidCategory } from '../../types/index.js';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../../utils/logger.js';

export interface ServerResponse {
  content?: Array<{ type: string; text: string }>;
  headers?: Record<string, string>;
}

export interface ServerRequest {
  params: {
    name?: string;
    arguments?: Record<string, unknown>;
  };
}

export interface ServerHandler {
  (request: ServerRequest): Promise<ServerResponse>;
}

export interface ServerSchema {
  shape?: {
    method?: {
      value?: string;
    };
  };
}

type MockHandler = (schema: ServerSchema, handler: ServerHandler) => Promise<void>;
type MockConnect = () => Promise<void>;
type MockClose = () => Promise<void>;

export interface MockServer {
  setRequestHandler: jest.MockedFunction<MockHandler>;
  connect: jest.MockedFunction<MockConnect>;
  close: jest.MockedFunction<MockClose>;
}

export class TestServer {
  private mockHandlers: Map<string, ServerHandler>;
  private mockServer: MockServer;
  private server: DocumentationServer;
  private resources: Map<string, { content: string; lastUpdated: string }>;

  private constructor(server: DocumentationServer) {
    this.server = server;
    this.mockHandlers = new Map();
    this.resources = new Map();
    
    // Enhanced server cleanup and event handling
    if (server instanceof DocumentationServer) {
      // Set max listeners with safety margin
      const MAX_LISTENERS = 50;
      server.setMaxListeners(MAX_LISTENERS);
      
      // Store original state
      const originalMaxListeners = server.getMaxListeners();
      
      // Create a Map to store original listeners since events can be symbols
      const originalListeners = new Map<string | symbol, Function[]>();
      server.eventNames().forEach(event => {
        originalListeners.set(event, server.listeners(event));
      });
      
      // Add comprehensive cleanup hook
      afterEach(async () => {
        try {
          // First remove all test-specific listeners
          server.eventNames().forEach(event => {
            const originalEventListeners = originalListeners.get(event) || [];
            const currentListeners = server.listeners(event);
            
            // Remove only the listeners that were added during the test
            currentListeners.forEach(listener => {
              if (!originalEventListeners.includes(listener)) {
                server.removeListener(event, listener as (...args: any[]) => void);
              }
            });
          });
          
          // Then perform server cleanup
          if (typeof server.cleanup === 'function') {
            await server.cleanup();
          }
          
          // Reset to original state
          server.setMaxListeners(originalMaxListeners);
          
          // Enhanced cleanup with multiple stages and increased timeout
          await Promise.all([
            // Stage 1: Immediate operations
            new Promise(resolve => setImmediate(resolve)),
            // Stage 2: Short delay for most cleanup operations
            new Promise(resolve => setTimeout(resolve, 500)),
            // Stage 3: Extended wait for stubborn cleanup
            new Promise(resolve => setTimeout(resolve, 2000))
          ]);
          
          // Final verification of cleanup with detailed logging
          const remainingEvents = server.eventNames();
          if (remainingEvents.length > 0) {
            const remainingListenerCounts = remainingEvents.map(event => ({
              event: event.toString(),
              count: server.listeners(event).length
            }));
            
            logger.warn('Some listeners remained after cleanup', {
              component: 'TestServer',
              operation: 'cleanup',
              remainingListenerCounts,
              totalEvents: remainingEvents.length
            });
          }
        } catch (error) {
          logger.error('Failed to cleanup test server', {
            component: 'TestServer',
            operation: 'cleanup',
            error: error instanceof Error ? error : new Error(String(error))
          });
          throw error;
        }
      });
    }

    // Set up MCP protocol handlers
    const listToolsHandler: ServerHandler = async () => ({
      content: [{ type: 'text', text: JSON.stringify([]) }], // Empty array as we don't have tools in test environment
    });

    const listResourcesHandler: ServerHandler = async () => ({
      content: [{ 
        type: 'text', 
        text: JSON.stringify(await this.listResources())
      }],
    });

    const mockServer: MockServer = {
      setRequestHandler: jest.fn(async (schema: ServerSchema, handler: ServerHandler) => {
        const methodName = schema?.shape?.method?.value;
        if (methodName) {
          this.mockHandlers.set(methodName, handler);
        }
      }),
      connect: jest.fn(async () => undefined),
      close: jest.fn(async () => undefined),
    };

    this.mockServer = mockServer;
    this.setMockServer(mockServer as unknown as Server);

    // Register MCP protocol handlers
    mockServer.setRequestHandler({ shape: { method: { value: 'list_tools' } } }, listToolsHandler);
    mockServer.setRequestHandler({ shape: { method: { value: 'list_resources' } } }, listResourcesHandler);
  }

  private setMockServer(mockServer: Server): void {
    // @ts-expect-error: Доступ к protected полю для тестирования
    this.server.server = mockServer;
  }

  static async createTestInstance(): Promise<TestServer> {
    // Create a unique test directory with timestamp and random id
    const testDir = path.join(
      process.cwd(),
      'test-data',
      `test-server-${Date.now()}-${Math.random().toString(36).slice(2)}`
    );
    await fs.mkdir(testDir, { recursive: true });

    // Set environment variables
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      STORAGE_PATH: testDir,
      MCP_ENV: 'local',
      NODE_ENV: 'test', // Ensure test environment for logger
    };

    // Register cleanup for this test directory
    afterEach(async () => {
      try {
        // Ensure all pending operations are complete
        await new Promise(resolve => setImmediate(resolve));
        
        // Clean up server resources first
        if (server instanceof DocumentationServer) {
          await server.cleanup();
        }

        // Clean up test directory with retries
        let retries = 3;
        while (retries > 0) {
          try {
            await fs.rm(testDir, { recursive: true, force: true });
            break;
          } catch (error) {
            if (retries === 1) throw error;
            retries--;
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        // Log cleanup
        logger.debug('Test resources cleaned up', {
          component: 'TestServer',
          operation: 'cleanup',
          testDir
        });
      } catch (error) {
        logger.error('Failed to cleanup test resources', {
          component: 'TestServer',
          operation: 'cleanup',
          error: error instanceof Error ? error : new Error(String(error)),
          testDir
        });
        throw error;
      } finally {
        // Always restore environment and cleanup event emitters
        process.env = originalEnv;
        if (server instanceof EventEmitter) {
          server.removeAllListeners();
        }
      }
    });

    const server = await DocumentationServer.start();
    return new TestServer(server);
  }

  async addTestDoc(doc: Partial<DocSource>): Promise<ServerResponse> {
    const fullDoc: DocSource = {
      name: doc.name || 'Test Doc',
      url: doc.url || 'https://example.com/doc',
      category: (doc.category as ValidCategory) || 'Base.Standards',
      description: doc.description || 'Test description',
      tags: doc.tags || ['test'],
      ...doc,
    };
    await (this.server as any).addDocumentation(fullDoc);
    return {
      content: [{ type: 'text', text: `Added documentation: ${fullDoc.name}` }],
    };
  }

  getStoragePath(): string {
    // @ts-expect-error: Доступ к protected полю для тестирования
    return this.server.fsManager.docsPath;
  }

  getMockHandler(name: string): ServerHandler {
    const handler = this.mockHandlers.get(name);
    if (!handler) {
      throw new Error(`Mock handler not found for: ${name}`);
    }
    return handler;
  }

  getMockServer(): MockServer {
    return this.mockServer;
  }

  getMockCalls(name: string): Array<Parameters<MockHandler>> {
    return this.mockServer.setRequestHandler.mock.calls.filter(
      (call): call is Parameters<MockHandler> =>
        call.length === 2 && call[0]?.shape?.method?.value === name
    );
  }

  getServer(): DocumentationServer {
    return this.server;
  }

  async listDocumentation(options: Record<string, unknown> = {}): Promise<ServerResponse> {
    const docs = await (this.server as any).listDocumentation(options);
    return {
      content: [{ type: 'text', text: JSON.stringify(docs) }],
    };
  }

  async searchDocumentation(options: {
    query: string;
    category?: ValidCategory;
    tag?: string;
  }): Promise<ServerResponse> {
    const docs = await (this.server as any).searchDocumentation(options);
    return {
      content: [{ type: 'text', text: JSON.stringify(docs) }],
    };
  }

  async updateDocumentation(options: { name: string; force?: boolean }): Promise<ServerResponse> {
    await (this.server as any).updateDocumentation(options);
    return {
      content: [{ type: 'text', text: `Updated documentation: ${options.name}` }],
    };
  }

  async removeDocumentation(name: string): Promise<ServerResponse> {
    await (this.server as any).removeDocumentation(name);
    return {
      content: [{ type: 'text', text: `Removed documentation: ${name}` }],
    };
  }

  async listResources(): Promise<Array<{ name: string; content: string }>> {
    return Array.from(this.resources.entries()).map(([name, { content }]) => ({
      name,
      content,
    }));
  }

  async getResource(name: string): Promise<{ content: string; lastUpdated: string }> {
    const resource = this.resources.get(name);
    if (!resource) {
      throw new Error(`Resource not found: ${name}`);
    }
    return resource;
  }
}
