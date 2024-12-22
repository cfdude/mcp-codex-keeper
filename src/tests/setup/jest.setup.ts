import 'jest-extended';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { logger } from '../../utils/logger.js';

// Define types for process._getActiveHandles
declare global {
  namespace NodeJS {
    interface Process {
      _getActiveHandles(): Array<{
        constructor: { name: string };
        unref?: () => void;
        destroy?: () => void;
        removeAllListeners?: () => void;
      }>;
    }
  }
}
import fs from 'fs/promises';
import path from 'path';

// Extend Jest matchers
expect.extend({
  toMatchFilePath(received: string, expected: string) {
    const normalizedReceived = received.replace(/[\\/]+/g, '/');
    const normalizedExpected = expected.replace(/[\\/]+/g, '/');

    return {
      message: () => `expected ${normalizedReceived} to match path ${normalizedExpected}`,
      pass: normalizedReceived === normalizedExpected,
    };
  },
});

// Mock global.gc for tests
(global as any).gc = jest.fn();

// Increase timeout for all tests
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Import required modules
import { Worker, MessagePort } from 'worker_threads';

// Define types for tracking
type TrackedWorker = Worker & {
  terminate(): void;
  postMessage(value: any, transferList?: ReadonlyArray<MessagePort | ArrayBuffer>): void;
  ref(): void;
  unref(): void;
};

// Track active handles and resources
const activeHandles = new Set();
const activeWorkers = new Set<TrackedWorker>();

// Monkey patch worker_threads to track workers
try {
  const worker_threads = require('worker_threads');
  const originalWorker = worker_threads.Worker;
  worker_threads.Worker = function (...args: ConstructorParameters<typeof Worker>) {
    const worker = new originalWorker(...args) as TrackedWorker;
    activeWorkers.add(worker);
    worker.on('exit', () => {
      activeWorkers.delete(worker);
    });
    return worker;
  };
} catch (error) {
  console.warn('Failed to patch worker_threads:', error instanceof Error ? error.message : String(error));
}

// Clean up after each test
afterEach(async () => {
  // Restore all mocks
  jest.restoreAllMocks();
  jest.clearAllMocks();
  jest.resetAllMocks();

  // Clear all timers
  jest.clearAllTimers();

  // Terminate any active workers
  for (const worker of activeWorkers) {
    try {
      worker.terminate();
    } catch (error) {
      console.warn('Failed to terminate worker:', error);
    }
  }
  activeWorkers.clear();

  // Clear all intervals and timeouts
  const globalObj = typeof window !== 'undefined' ? window : global;
  
  // Get all active handles and timers
  const activeHandles = process._getActiveHandles?.() || [];
  const timers = activeHandles.filter(handle => handle.constructor.name === 'Timeout');
  
  // First unref all timers
  for (const timer of timers) {
    if (timer.unref) timer.unref();
  }
  
  const intervals = (globalObj as any)[Symbol.for('jest-native-timers')] || new Set();
  const timeouts = (globalObj as any)[Symbol.for('jest-native-timeouts')] || new Set();
  
  // Create a set of all handles to clean up
  const allHandles = new Set([
    ...intervals,
    ...timeouts,
    ...activeHandles,
    ...(process as any)._getActiveHandles?.() || []
  ]);
  
  // First unref all handles to prevent blocking
  allHandles.forEach((handle: any) => {
    try {
      if (handle && typeof handle.unref === 'function') {
        handle.unref();
      }
      
      // Special handling for EventEmitter instances
      if (handle && typeof handle.removeAllListeners === 'function') {
        handle.removeAllListeners();
      }
    } catch (error) {
      console.warn('Failed to unref handle:', error);
    }
  });

  // Then clear all timers
  intervals.forEach((interval: any) => {
    try {
      if (interval) {
        clearInterval(interval);
      }
    } catch (error) {
      console.warn('Failed to clear interval:', error);
    }
  });

  timeouts.forEach((timeout: any) => {
    try {
      if (timeout) {
        clearTimeout(timeout);
      }
    } catch (error) {
      console.warn('Failed to clear timeout:', error);
    }
  });
  
  // Force cleanup of any remaining handles
  allHandles.forEach((handle: any) => {
    try {
      if (handle && typeof handle.destroy === 'function') {
        handle.destroy();
      }
    } catch (error) {
      console.warn('Failed to destroy handle:', error);
    }
  });

  // Enhanced cleanup strategy with active handle tracking
  const cleanupPromises = [];
  
  // Stage 1: Handle active timers and resources
  cleanupPromises.push(
    new Promise<void>(resolve => {
      try {
        const activeHandles = process._getActiveHandles();
        
        // Unref all timers to prevent them from keeping the process alive
        activeHandles
          .filter(handle => handle.constructor.name === 'Timeout')
          .forEach(timer => {
            if (typeof timer.unref === 'function') {
              timer.unref();
            }
          });
        
        // Unref any remaining handles
        activeHandles.forEach(handle => {
          if (handle && typeof handle.unref === 'function') {
            handle.unref();
          }
        });
        
        resolve();
      } catch (error) {
        logger.error('Error during handle cleanup:', {
          component: 'JestSetup',
          operation: 'cleanup',
          error: error instanceof Error ? error : new Error(String(error))
        });
        resolve();
      }
    })
  );
  
  // Stage 2: Force cleanup and garbage collection
  cleanupPromises.push(
    new Promise<void>(resolve => {
      if (typeof global.gc === 'function') {
        global.gc();
      }
      resolve();
    })
  );
  
  // Stage 3: Final wait for any remaining operations
  cleanupPromises.push(
    new Promise(resolve => setTimeout(resolve, 2000))
  );
  
  await Promise.all(cleanupPromises);
  
  // Additional cleanup for any stray test directories
  try {
    const testDataDir = path.join(process.cwd(), 'test-data');
    const contents = await fs.readdir(testDataDir);
    await Promise.all(
      contents.map(async (item) => {
        const fullPath = path.join(testDataDir, item);
        try {
          await fs.rm(fullPath, { recursive: true, force: true });
        } catch (error) {
          console.error(`Failed to cleanup ${fullPath}:`, error);
        }
      })
    );
  } catch (error) {
    // Ignore if test-data doesn't exist
    if ((error as any)?.code !== 'ENOENT') {
      console.error('Failed to cleanup test directories:', error);
    }
  }
});

// Clean up after all tests
afterAll(async () => {
  // Final cleanup of any remaining timers or handles
  jest.clearAllTimers();

  // Final cleanup and wait for any remaining operations
  if (typeof global.gc === 'function') {
    global.gc();
  }
  
  // Extended wait to ensure all cleanup completes
  await Promise.all([
    new Promise(resolve => setImmediate(resolve)),
    new Promise(resolve => setTimeout(resolve, 2000))
  ]);
});

// Add custom types for matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchFilePath(expected: string): R;
      toBeTrue(): R;
      toBeFalse(): R;
      toInclude(value: string): R;
      toEndWith(value: string): R;
    }
  }
}
