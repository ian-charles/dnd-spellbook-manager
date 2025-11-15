import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { exportImportService } from './exportImport.service';
import { storageService } from './storage.service';
import { db } from './db';
import { Spellbook } from '../types/spellbook';

describe('exportImportService', () => {
  beforeEach(async () => {
    await db.spellbooks.clear();

    // Setup browser API mocks if they don't exist
    if (!global.URL.createObjectURL) {
      global.URL.createObjectURL = vi.fn();
    }
    if (!global.URL.revokeObjectURL) {
      global.URL.revokeObjectURL = vi.fn();
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportSpellbooks', () => {
    it('should export all spellbooks as JSON string', async () => {
      // Create test spellbooks
      const spellbook1: Spellbook = {
        id: 'test-1',
        name: 'Wizard Spellbook',
        spells: [
          { spellId: 'fireball', prepared: true, notes: 'Favorite' },
          { spellId: 'magic-missile', prepared: false, notes: '' },
        ],
        created: '2024-01-01T00:00:00.000Z',
        updated: '2024-01-02T00:00:00.000Z',
      };

      const spellbook2: Spellbook = {
        id: 'test-2',
        name: 'Cleric Spellbook',
        spells: [{ spellId: 'cure-wounds', prepared: true, notes: 'Essential' }],
        created: '2024-01-03T00:00:00.000Z',
        updated: '2024-01-03T00:00:00.000Z',
      };

      await db.spellbooks.add(spellbook1);
      await db.spellbooks.add(spellbook2);

      // Export
      const exported = await exportImportService.exportSpellbooks();
      const data = JSON.parse(exported);

      // Verify structure
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('exportDate');
      expect(data).toHaveProperty('spellbooks');
      expect(data.version).toBe('1.0');
      expect(data.spellbooks).toHaveLength(2);
      expect(data.spellbooks).toContainEqual(spellbook1);
      expect(data.spellbooks).toContainEqual(spellbook2);
    });

    it('should export empty array when no spellbooks exist', async () => {
      const exported = await exportImportService.exportSpellbooks();
      const data = JSON.parse(exported);

      expect(data.spellbooks).toEqual([]);
    });
  });

  describe('importSpellbooks', () => {
    it('should import spellbooks from valid JSON', async () => {
      const importData = {
        version: '1.0',
        exportDate: '2024-01-01T00:00:00.000Z',
        spellbooks: [
          {
            id: 'import-1',
            name: 'Imported Spellbook',
            spells: [{ spellId: 'fireball', prepared: true, notes: 'Test' }],
            created: '2024-01-01T00:00:00.000Z',
            updated: '2024-01-01T00:00:00.000Z',
          },
        ],
      };

      const result = await exportImportService.importSpellbooks(JSON.stringify(importData));

      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(0);
      expect(result.errors).toEqual([]);

      const spellbooks = await storageService.getSpellbooks();
      expect(spellbooks).toHaveLength(1);
      expect(spellbooks[0].name).toBe('Imported Spellbook');
    });

    it('should skip spellbooks with duplicate IDs', async () => {
      // Create existing spellbook
      await storageService.createSpellbook({ name: 'Existing' });
      const existing = await storageService.getSpellbooks();
      const existingId = existing[0].id;

      const importData = {
        version: '1.0',
        exportDate: '2024-01-01T00:00:00.000Z',
        spellbooks: [
          {
            id: existingId, // Same ID as existing
            name: 'Duplicate',
            spells: [],
            created: '2024-01-01T00:00:00.000Z',
            updated: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 'new-id',
            name: 'New Spellbook',
            spells: [],
            created: '2024-01-01T00:00:00.000Z',
            updated: '2024-01-01T00:00:00.000Z',
          },
        ],
      };

      const result = await exportImportService.importSpellbooks(JSON.stringify(importData));

      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(1);

      const spellbooks = await storageService.getSpellbooks();
      expect(spellbooks).toHaveLength(2); // Existing + new one
    });

    it('should throw error for invalid JSON', async () => {
      await expect(exportImportService.importSpellbooks('invalid json')).rejects.toThrow();
    });

    it('should throw error for missing required fields', async () => {
      const invalidData = {
        version: '1.0',
        // Missing exportDate and spellbooks
      };

      await expect(
        exportImportService.importSpellbooks(JSON.stringify(invalidData))
      ).rejects.toThrow('Invalid import data format');
    });

    it('should throw error for unsupported version', async () => {
      const futureVersion = {
        version: '2.0', // Future version
        exportDate: '2024-01-01T00:00:00.000Z',
        spellbooks: [],
      };

      await expect(
        exportImportService.importSpellbooks(JSON.stringify(futureVersion))
      ).rejects.toThrow('Unsupported export version');
    });
  });

  describe('downloadSpellbooks', () => {
    it('should trigger file download with correct filename', async () => {
      // Mock URL.createObjectURL and URL.revokeObjectURL
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      // Mock document.createElement and click
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(mockLink as unknown as HTMLElement);

      await exportImportService.downloadSpellbooks();

      // Verify blob creation
      expect(createObjectURLSpy).toHaveBeenCalled();

      // Verify link creation and click
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockLink.download).toMatch(/spellbooks-backup-\d{4}-\d{2}-\d{2}\.json/);
      expect(mockLink.click).toHaveBeenCalled();

      // Verify cleanup
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');

      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
      createElementSpy.mockRestore();
    });
  });
});
