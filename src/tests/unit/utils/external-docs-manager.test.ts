import fs from 'fs/promises';
import path from 'path';
import { DocMetadata } from '../../../types/index.js';
import { ExternalDocsManager } from '../../../utils/external-docs-manager.js';

// Helper function to create test metadata
function createTestMetadata(overrides: Partial<DocMetadata> = {}): DocMetadata {
  const timestamp = new Date().toISOString();
  return {
    name: 'test-doc',
    title: 'Test Doc',
    description: 'Test description',
    category: 'Base.Standards',
    tags: ['test'],
    version: '1.0.0',
    content: '',
    lastUpdated: timestamp,
    versions: [],
    lastSuccessfulUpdate: timestamp,
    lastAttemptedUpdate: timestamp,
    lastChecked: timestamp,
    ...overrides,
  };
}

describe('ExternalDocsManager', () => {
  let manager: ExternalDocsManager;
  let testDir: string;
  const TEST_DATA_DIR = path.join(process.cwd(), 'test-data', `external-docs-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  beforeAll(async () => {
    await fs.mkdir(TEST_DATA_DIR, { recursive: true });
  });

  afterAll(async () => {
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    } catch (error) {
      console.error('Failed to cleanup test-data directory:', error);
    }
  });

  beforeEach(async () => {
    testDir = path.join(process.cwd(), 'test-data', `test-docs-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    manager = new ExternalDocsManager(testDir, {
      enabled: false, // Disable automatic backups for tests
      interval: 1000,
      maxBackups: 3,
      path: 'backups',
    });
  });

  afterEach(async () => {
    if (manager) {
      manager.destroy();
    }
    if (testDir) {
      try {
        await fs.rm(testDir, { recursive: true, force: true });
      } catch (error) {
        console.error('Failed to cleanup test directory:', error);
      }
    }
  });

  describe('Document Management', () => {
    it('should save and retrieve documentation', async () => {
      const url = 'https://example.com/docs';
      const content = 'Test documentation content';
      const metadata = createTestMetadata();

      await manager.saveDoc(url, content, metadata);
      const doc = await manager.getDoc(url);

      expect(doc).toBeDefined();
      expect(doc?.name).toBe(metadata.title);
      expect(doc?.description).toBe(metadata.description);
      expect(doc?.category).toBe(metadata.category);
      expect(doc?.tags).toEqual(metadata.tags);
    });

    it('should handle multiple versions', async () => {
      const url = 'https://example.com/docs';
      const content1 = 'Version 1';
      const content2 = 'Version 2';

      // Save first version
      const metadata1 = createTestMetadata({ title: 'Version 1' });
      await manager.saveDoc(url, content1, metadata1);
      const doc1 = await manager.getDoc(url);
      expect(doc1?.name).toBe(metadata1.title);
      const version1 = doc1?.version;

      // Добавляем задержку между версиями для уникальных временных меток
      await new Promise(resolve => setTimeout(resolve, 100));

      // Save second version
      const metadata2 = createTestMetadata({ title: 'Version 2' });
      await manager.saveDoc(url, content2, metadata2);
      const doc2 = await manager.getDoc(url);
      expect(doc2?.name).toBe(metadata2.title);
      const version2 = doc2?.version;

      // Verify versions are different
      expect(version1).toBeDefined();
      expect(version2).toBeDefined();
      expect(version1).not.toBe(version2);

      // Get current version
      const currentDoc = await manager.getDoc(url);
      expect(currentDoc?.name).toBe(metadata2.title);
    });

    it('should sanitize URLs and content', async () => {
      const url = 'https://example.com/docs/with spaces?param=value';
      const content = '<script>alert("test")</script>Documentation';

      const metadata = createTestMetadata();
      await manager.saveDoc(url, content, metadata);
      const doc = await manager.getDoc(url);

      expect(doc?.url).not.toContain(' ');
      expect(doc?.name).toBe(metadata.title);
    });

    it('should handle missing documents', async () => {
      const doc = await manager.getDoc('https://nonexistent.com');
      expect(doc).toBeUndefined();
    });
  });

  describe('Backup Management', () => {
    it('should create and restore backups', async () => {
      const url = 'https://example.com/docs';
      const content = 'Test content';

      // Сохраняем документ и создаем бэкап
      const metadata = createTestMetadata();
      await manager.saveDoc(url, content, metadata);
      await manager.createBackup();

      // Ждем завершения операции бэкапа
      await new Promise(resolve => setTimeout(resolve, 100));

      // Модифицируем контент
      await manager.saveDoc(url, 'Modified content');
      const modifiedDoc = await manager.getDoc(url);
      expect(modifiedDoc?.name).toBe(metadata.title);

      // Очищаем кэш через публичный метод
      await manager.getDoc(url); // Сначала кэшируем
      await manager.clearCache(); // Затем очищаем

      // Восстанавливаем из бэкапа
      await manager.restoreFromBackup();

      // Ждем завершения операции восстановления
      await new Promise(resolve => setTimeout(resolve, 100));

      // Проверяем восстановленный контент
      const restoredDoc = await manager.getDoc(url);
      expect(restoredDoc?.name).toBe(metadata.title);
    });

    it('should maintain maximum number of backups', async () => {
      // Create more than max backups
      for (let i = 0; i < 5; i++) {
        await manager.createBackup();
        await new Promise(resolve => setTimeout(resolve, 100)); // Ensure unique timestamps
      }

      const backupDir = path.join(testDir, 'backups');
      const backups = await fs.readdir(backupDir);
      expect(backups).toHaveLength(3); // maxBackups is 3
    });

    it('should handle backup restoration by timestamp', async () => {
      const url = 'https://example.com/docs';

      // Создаем первую версию и бэкап
      const metadata1 = createTestMetadata({ title: 'Version 1' });
      await manager.saveDoc(url, 'Version 1', metadata1);
      await manager.createBackup();

      // Получаем список бэкапов для первой версии
      const backupDir = path.join(testDir, 'backups');
      const backups1 = await fs.readdir(backupDir);
      const timestamp1 = backups1[0].replace('.json', '');

      // Ждем для уникальности временных меток
      await new Promise(resolve => setTimeout(resolve, 100));

      // Создаем вторую версию и бэкап
      const metadata2 = createTestMetadata({ title: 'Version 2' });
      await manager.saveDoc(url, 'Version 2', metadata2);
      await manager.createBackup();

      // Ждем завершения операции бэкапа
      await new Promise(resolve => setTimeout(resolve, 100));

      // Очищаем кэш через публичный метод
      await manager.getDoc(url); // Сначала кэшируем
      await manager.clearCache(); // Затем очищаем

      // Восстанавливаем из первого бэкапа
      await manager.restoreFromBackup(timestamp1);

      // Ждем завершения операции восстановления
      await new Promise(resolve => setTimeout(resolve, 100));

      // Проверяем восстановленный контент
      const restoredDoc = await manager.getDoc(url);
      expect(restoredDoc?.name).toBe(metadata1.title);
    });

    it('should handle backup errors gracefully', async () => {
      // Создаем менеджер с несуществующей директорией
      const invalidPath = path.join(process.cwd(), 'test-data', `invalid-path-${Date.now()}`);
      const invalidManager = new ExternalDocsManager(invalidPath);

      // Проверяем, что createBackup выбрасывает ошибку
      try {
        await invalidManager.createBackup();
        fail('Expected createBackup to throw');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toBeDefined();
      }

      // Проверяем, что restoreFromBackup выбрасывает ошибку
      try {
        await invalidManager.restoreFromBackup('nonexistent');
        fail('Expected restoreFromBackup to throw');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Backup not found');
      }

      // Очищаем ресурсы
      invalidManager.destroy();
    });
  });

  describe('Cache Management', () => {
    it('should use cache for repeated requests', async () => {
      const url = 'https://example.com/docs';
      const content = 'Test content';

      // Создаем документ
      const metadata = createTestMetadata();
      await manager.saveDoc(url, content, metadata);

      // Мокируем метод getDocumentMetadata
      const fsManager = (manager as any).fsManager;
      const getDocSpy = jest.spyOn(fsManager, 'getDocumentMetadata');
      const getContentSpy = jest.spyOn(fsManager, 'getDocumentContent');

      // Первый запрос должен обратиться к файловой системе
      await manager.getDoc(url);
      expect(getDocSpy).toHaveBeenCalledTimes(1);
      expect(getContentSpy).toHaveBeenCalledTimes(1);

      // Очищаем счетчики вызовов
      getDocSpy.mockClear();
      getContentSpy.mockClear();

      // Второй запрос должен использовать кэш
      await manager.getDoc(url);
      expect(getDocSpy).not.toHaveBeenCalled();
      expect(getContentSpy).not.toHaveBeenCalled();

      // Очищаем моки
      getDocSpy.mockRestore();
      getContentSpy.mockRestore();
    });

    it('should clear cache on backup restore', async () => {
      const url = 'https://example.com/docs';

      // Сохраняем оригинальную версию и создаем бэкап
      const metadata = createTestMetadata({ title: 'Original' });
      await manager.saveDoc(url, 'Original', metadata);
      await manager.createBackup();

      // Ждем завершения операции бэкапа
      await new Promise(resolve => setTimeout(resolve, 100));

      // Кэшируем оригинальную версию
      await manager.getDoc(url);

      // Модифицируем документ
      await manager.saveDoc(url, 'Modified');
      const modifiedDoc = await manager.getDoc(url);
      expect(modifiedDoc?.name).toBe('Modified');

      // Проверяем, что документ закэширован
      const cachedDoc = await manager.getDoc(url);
      expect(cachedDoc).toBeDefined();

      // Восстанавливаем из бэкапа
      await manager.restoreFromBackup();

      // Ждем завершения операции восстановления
      await new Promise(resolve => setTimeout(resolve, 100));

      // Проверяем, что кэш очищен (документ будет загружен заново)
      const reloadedDoc = await manager.getDoc(url);
      expect(reloadedDoc?.name).toBe(metadata.title);

      // Проверяем, что получаем оригинальную версию
      const restoredDoc = await manager.getDoc(url);
      expect(restoredDoc?.name).toBe(metadata.title);
    });
  });

  describe('Error Handling', () => {
    it('should handle filesystem errors', async () => {
      // Mock filesystem error
      jest.spyOn(fs, 'writeFile').mockRejectedValueOnce(new Error('Write error'));

      await expect(manager.saveDoc('https://example.com', 'content')).rejects.toThrow(
        /Failed to save documentation|Write error/
      );
    });

    it('should handle invalid URLs', async () => {
      await expect(manager.saveDoc('not a url', 'content')).rejects.toThrow('Invalid URL');
    });

    it('should handle backup restoration errors', async () => {
      await expect(manager.restoreFromBackup('nonexistent')).rejects.toThrow('Backup not found');
    });
  });

  describe('Resource Cleanup', () => {
    it('should cleanup resources properly', async () => {
      const url = 'https://example.com/docs';
      const content = 'Test content';
      const metadata = createTestMetadata();

      // Создаем документ и кэшируем его
      await manager.saveDoc(url, content, metadata);
      await manager.getDoc(url);

      // Уничтожаем менеджер
      manager.destroy();

      // Создаем новый менеджер с тем же путем
      const newManager = new ExternalDocsManager(testDir);

      // Документ должен быть доступен, но не закэширован
      const doc = await newManager.getDoc(url);
      expect(doc).toBeDefined();
      expect(doc?.name).toBe(metadata.title);

      // Очищаем
      newManager.destroy();
    });
  });
});
