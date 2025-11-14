import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import { StorageService } from './storage.service';
import { db } from './db';
import { Spellbook, CreateSpellbookInput, UpdateSpellbookInput } from '../types/spellbook';
import 'fake-indexeddb/auto';

// Mock crypto.randomUUID for consistent test IDs
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'test-uuid-123'),
});

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(async () => {
    service = new StorageService();
    // Clear the database before each test
    await db.spellbooks.clear();
  });

  describe('createSpellbook', () => {
    it('should create a new spellbook with generated ID', async () => {
      const input: CreateSpellbookInput = { name: 'My Spellbook' };

      const spellbook = await service.createSpellbook(input);

      expect(spellbook.id).toBe('test-uuid-123');
      expect(spellbook.name).toBe('My Spellbook');
      expect(spellbook.spells).toEqual([]);
      expect(spellbook.created).toBeDefined();
      expect(spellbook.updated).toBeDefined();
    });

    it('should save spellbook to database', async () => {
      const input: CreateSpellbookInput = { name: 'My Spellbook' };

      await service.createSpellbook(input);

      const saved = await db.spellbooks.get('test-uuid-123');
      expect(saved).toBeDefined();
      expect(saved?.name).toBe('My Spellbook');
    });
  });

  describe('getSpellbooks', () => {
    it('should return empty array when no spellbooks exist', async () => {
      const spellbooks = await service.getSpellbooks();

      expect(spellbooks).toEqual([]);
    });

    it('should return all spellbooks', async () => {
      await service.createSpellbook({ name: 'Spellbook 1' });
      await service.createSpellbook({ name: 'Spellbook 2' });

      const spellbooks = await service.getSpellbooks();

      expect(spellbooks).toHaveLength(2);
      expect(spellbooks[0].name).toBe('Spellbook 1');
      expect(spellbooks[1].name).toBe('Spellbook 2');
    });
  });

  describe('getSpellbook', () => {
    it('should return undefined for non-existent spellbook', async () => {
      const spellbook = await service.getSpellbook('non-existent');

      expect(spellbook).toBeUndefined();
    });

    it('should return spellbook by ID', async () => {
      const created = await service.createSpellbook({ name: 'Test Spellbook' });

      const found = await service.getSpellbook(created.id);

      expect(found).toBeDefined();
      expect(found?.name).toBe('Test Spellbook');
    });
  });

  describe('updateSpellbook', () => {
    it('should update spellbook name', async () => {
      const created = await service.createSpellbook({ name: 'Old Name' });

      await service.updateSpellbook(created.id, { name: 'New Name' });

      const updated = await service.getSpellbook(created.id);
      expect(updated?.name).toBe('New Name');
    });

    it('should update the updated timestamp', async () => {
      const created = await service.createSpellbook({ name: 'Test' });
      const originalUpdated = created.updated;

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      await service.updateSpellbook(created.id, { name: 'Updated' });

      const updated = await service.getSpellbook(created.id);
      expect(updated?.updated).not.toBe(originalUpdated);
    });
  });

  describe('deleteSpellbook', () => {
    it('should delete spellbook by ID', async () => {
      const created = await service.createSpellbook({ name: 'To Delete' });

      await service.deleteSpellbook(created.id);

      const found = await service.getSpellbook(created.id);
      expect(found).toBeUndefined();
    });

    it('should not throw error when deleting non-existent spellbook', async () => {
      await expect(service.deleteSpellbook('non-existent')).resolves.not.toThrow();
    });
  });

  describe('addSpellToSpellbook', () => {
    it('should add spell to spellbook', async () => {
      const spellbook = await service.createSpellbook({ name: 'Test' });

      await service.addSpellToSpellbook(spellbook.id, 'fireball');

      const updated = await service.getSpellbook(spellbook.id);
      expect(updated?.spells).toHaveLength(1);
      expect(updated?.spells[0].spellId).toBe('fireball');
      expect(updated?.spells[0].prepared).toBe(false);
      expect(updated?.spells[0].notes).toBe('');
    });

    it('should not add duplicate spell', async () => {
      const spellbook = await service.createSpellbook({ name: 'Test' });

      await service.addSpellToSpellbook(spellbook.id, 'fireball');
      await service.addSpellToSpellbook(spellbook.id, 'fireball');

      const updated = await service.getSpellbook(spellbook.id);
      expect(updated?.spells).toHaveLength(1);
    });

    it('should throw error for non-existent spellbook', async () => {
      await expect(
        service.addSpellToSpellbook('non-existent', 'fireball')
      ).rejects.toThrow('Spellbook non-existent not found');
    });
  });

  describe('removeSpellFromSpellbook', () => {
    it('should remove spell from spellbook', async () => {
      const spellbook = await service.createSpellbook({ name: 'Test' });
      await service.addSpellToSpellbook(spellbook.id, 'fireball');
      await service.addSpellToSpellbook(spellbook.id, 'lightning-bolt');

      await service.removeSpellFromSpellbook(spellbook.id, 'fireball');

      const updated = await service.getSpellbook(spellbook.id);
      expect(updated?.spells).toHaveLength(1);
      expect(updated?.spells[0].spellId).toBe('lightning-bolt');
    });

    it('should throw error for non-existent spellbook', async () => {
      await expect(
        service.removeSpellFromSpellbook('non-existent', 'fireball')
      ).rejects.toThrow('Spellbook non-existent not found');
    });
  });

  describe('toggleSpellPrepared', () => {
    it('should toggle spell prepared status to true', async () => {
      const spellbook = await service.createSpellbook({ name: 'Test' });
      await service.addSpellToSpellbook(spellbook.id, 'fireball');

      await service.toggleSpellPrepared(spellbook.id, 'fireball');

      const updated = await service.getSpellbook(spellbook.id);
      expect(updated?.spells[0].prepared).toBe(true);
    });

    it('should toggle spell prepared status to false', async () => {
      const spellbook = await service.createSpellbook({ name: 'Test' });
      await service.addSpellToSpellbook(spellbook.id, 'fireball');
      await service.toggleSpellPrepared(spellbook.id, 'fireball');

      await service.toggleSpellPrepared(spellbook.id, 'fireball');

      const updated = await service.getSpellbook(spellbook.id);
      expect(updated?.spells[0].prepared).toBe(false);
    });

    it('should only toggle the specified spell', async () => {
      const spellbook = await service.createSpellbook({ name: 'Test' });
      await service.addSpellToSpellbook(spellbook.id, 'fireball');
      await service.addSpellToSpellbook(spellbook.id, 'lightning-bolt');

      await service.toggleSpellPrepared(spellbook.id, 'fireball');

      const updated = await service.getSpellbook(spellbook.id);
      expect(updated?.spells[0].prepared).toBe(true);
      expect(updated?.spells[1].prepared).toBe(false);
    });

    it('should throw error for non-existent spellbook', async () => {
      await expect(
        service.toggleSpellPrepared('non-existent', 'fireball')
      ).rejects.toThrow('Spellbook non-existent not found');
    });
  });

  describe('updateSpellNotes', () => {
    it('should update spell notes', async () => {
      const spellbook = await service.createSpellbook({ name: 'Test' });
      await service.addSpellToSpellbook(spellbook.id, 'fireball');

      await service.updateSpellNotes(spellbook.id, 'fireball', 'Use sparingly in taverns');

      const updated = await service.getSpellbook(spellbook.id);
      expect(updated?.spells[0].notes).toBe('Use sparingly in taverns');
    });

    it('should only update the specified spell', async () => {
      const spellbook = await service.createSpellbook({ name: 'Test' });
      await service.addSpellToSpellbook(spellbook.id, 'fireball');
      await service.addSpellToSpellbook(spellbook.id, 'lightning-bolt');

      await service.updateSpellNotes(spellbook.id, 'fireball', 'Test note');

      const updated = await service.getSpellbook(spellbook.id);
      expect(updated?.spells[0].notes).toBe('Test note');
      expect(updated?.spells[1].notes).toBe('');
    });

    it('should throw error for non-existent spellbook', async () => {
      await expect(
        service.updateSpellNotes('non-existent', 'fireball', 'note')
      ).rejects.toThrow('Spellbook non-existent not found');
    });
  });

  describe('exportData', () => {
    it('should export empty data', async () => {
      const json = await service.exportData();
      const data = JSON.parse(json);

      expect(data.version).toBe('1.0');
      expect(data.exportDate).toBeDefined();
      expect(data.spellbooks).toEqual([]);
    });

    it('should export all spellbooks', async () => {
      await service.createSpellbook({ name: 'Spellbook 1' });
      await service.createSpellbook({ name: 'Spellbook 2' });

      const json = await service.exportData();
      const data = JSON.parse(json);

      expect(data.spellbooks).toHaveLength(2);
      expect(data.spellbooks[0].name).toBe('Spellbook 1');
      expect(data.spellbooks[1].name).toBe('Spellbook 2');
    });

    it('should include spell data in export', async () => {
      const spellbook = await service.createSpellbook({ name: 'Test' });
      await service.addSpellToSpellbook(spellbook.id, 'fireball');

      const json = await service.exportData();
      const data = JSON.parse(json);

      expect(data.spellbooks[0].spells).toHaveLength(1);
      expect(data.spellbooks[0].spells[0].spellId).toBe('fireball');
    });
  });

  describe('importData', () => {
    it('should import spellbooks', async () => {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        spellbooks: [
          {
            id: 'import-1',
            name: 'Imported Spellbook',
            spells: [],
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          },
        ],
      };

      await service.importData(JSON.stringify(exportData));

      const spellbooks = await service.getSpellbooks();
      expect(spellbooks).toHaveLength(1);
      expect(spellbooks[0].name).toBe('Imported Spellbook');
    });

    it('should merge with existing spellbooks by default', async () => {
      await service.createSpellbook({ name: 'Existing' });

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        spellbooks: [
          {
            id: 'import-1',
            name: 'Imported',
            spells: [],
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          },
        ],
      };

      await service.importData(JSON.stringify(exportData));

      const spellbooks = await service.getSpellbooks();
      expect(spellbooks).toHaveLength(2);
    });

    it('should replace existing spellbooks when replace=true', async () => {
      await service.createSpellbook({ name: 'To Be Replaced' });

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        spellbooks: [
          {
            id: 'import-1',
            name: 'Imported',
            spells: [],
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          },
        ],
      };

      await service.importData(JSON.stringify(exportData), true);

      const spellbooks = await service.getSpellbooks();
      expect(spellbooks).toHaveLength(1);
      expect(spellbooks[0].name).toBe('Imported');
    });

    it('should throw error for invalid JSON', async () => {
      await expect(
        service.importData('invalid json')
      ).rejects.toThrow('Failed to import data');
    });
  });
});
