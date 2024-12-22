import 'jest-extended';
import { mockDeep, mockReset } from 'jest-mock-extended';
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

// Clean up after each test
afterEach(async () => {
  // Restore all mocks
  jest.restoreAllMocks();
  jest.clearAllMocks();
  jest.resetAllMocks();

  // Clear all timers
  jest.clearAllTimers();

  // Clear all intervals and timeouts
  const globalObj = typeof window !== 'undefined' ? window : global;
  
  // Get all active handles
  const activeHandles = (process as any)._getActiveHandles?.() || [];
  
  // Get all active handles and timers
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

  // Wait for any pending promises and ensure file system operations complete
  await Promise.all([
    new Promise(resolve => setImmediate(resolve)),
    new Promise(resolve => setTimeout(resolve, 100))
  ]);
  
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

  // Wait for any remaining operations
  await new Promise(resolve => setTimeout(resolve, 100));
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
