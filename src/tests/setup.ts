import 'jest-extended/all';
import { mockDeep, mockReset } from 'jest-mock-extended';

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
jest.setTimeout(10000);

// Сохраняем оригинальный console.error для отладки
const originalError = console.error;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: (...args: any[]) => {
    // Выводим ошибки в консоль для отладки
    originalError(...args);
    // Также сохраняем мок для тестов
    jest.fn()(...args);
  },
};

// Create test directory helper
export const createTestDir = async (fs: any, path: string) => {
  await fs.mkdir(path, { recursive: true });
  return path;
};

// Clean test directory helper
export const cleanTestDir = async (fs: any, path: string) => {
  try {
    await fs.rm(path, { recursive: true, force: true });
  } catch (error) {
    console.error(`Failed to clean test directory: ${error}`);
  }
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Не используем mockReset, так как он вызывает проблемы
  jest.resetAllMocks();
});

// Clean up after each test
afterEach(async () => {
  // Restore all mocks
  jest.restoreAllMocks();

  // Clear all timers
  jest.clearAllTimers();

  // Clear all intervals and timeouts
  const globalObj = typeof window !== 'undefined' ? window : global;
  
  // Handle intervals
  const intervals = (globalObj as any)[Symbol.for('jest-native-timers')] || new Set();
  intervals.forEach((interval: any) => {
    if (interval && typeof interval.unref === 'function') {
      interval.unref();
    }
    clearInterval(interval);
  });

  // Handle timeouts
  const timeouts = (globalObj as any)[Symbol.for('jest-native-timeouts')] || new Set();
  timeouts.forEach((timeout: any) => {
    if (timeout && typeof timeout.unref === 'function') {
      timeout.unref();
    }
    clearTimeout(timeout);
  });

  // Clean test directories
  const testDataPath = process.env.TEST_DATA_DIR || './test-data';
  try {
    const { rm } = await import('fs/promises');
    await rm(testDataPath, { recursive: true, force: true });
  } catch (error) {
    console.error(`Failed to clean test directory: ${error}`);
  }

  // Wait for any pending promises and I/O operations
  await Promise.all([
    new Promise(resolve => setImmediate(resolve)),
    new Promise(resolve => setTimeout(resolve, 100))
  ]);
});

// Clean up after all tests
afterAll(async () => {
  // Final cleanup of any remaining timers or handles
  jest.clearAllTimers();

  // Wait for any remaining operations
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Add custom type for toMatchFilePath matcher
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
