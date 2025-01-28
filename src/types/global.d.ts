/// <reference types="node" />

declare global {
    namespace NodeJS {
      interface ProcessEnv {
        MCP_ENV?: string;
        NODE_ENV?: string;
        MCP_STORAGE_PATH?: string;
        HOME?: string;
      }
    }
  }
  
  export {};