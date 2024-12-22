# Test Report


## src/tests/unit/utils/external-docs-manager.test.ts


### ❌ Failed Tests

- ExternalDocsManager Document Management should handle multiple versions
  ```
  Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32m"Version [7m2[27m"[39m
Received: [31m"Version [7m1[27m"[39m
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/utils/external-docs-manager.test.ts:102:26)
  ```

- ExternalDocsManager Backup Management should maintain maximum number of backups
  ```
  Error: ENOENT: no such file or directory, scandir '/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/test-data/test-docs-1734874564128/backups'
    at Object.readdir (node:internal/fs/promises:951:18)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/utils/external-docs-manager.test.ts:174:23)
  ```

- ExternalDocsManager Backup Management should handle backup restoration by timestamp
  ```
  Error: ENOENT: no such file or directory, scandir '/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/test-data/test-docs-1734874564825/backups'
    at Object.readdir (node:internal/fs/promises:951:18)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/utils/external-docs-manager.test.ts:188:24)
  ```

- ExternalDocsManager Cache Management should use cache for repeated requests
  ```
  Error: Property `getDocumentContent` does not exist in the provided object
    at ModuleMocker.spyOn (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-mock/build/index.js:731:13)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/utils/external-docs-manager.test.ts:257:34)
  ```

- ExternalDocsManager Cache Management should clear cache on backup restore
  ```
  Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32m"Modified"[39m
Received: [31m"Original"[39m
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/utils/external-docs-manager.test.ts:295:33)
  ```

- ExternalDocsManager Resource Cleanup should cleanup resources properly
  ```
  Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBeDefined[2m()[22m

Received: [31mundefined[39m
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/utils/external-docs-manager.test.ts:354:19)
  ```


### ✅ Passed Tests

- ExternalDocsManager Document Management should save and retrieve documentation
- ExternalDocsManager Document Management should sanitize URLs and content
- ExternalDocsManager Document Management should handle missing documents
- ExternalDocsManager Backup Management should create and restore backups
- ExternalDocsManager Backup Management should handle backup errors gracefully
- ExternalDocsManager Error Handling should handle filesystem errors
- ExternalDocsManager Error Handling should handle invalid URLs
- ExternalDocsManager Error Handling should handle backup restoration errors
## src/tests/integration/api/documentation-server.test.ts


### ❌ Failed Tests

- Documentation Server API Integration Documentation Management should handle complete documentation lifecycle
  ```
  Error: MCP error -32600: Documentation "Test Doc" already exists. Use update_documentation to modify existing documents.
    at DocumentationServer.addDocumentation (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:641:13)
    at TestServer.addTestDoc (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/helpers/test-server.ts:95:32)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/integration/api/documentation-server.test.ts:20:38)
    at Promise.then.completed (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:298:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:231:10)
    at _callCircusTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:316:40)
    at _runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:252:3)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:126:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at run (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:71:3)
    at runAndTransformResultsToJestFormat (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
    at jestAdapter (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
    at runTestInternal (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:367:16)
    at runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:444:34)
  ```

- Documentation Server API Integration Error Handling should handle network errors during update
  ```
  Error: MCP error -32600: Documentation "Test Doc" already exists. Use update_documentation to modify existing documents.
    at DocumentationServer.addDocumentation (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:641:13)
    at TestServer.addTestDoc (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/helpers/test-server.ts:95:32)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/integration/api/documentation-server.test.ts:86:20)
    at Promise.then.completed (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:298:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:231:10)
    at _callCircusTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:316:40)
    at _runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:252:3)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:126:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at run (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:71:3)
    at runAndTransformResultsToJestFormat (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
    at jestAdapter (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
    at runTestInternal (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:367:16)
    at runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:444:34)
  ```

- Documentation Server API Integration Concurrent Operations should handle concurrent documentation updates
  ```
  Error: MCP error -32600: Documentation "Doc1" already exists. Use update_documentation to modify existing documents.
    at DocumentationServer.addDocumentation (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:641:13)
    at TestServer.addTestDoc (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/helpers/test-server.ts:95:32)
    at /Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/integration/api/documentation-server.test.ts:111:18
    at Array.map (<anonymous>)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/integration/api/documentation-server.test.ts:110:14)
    at Promise.then.completed (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:298:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:231:10)
    at _callCircusTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:316:40)
    at _runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:252:3)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:126:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at run (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:71:3)
    at runAndTransformResultsToJestFormat (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
    at jestAdapter (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
    at runTestInternal (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:367:16)
    at runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:444:34)
  ```

- Documentation Server API Integration Concurrent Operations should handle concurrent searches
  ```
  Error: MCP error -32600: Documentation "Test1" already exists. Use update_documentation to modify existing documents.
    at DocumentationServer.addDocumentation (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:641:13)
    at TestServer.addTestDoc (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/helpers/test-server.ts:95:32)
    at /Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/integration/api/documentation-server.test.ts:146:18
    at Array.map (<anonymous>)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/integration/api/documentation-server.test.ts:145:37)
    at Promise.then.completed (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:298:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:231:10)
    at _callCircusTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:316:40)
    at _runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:252:3)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:126:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at run (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:71:3)
    at runAndTransformResultsToJestFormat (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
    at jestAdapter (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
    at runTestInternal (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:367:16)
    at runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:444:34)
  ```

- Documentation Server API Integration Resource Management should cleanup resources after removing documentation
  ```
  Error: MCP error -32600: Documentation "Resource Test" already exists. Use update_documentation to modify existing documents.
    at DocumentationServer.addDocumentation (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:641:13)
    at TestServer.addTestDoc (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/helpers/test-server.ts:95:32)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/integration/api/documentation-server.test.ts:177:20)
    at Promise.then.completed (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:298:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:231:10)
    at _callCircusTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:316:40)
    at _runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:252:3)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:126:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at run (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:71:3)
    at runAndTransformResultsToJestFormat (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
    at jestAdapter (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
    at runTestInternal (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:367:16)
    at runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:444:34)
  ```

- Documentation Server API Integration Resource Management should handle resource updates correctly
  ```
  Error: MCP error -32600: Documentation "Update Test" already exists. Use update_documentation to modify existing documents.
    at DocumentationServer.addDocumentation (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:641:13)
    at TestServer.addTestDoc (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/helpers/test-server.ts:95:32)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/integration/api/documentation-server.test.ts:198:20)
    at Promise.then.completed (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:298:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:231:10)
    at _callCircusTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:316:40)
    at _runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:252:3)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:126:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at run (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:71:3)
    at runAndTransformResultsToJestFormat (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
    at jestAdapter (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
    at runTestInternal (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:367:16)
    at runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:444:34)
  ```


### ✅ Passed Tests

- Documentation Server API Integration Error Handling should handle invalid documentation data
## src/tests/unit/utils/resource-manager.test.ts


### ❌ Failed Tests

- ResourceManager Error Handling should handle threshold check errors
  ```
  Error: Threshold check error
    at ResourceManager.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/utils/resource-manager.test.ts:238:15)
    at /Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-mock/build/index.js:397:39
    at ResourceManager.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-mock/build/index.js:404:13)
    at ResourceManager.mockConstructor (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-mock/build/index.js:148:19)
    at Timeout.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/utils/resource-manager.ts:98:12)
    at listOnTimeout (node:internal/timers:614:17)
    at processTimers (node:internal/timers:549:7)
  ```


### ✅ Passed Tests

- ResourceManager Resource Monitoring should start and stop monitoring
- ResourceManager Resource Monitoring should emit metrics events
- ResourceManager Resource Monitoring should update metrics periodically
- ResourceManager File Handle Management should track file handles
- ResourceManager File Handle Management should handle duplicate file handles
- ResourceManager File Handle Management should handle unregistering non-existent handles
- ResourceManager Connection Management should track connections
- ResourceManager Connection Management should update connection status
- ResourceManager Connection Management should handle connection cleanup
- ResourceManager Resource Cleanup should cleanup resources when thresholds exceeded
- ResourceManager Resource Cleanup should handle cleanup errors gracefully
- ResourceManager Resource Cleanup should prevent concurrent cleanups
- ResourceManager Resource Cleanup should force cleanup when specified
- ResourceManager Configuration Management should update thresholds
- ResourceManager Configuration Management should merge partial threshold updates
- ResourceManager Event Handling should cleanup event listeners on destroy
- ResourceManager Event Handling should handle multiple event listeners
- ResourceManager Error Handling should handle monitoring errors
## src/tests/integration.test.ts


### ❌ Failed Tests

- MCP Integration Tests Tool Execution Flow should handle complete documentation workflow
  ```
  Error: MCP error -32600: Documentation "Test Doc" already exists. Use update_documentation to modify existing documents.
    at DocumentationServer.addDocumentation (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:641:13)
    at TestServer.addTestDoc (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/test-server.ts:95:32)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/integration.test.ts:46:38)
    at Promise.then.completed (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:298:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:231:10)
    at _callCircusTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:316:40)
    at _runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:252:3)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:126:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at run (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:71:3)
    at runAndTransformResultsToJestFormat (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
    at jestAdapter (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
    at runTestInternal (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:367:16)
    at runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:444:34)
  ```

- MCP Integration Tests MCP Protocol Compliance should handle tool requests according to MCP protocol
  ```
  Error: Mock handler not found for: list_tools
    at TestServer.getMockHandler (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/test-server.ts:109:13)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/integration.test.ts:102:39)
    at Promise.then.completed (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:298:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:231:10)
    at _callCircusTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:316:40)
    at _runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:252:3)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:126:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at run (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:71:3)
    at runAndTransformResultsToJestFormat (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
    at jestAdapter (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
    at runTestInternal (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:367:16)
    at runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:444:34)
  ```

- MCP Integration Tests MCP Protocol Compliance should handle resource requests according to MCP protocol
  ```
  Error: Mock handler not found for: list_resources
    at TestServer.getMockHandler (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/test-server.ts:109:13)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/integration.test.ts:135:43)
    at Promise.then.completed (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:298:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:231:10)
    at _callCircusTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:316:40)
    at _runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:252:3)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:126:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at run (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:71:3)
    at runAndTransformResultsToJestFormat (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
    at jestAdapter (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
    at runTestInternal (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:367:16)
    at runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:444:34)
  ```

- MCP Integration Tests Error Handling Scenarios should handle invalid tool requests
  ```
  Error: Mock handler not found for: call_tool
    at TestServer.getMockHandler (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/test-server.ts:109:13)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/integration.test.ts:173:38)
    at Promise.then.completed (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:298:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:231:10)
    at _callCircusTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:316:40)
    at _runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:252:3)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:126:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at run (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:71:3)
    at runAndTransformResultsToJestFormat (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
    at jestAdapter (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
    at runTestInternal (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:367:16)
    at runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:444:34)
  ```

- MCP Integration Tests Error Handling Scenarios should handle invalid resource requests
  ```
  Error: Mock handler not found for: read_resource
    at TestServer.getMockHandler (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/test-server.ts:109:13)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/integration.test.ts:185:42)
    at Promise.then.completed (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:298:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:231:10)
    at _callCircusTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:316:40)
    at _runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:252:3)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:126:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at run (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:71:3)
    at runAndTransformResultsToJestFormat (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
    at jestAdapter (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
    at runTestInternal (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:367:16)
    at runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:444:34)
  ```

- MCP Integration Tests Error Handling Scenarios should handle network errors during documentation update
  ```
  Error: MCP error -32600: Documentation "Test Doc" already exists. Use update_documentation to modify existing documents.
    at DocumentationServer.addDocumentation (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:641:13)
    at TestServer.addTestDoc (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/test-server.ts:95:32)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/integration.test.ts:200:20)
    at Promise.then.completed (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:298:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:231:10)
    at _callCircusTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:316:40)
    at _runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:252:3)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:126:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at run (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:71:3)
    at runAndTransformResultsToJestFormat (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
    at jestAdapter (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
    at runTestInternal (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:367:16)
    at runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:444:34)
  ```

- MCP Integration Tests Mode Switching Tests should handle mode-specific behavior
  ```
  Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32mtrue[39m
Received: [31mundefined[39m
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/integration.test.ts:226:47)
  ```

- MCP Integration Tests Mode Switching Tests should use appropriate logging format per mode
  ```
  Error: [2mexpect([22m[31mjest.fn()[39m[2m).[22mtoHaveBeenCalledWith[2m([22m[32m...expected[39m[2m)[22m

Expected: [32mStringContaining "[LOCAL VERSION]"[39m
Received
       1: [31m"[39m
[31mInitializing storage:"[39m
       2: [31m"- Storage path:"[39m, [31m"/Users/fadandr/Library/Application Support/mcp-codex-keeper"[39m
       3: [31m"- Created directories successfully"[39m

Number of calls: [31m15[39m
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/integration.test.ts:244:28)
  ```

## src/tests/unit/utils/fs.test.ts


### ❌ Failed Tests

- FileSystemManager updateDocumentation should handle non-URL content correctly
  ```
  Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBeUndefined[2m()[22m

Received: [31m{}[39m
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/utils/fs.test.ts:207:37)
  ```


### ✅ Passed Tests

- FileSystemManager File Path Handling should handle valid file names
- FileSystemManager File Path Handling should prevent path traversal
- FileSystemManager File Path Handling should handle non-printable characters
- FileSystemManager searchInDocumentation should find matches with context
- FileSystemManager searchInDocumentation should return empty array for no matches
- FileSystemManager searchInDocumentation should handle case-insensitive search
- FileSystemManager updateDocumentation should handle URL content with eTag and lastModified
## src/tests/unit/server/server.test.ts


### ❌ Failed Tests

- DocumentationServer Server Initialization should initialize server with default documentation when no existing docs
  ```
  TypeError: this.server.setRequestHandler is not a function
    at DocumentationServer.setupToolHandlers (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:270:17)
    at DocumentationServer.init (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:120:10)
    at Function.start (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:62:7)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/server/server.test.ts:46:22)
  ```

- DocumentationServer Server Initialization should use existing documentation if available
  ```
  TypeError: this.server.setRequestHandler is not a function
    at DocumentationServer.setupToolHandlers (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:270:17)
    at DocumentationServer.init (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:120:10)
    at Function.start (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:62:7)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/server/server.test.ts:70:22)
  ```

- DocumentationServer Documentation Management should add new documentation
  ```
  TypeError: this.server.setRequestHandler is not a function
    at DocumentationServer.setupToolHandlers (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:270:17)
    at DocumentationServer.init (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:120:10)
    at Function.start (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:62:7)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/server/server.test.ts:85:16)
  ```

- DocumentationServer Documentation Management should update existing documentation
  ```
  TypeError: this.server.setRequestHandler is not a function
    at DocumentationServer.setupToolHandlers (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:270:17)
    at DocumentationServer.init (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:120:10)
    at Function.start (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:62:7)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/server/server.test.ts:85:16)
  ```

- DocumentationServer Documentation Management should remove documentation
  ```
  TypeError: this.server.setRequestHandler is not a function
    at DocumentationServer.setupToolHandlers (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:270:17)
    at DocumentationServer.init (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:120:10)
    at Function.start (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:62:7)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/server/server.test.ts:85:16)
  ```

- DocumentationServer Search and Filtering should list documentation with category filter
  ```
  TypeError: this.server.setRequestHandler is not a function
    at DocumentationServer.setupToolHandlers (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:270:17)
    at DocumentationServer.init (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:120:10)
    at Function.start (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:62:7)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/server/server.test.ts:158:16)
  ```

- DocumentationServer Search and Filtering should list documentation with tag filter
  ```
  TypeError: this.server.setRequestHandler is not a function
    at DocumentationServer.setupToolHandlers (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:270:17)
    at DocumentationServer.init (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:120:10)
    at Function.start (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:62:7)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/server/server.test.ts:158:16)
  ```

- DocumentationServer Search and Filtering should search documentation content
  ```
  TypeError: this.server.setRequestHandler is not a function
    at DocumentationServer.setupToolHandlers (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:270:17)
    at DocumentationServer.init (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:120:10)
    at Function.start (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:62:7)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/server/server.test.ts:158:16)
  ```

- DocumentationServer Error Handling should handle invalid documentation name on remove
  ```
  TypeError: this.server.setRequestHandler is not a function
    at DocumentationServer.setupToolHandlers (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:270:17)
    at DocumentationServer.init (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:120:10)
    at Function.start (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:62:7)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/server/server.test.ts:215:16)
  ```

- DocumentationServer Error Handling should handle invalid documentation name on update
  ```
  TypeError: this.server.setRequestHandler is not a function
    at DocumentationServer.setupToolHandlers (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:270:17)
    at DocumentationServer.init (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:120:10)
    at Function.start (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:62:7)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/server/server.test.ts:215:16)
  ```

- DocumentationServer Error Handling should handle fetch errors during update
  ```
  TypeError: this.server.setRequestHandler is not a function
    at DocumentationServer.setupToolHandlers (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:270:17)
    at DocumentationServer.init (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:120:10)
    at Function.start (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/server.ts:62:7)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/server/server.test.ts:215:16)
  ```

## src/tests/unit/validators/validators.test.ts


### ❌ Failed Tests

- Validators validateAddDoc throws error for invalid URL
  ```
  Error: Invalid URL format
    at validateAddDoc (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/validators/index.ts:51:11)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/validators/validators.test.ts:67:34)
    at Promise.then.completed (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:298:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:231:10)
    at _callCircusTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:316:40)
    at _runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:252:3)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:126:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at run (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:71:3)
    at runAndTransformResultsToJestFormat (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
    at jestAdapter (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
    at runTestInternal (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:367:16)
    at runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:444:34)
  ```

- Validators validateAddDoc throws error for invalid category
  ```
  Error: Invalid category
    at validateAddDoc (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/validators/index.ts:55:11)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/validators/validators.test.ts:77:34)
    at Promise.then.completed (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:298:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:231:10)
    at _callCircusTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:316:40)
    at _runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:252:3)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:126:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at run (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:71:3)
    at runAndTransformResultsToJestFormat (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
    at jestAdapter (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
    at runTestInternal (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:367:16)
    at runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:444:34)
  ```

- Validators validateAddDoc throws error for invalid tags
  ```
  Error: Invalid tags for category
    at validateAddDoc (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/validators/index.ts:70:11)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/validators/validators.test.ts:88:34)
    at Promise.then.completed (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:298:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:231:10)
    at _callCircusTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:316:40)
    at _runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:252:3)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:126:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at run (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:71:3)
    at runAndTransformResultsToJestFormat (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
    at jestAdapter (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
    at runTestInternal (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:367:16)
    at runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:444:34)
  ```

- Validators validateSearch throws error for missing query
  ```
  Error: Query is required and must be a string
    at validateSearch (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/validators/index.ts:116:11)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/validators/validators.test.ts:161:34)
    at Promise.then.completed (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:298:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:231:10)
    at _callCircusTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:316:40)
    at _runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:252:3)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:126:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at run (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:71:3)
    at runAndTransformResultsToJestFormat (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
    at jestAdapter (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
    at runTestInternal (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:367:16)
    at runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:444:34)
  ```

- Validators validateSearch throws error for invalid category
  ```
  Error: Invalid category
    at validateSearch (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/validators/index.ts:122:13)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/validators/validators.test.ts:170:34)
    at Promise.then.completed (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:298:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:231:10)
    at _callCircusTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:316:40)
    at _runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:252:3)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:126:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at run (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:71:3)
    at runAndTransformResultsToJestFormat (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
    at jestAdapter (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
    at runTestInternal (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:367:16)
    at runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:444:34)
  ```

- Validators validateSearch throws error for invalid tag
  ```
  Error: Invalid tag for category
    at validateSearch (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/validators/index.ts:135:13)
    at Object.<anonymous> (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/src/tests/unit/validators/validators.test.ts:180:34)
    at Promise.then.completed (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:298:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/utils.js:231:10)
    at _callCircusTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:316:40)
    at _runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:252:3)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:126:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at _runTestsForDescribeBlock (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:121:9)
    at run (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/run.js:71:3)
    at runAndTransformResultsToJestFormat (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
    at jestAdapter (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
    at runTestInternal (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:367:16)
    at runTest (/Users/fadandr/Custom Projects/Custom MCP/aindreyway-mcp-codex-keeper/node_modules/jest-runner/build/runTest.js:444:34)
  ```


### ✅ Passed Tests

- Validators isValidCategory returns true for valid categories
- Validators isValidCategory returns false for invalid categories
- Validators validateAddDoc validates correct arguments
- Validators validateAddDoc validates arguments with minimum required fields
- Validators validateUpdateDoc validates correct arguments
- Validators validateUpdateDoc validates arguments without force flag
- Validators validateUpdateDoc throws error for missing name
- Validators validateUpdateDoc throws error for invalid force flag
- Validators validateSearch validates correct arguments
- Validators validateSearch validates arguments with only required query
## src/tests/unit/utils/cache-manager.test.ts


### ✅ Passed Tests

- CacheManager Basic Operations should store and retrieve values
- CacheManager Basic Operations should return undefined for missing keys
- CacheManager Basic Operations should delete values
- CacheManager Basic Operations should clear all values
- CacheManager Size Management should reject entries larger than max size
- CacheManager Size Management should evict entries to make room for new ones
- CacheManager Size Management should track current size correctly
- CacheManager Expiration should expire entries after maxAge
- CacheManager Expiration should cleanup expired entries on access
- CacheManager Expiration should cleanup expired entries manually
- CacheManager LRU Eviction should evict least recently used entries first
- CacheManager Batch Operations should get multiple values
- CacheManager Batch Operations should set multiple values
- CacheManager Statistics should track hit and miss rates
- CacheManager Statistics should reset statistics
- CacheManager Configuration Updates should update configuration
- CacheManager Key/Value Enumeration should list all keys
- CacheManager Key/Value Enumeration should list all non-expired values
- CacheManager Existence Checks should check if key exists
- CacheManager Existence Checks should return false for expired entries
## src/tests/unit/utils/fs-security.test.ts


### ✅ Passed Tests

- FileSystemSecurity ensurePathWithinDirectory should allow paths within directory
- FileSystemSecurity ensurePathWithinDirectory should reject paths outside directory
- FileSystemSecurity ensurePathWithinDirectory should handle symlink attacks
- FileSystemSecurity checkPermissions should allow access with correct permissions
- FileSystemSecurity checkPermissions should reject access with insufficient permissions
- FileSystemSecurity createSecureDirectory should create directory with correct permissions
- FileSystemSecurity createSecureDirectory should fix incorrect permissions
- FileSystemSecurity writeSecureFile should write file with correct permissions
- FileSystemSecurity writeSecureFile should handle write failures gracefully
- FileSystemSecurity writeSecureFile should clean up temporary files on failure
- FileSystemSecurity readSecureFile should read file with correct permissions
- FileSystemSecurity readSecureFile should reject reading files without permission
- FileSystemSecurity deleteSecureFile should delete file with correct permissions
- FileSystemSecurity deleteSecureFile should reject deleting files without permission
- FileSystemSecurity ensureSafePermissions should fix unsafe directory permissions
- FileSystemSecurity ensureSafePermissions should fix unsafe file permissions
- FileSystemSecurity securePath should recursively secure directory tree
- FileSystemSecurity securePath should handle custom permissions
- FileSystemSecurity checkResourceLimits should enforce file count limits
- FileSystemSecurity checkResourceLimits should enforce directory size limits
- FileSystemSecurity checkResourceLimits should enforce file size limits for reads
## src/tests/unit/utils/rate-limiter.test.ts


### ✅ Passed Tests

- RateLimiter Basic Rate Limiting should allow requests within limit
- RateLimiter Basic Rate Limiting should refill tokens over time
- RateLimiter Burst Handling should handle burst requests
- RateLimiter Burst Handling should recover from burst gradually
- RateLimiter Multiple Clients should track limits separately for different clients
- RateLimiter Cleanup should remove old buckets
- RateLimiter Cleanup should keep active buckets
- RateLimiter Reset should reset limits for a client
- RateLimiter Default Configuration should use default config values
## src/tests/unit/utils/batch-processor.test.ts


### ✅ Passed Tests

- BatchProcessor Basic Operations should process single operation
- BatchProcessor Basic Operations should process multiple operations
- BatchProcessor Basic Operations should handle operation failures
- BatchProcessor Batch Processing should process operations in batches
- BatchProcessor Batch Processing should respect maxBatchSize
- BatchProcessor Batch Processing should process batches in parallel by default
- BatchProcessor Batch Processing should process batches sequentially when configured
- BatchProcessor Retry Behavior should retry failed operations
- BatchProcessor Retry Behavior should fail after max retries
- BatchProcessor Queue Management should track queue length
- BatchProcessor Queue Management should clear queue
- BatchProcessor Queue Management should flush queue
- BatchProcessor Configuration Updates should update options
- BatchProcessor Error Handling should handle mixed success and failures
- BatchProcessor Error Handling should handle operation timeout
- BatchProcessor Processing State should track processing state
## src/tests/unit/utils/input-sanitizer.test.ts


### ✅ Passed Tests

- InputSanitizer sanitizePath should handle normal paths
- InputSanitizer sanitizePath should detect path traversal attempts
- InputSanitizer sanitizePath should normalize paths
- InputSanitizer sanitizeFileName should remove directory traversal characters
- InputSanitizer sanitizeFileName should remove non-printable characters
- InputSanitizer sanitizeFileName should preserve valid characters
- InputSanitizer sanitizeUrl should allow valid http URLs
- InputSanitizer sanitizeUrl should allow file URLs
- InputSanitizer sanitizeUrl should reject invalid protocols
- InputSanitizer sanitizeUrl should encode special characters in path
- InputSanitizer sanitizeUrl should remove fragments
- InputSanitizer sanitizeContent should enforce maximum length
- InputSanitizer sanitizeContent should remove all HTML when not allowed
- InputSanitizer sanitizeContent should only allow specified HTML tags
- InputSanitizer normalizeEncoding should normalize Unicode characters
- InputSanitizer normalizeEncoding should remove invalid UTF-8 sequences
- InputSanitizer sanitizeSearchQuery should escape regex special characters
- InputSanitizer sanitizeSearchQuery should preserve normal characters
- InputSanitizer sanitizeJson should parse and sanitize valid JSON
- InputSanitizer sanitizeJson should handle nested objects
- InputSanitizer sanitizeJson should throw on invalid JSON
- InputSanitizer sanitizeJson should preserve primitive values

## Summary

- Duration: 24.66s
- Total Suites: 12
- Failed Suites: 7
- Passed Suites: 5
- Total Tests: 171
- Failed Tests: 39
- Passed Tests: 132
- Pending Tests: 0

Timestamp: 2024-12-22T13:36:27.556Z