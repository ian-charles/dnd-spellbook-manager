import { describe, it, expect, beforeEach, vi, beforeAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSpellbooks } from './useSpellbooks';
import { storageService } from '../services/storage.service';
import { db } from '../services/db';
import { Spellbook } from '../types/spellbook';

// Mock crypto.randomUUID to generate unique test IDs
let uuidCounter = 0;
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => `test-uuid-${++uuidCounter}`),
});

describe('useSpellbooks', () => {
  beforeAll(async () => {
    // Ensure database is open before running tests
    await db.open();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await db.spellbooks.clear();
    uuidCounter = 0;
  });

  afterEach(async () => {
    // Clean up after each test
    await db.spellbooks.clear();
  });

  describe('initial state', () => {
    it('should start with loading=true and empty spellbooks', async () => {
      const { result } = renderHook(() => useSpellbooks());

      expect(result.current.loading).toBe(true);
      expect(result.current.spellbooks).toEqual([]);
      expect(result.current.error).toBeNull();

      // Wait for the useEffect to complete to avoid act() warnings
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should load spellbooks on mount', async () => {
      await storageService.createSpellbook({ name: 'Test Spellbook' });

      const { result } = renderHook(() => useSpellbooks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.spellbooks).toHaveLength(1);
      expect(result.current.spellbooks[0].name).toBe('Test Spellbook');
    });
  });

  describe('createSpellbook', () => {
    it('should create a new spellbook', async () => {
      const { result } = renderHook(() => useSpellbooks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createSpellbook({ name: 'New Spellbook' });
      });

      // Wait for state to update
      await waitFor(() => {
        expect(result.current.spellbooks).toHaveLength(1);
      });

      expect(result.current.spellbooks[0].name).toBe('New Spellbook');
    });

    it('should update spellbooks list after creation', async () => {
      const { result } = renderHook(() => useSpellbooks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createSpellbook({ name: 'First' });
      });

      await waitFor(() => {
        expect(result.current.spellbooks).toHaveLength(1);
      });

      await act(async () => {
        await result.current.createSpellbook({ name: 'Second' });
      });

      await waitFor(() => {
        expect(result.current.spellbooks).toHaveLength(2);
      });

      expect(result.current.spellbooks[0].name).toBe('First');
      expect(result.current.spellbooks[1].name).toBe('Second');
    });
  });

  describe('deleteSpellbook', () => {
    it('should delete a spellbook', async () => {
      const created = await storageService.createSpellbook({ name: 'To Delete' });

      const { result } = renderHook(() => useSpellbooks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.spellbooks).toHaveLength(1);

      await act(async () => {
        await result.current.deleteSpellbook(created.id);
      });

      await waitFor(() => {
        expect(result.current.spellbooks).toHaveLength(0);
      });
    });

    it('should remove spellbook from list after deletion', async () => {
      await storageService.createSpellbook({ name: 'Keep' });
      const toDelete = await storageService.createSpellbook({ name: 'Delete' });

      const { result } = renderHook(() => useSpellbooks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.spellbooks).toHaveLength(2);

      await act(async () => {
        await result.current.deleteSpellbook(toDelete.id);
      });

      await waitFor(() => {
        expect(result.current.spellbooks).toHaveLength(1);
      });

      expect(result.current.spellbooks[0].name).toBe('Keep');
    });
  });

  describe('getSpellbook', () => {
    it('should return a spellbook by ID', async () => {
      const created = await storageService.createSpellbook({ name: 'Test' });

      const { result } = renderHook(() => useSpellbooks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const spellbook = await result.current.getSpellbook(created.id);

      expect(spellbook).toBeDefined();
      expect(spellbook?.name).toBe('Test');
    });

    it('should return undefined for non-existent spellbook', async () => {
      const { result } = renderHook(() => useSpellbooks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const spellbook = await result.current.getSpellbook('non-existent');

      expect(spellbook).toBeUndefined();
    });
  });

  describe('addSpellToSpellbook', () => {
    it('should add a spell to spellbook', async () => {
      const spellbook = await storageService.createSpellbook({ name: 'Test' });

      const { result } = renderHook(() => useSpellbooks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addSpellToSpellbook(spellbook.id, 'fireball');
      });

      // Should reload spellbooks after adding
      await waitFor(() => {
        const updated = result.current.spellbooks.find(sb => sb.id === spellbook.id);
        expect(updated?.spells).toHaveLength(1);
        expect(updated?.spells[0].spellId).toBe('fireball');
      });
    });

    it('should reload spellbooks after adding spell', async () => {
      const spellbook = await storageService.createSpellbook({ name: 'Test' });

      const { result } = renderHook(() => useSpellbooks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const beforeAdd = result.current.spellbooks.find(sb => sb.id === spellbook.id);
      expect(beforeAdd?.spells).toHaveLength(0);

      await act(async () => {
        await result.current.addSpellToSpellbook(spellbook.id, 'fireball');
      });

      await waitFor(() => {
        const afterAdd = result.current.spellbooks.find(sb => sb.id === spellbook.id);
        expect(afterAdd?.spells).toHaveLength(1);
      });
    });
  });

  describe('removeSpellFromSpellbook', () => {
    it('should remove a spell from spellbook', async () => {
      const spellbook = await storageService.createSpellbook({ name: 'Test' });
      await storageService.addSpellToSpellbook(spellbook.id, 'fireball');
      await storageService.addSpellToSpellbook(spellbook.id, 'lightning-bolt');

      const { result } = renderHook(() => useSpellbooks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.removeSpellFromSpellbook(spellbook.id, 'fireball');
      });

      await waitFor(() => {
        const updated = result.current.spellbooks.find(sb => sb.id === spellbook.id);
        expect(updated?.spells).toHaveLength(1);
        expect(updated?.spells[0].spellId).toBe('lightning-bolt');
      });
    });
  });

  describe('togglePrepared', () => {
    it('should toggle spell prepared status', async () => {
      const spellbook = await storageService.createSpellbook({ name: 'Test' });
      await storageService.addSpellToSpellbook(spellbook.id, 'fireball');

      const { result } = renderHook(() => useSpellbooks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Initially not prepared
      let updated = result.current.spellbooks.find(sb => sb.id === spellbook.id);
      expect(updated?.spells[0].prepared).toBe(false);

      await act(async () => {
        await result.current.togglePrepared(spellbook.id, 'fireball');
      });

      // Should be prepared after toggle
      await waitFor(() => {
        updated = result.current.spellbooks.find(sb => sb.id === spellbook.id);
        expect(updated?.spells[0].prepared).toBe(true);
      });
    });

    it('should toggle back to false', async () => {
      const spellbook = await storageService.createSpellbook({ name: 'Test' });
      await storageService.addSpellToSpellbook(spellbook.id, 'fireball');
      await storageService.toggleSpellPrepared(spellbook.id, 'fireball');

      const { result } = renderHook(() => useSpellbooks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Initially prepared
      let updated = result.current.spellbooks.find(sb => sb.id === spellbook.id);
      expect(updated?.spells[0].prepared).toBe(true);

      await act(async () => {
        await result.current.togglePrepared(spellbook.id, 'fireball');
      });

      // Should be unprepared after toggle
      await waitFor(() => {
        updated = result.current.spellbooks.find(sb => sb.id === spellbook.id);
        expect(updated?.spells[0].prepared).toBe(false);
      });
    });
  });

  describe('updateSpellNotes', () => {
    it('should update spell notes', async () => {
      const spellbook = await storageService.createSpellbook({ name: 'Test' });
      await storageService.addSpellToSpellbook(spellbook.id, 'fireball');

      const { result } = renderHook(() => useSpellbooks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateSpellNotes(spellbook.id, 'fireball', 'Use sparingly in taverns');
      });

      await waitFor(() => {
        const updated = result.current.spellbooks.find(sb => sb.id === spellbook.id);
        expect(updated?.spells[0].notes).toBe('Use sparingly in taverns');
      });
    });

    it('should reload spellbooks after updating notes', async () => {
      const spellbook = await storageService.createSpellbook({ name: 'Test' });
      await storageService.addSpellToSpellbook(spellbook.id, 'fireball');

      const { result } = renderHook(() => useSpellbooks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const beforeUpdate = result.current.spellbooks.find(sb => sb.id === spellbook.id);
      expect(beforeUpdate?.spells[0].notes).toBe('');

      await act(async () => {
        await result.current.updateSpellNotes(spellbook.id, 'fireball', 'New note');
      });

      await waitFor(() => {
        const afterUpdate = result.current.spellbooks.find(sb => sb.id === spellbook.id);
        expect(afterUpdate?.spells[0].notes).toBe('New note');
      });
    });
  });

  describe('refreshSpellbooks', () => {
    it('should reload spellbooks from storage', async () => {
      const { result } = renderHook(() => useSpellbooks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.spellbooks).toHaveLength(0);

      // Add spellbook directly to storage (bypassing hook)
      await storageService.createSpellbook({ name: 'Direct Addition' });

      // Spellbooks list should still be empty
      expect(result.current.spellbooks).toHaveLength(0);

      // Refresh should load new spellbook
      act(() => {
        result.current.refreshSpellbooks();
      });

      await waitFor(() => {
        expect(result.current.spellbooks).toHaveLength(1);
        expect(result.current.spellbooks[0].name).toBe('Direct Addition');
      });
    });
  });

  describe('error handling', () => {
    it('should set error on creation failure', async () => {
      const { result } = renderHook(() => useSpellbooks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Spy on storage service and make it throw
      const createSpy = vi.spyOn(storageService, 'createSpellbook');
      createSpy.mockRejectedValueOnce(new Error('Storage error'));

      await act(async () => {
        await expect(
          result.current.createSpellbook({ name: 'Will Fail' })
        ).rejects.toThrow('Storage error');
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      expect(result.current.error?.message).toBe('Storage error');

      createSpy.mockRestore();
    });

    it('should set error on deletion failure', async () => {
      const { result } = renderHook(() => useSpellbooks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Spy on storage service and make it throw
      const deleteSpy = vi.spyOn(storageService, 'deleteSpellbook');
      deleteSpy.mockRejectedValueOnce(new Error('Delete error'));

      await act(async () => {
        await expect(
          result.current.deleteSpellbook('some-id')
        ).rejects.toThrow('Delete error');
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      expect(result.current.error?.message).toBe('Delete error');

      deleteSpy.mockRestore();
    });
  });
});
