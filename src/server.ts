/**
 * Main server implementation for the documentation keeper
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Implementation } from '@modelcontextprotocol/sdk/types.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { 
  SERVER_CONFIG, 
  SERVER_OPTIONS, 
  defaultDocs,
  resolveStoragePath,
  isLocalEnvironment
} from './config/index.js';
import { 
  setupErrorHandlers, 
  setupResourceHandlers, 
  setupToolHandlers 
} from './handlers/index.js';
import { 
  DocumentationService, 
  SearchService 
} from './services/index.js';
import { FileSystemManager } from './utils/fs/index.js';

// Get current directory for path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Main server class for the documentation keeper
 */
export class DocumentationServer {
  private readonly server: Server;
  private fsManager!: FileSystemManager;
  private docService!: DocumentationService;
  private searchService!: SearchService;
  private readonly storagePath: string;

  /**
   * Creates a new DocumentationServer instance
   */
  constructor() {
    // Resolve storage path based on environment
    this.storagePath = resolveStoragePath(__dirname);
    
    // Create server implementation
    const implementation: Implementation = {
      name: SERVER_CONFIG.name,
      version: SERVER_CONFIG.version,
      description: SERVER_CONFIG.description,
    };

    // Initialize server with proper configuration
    this.server = new Server(implementation, SERVER_OPTIONS);
        
    // Log initial configuration
    console.error('Server initialized with storage path:', this.storagePath);
  }

  /**
   * Initializes the server components
   */
  private async initialize(): Promise<void> {
    try {
      console.error('Initializing server...');
      console.error('Using storage path:', this.storagePath);
      
      // Initialize FileSystemManager
      this.fsManager = new FileSystemManager(this.storagePath);
      await this.fsManager.ensureDirectories();
      
      // Initialize services
      this.docService = new DocumentationService(this.fsManager);
      this.searchService = new SearchService(this.fsManager);
      
      // Initialize documentation
      await this.docService.initialize(defaultDocs);
      
      // Initialize handlers
      setupErrorHandlers(this.server);
      setupResourceHandlers(this.server, () => this.docService.getAllDocs());
      setupToolHandlers(this.server, this.docService, this.searchService);
      
      console.error('Server initialization complete');
    } catch (error) {
      console.error('Error during server initialization:', error);
      throw new Error(`Failed to initialize server: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Starts the server
   */
  async run(): Promise<void> {
    try {
      console.error('\nStarting server...');
      console.error('Environment Configuration:');
      console.error('- MCP_ENV:', process.env.MCP_ENV || 'undefined');
      console.error('- MCP_STORAGE_PATH:', process.env.MCP_STORAGE_PATH || 'undefined');
      console.error('- Is Local Environment:', isLocalEnvironment());
  
      // Initialize components
      await this.initialize();
  
      // Set up transport and start server
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
  
      console.error('MCP server started successfully.');
    } catch (error) {
      console.error('Error during server run:', error);
      throw error;
    }
  }
}