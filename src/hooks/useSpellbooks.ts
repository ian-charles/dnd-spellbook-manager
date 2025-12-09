import { useEffect, useState } from 'react';
import { storageService } from '../services/storage.service';
import { Spellbook, CreateSpellbookInput, UpdateSpellbookInput } from '../types/spellbook';

/**
 * Hook to manage spellbooks
 */
export function useSpellbooks() {
  const [spellbooks, setSpellbooks] = useState<Spellbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSpellbooks = async () => {
    try {
      setLoading(true);
      const books = await storageService.getSpellbooks();
      setSpellbooks(books);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpellbooks();
  }, []);

  const createSpellbook = async (input: CreateSpellbookInput) => {
    try {
      const newBook = await storageService.createSpellbook(input);
      // Reload from storage to ensure we have the latest data
      await loadSpellbooks();

      return newBook;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateSpellbook = async (id: string, updates: UpdateSpellbookInput) => {
    try {
      await storageService.updateSpellbook(id, updates);
      await loadSpellbooks();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteSpellbook = async (id: string) => {
    try {
      await storageService.deleteSpellbook(id);
      // Reload from storage to ensure we have the latest data
      await loadSpellbooks();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const refreshSpellbooks = async () => {
    await loadSpellbooks();
  };

  const getSpellbook = async (id: string) => {
    return await storageService.getSpellbook(id);
  };

  const reloadSpellbook = async () => {
    await loadSpellbooks();
  };

  const addSpellToSpellbook = async (spellbookId: string, spellId: string) => {
    await storageService.addSpellToSpellbook(spellbookId, spellId);
    // Note: Don't reload here - caller should refresh after batch operations
    // to avoid race conditions when adding multiple spells in parallel
  };

  const addSpellsToSpellbook = async (spellbookId: string, spellIds: string[]) => {
    await storageService.addSpellsToSpellbook(spellbookId, spellIds);
  };

  const removeSpellFromSpellbook = async (spellbookId: string, spellId: string) => {
    await storageService.removeSpellFromSpellbook(spellbookId, spellId);
    await reloadSpellbook();
  };

  const togglePrepared = async (spellbookId: string, spellId: string) => {
    await storageService.toggleSpellPrepared(spellbookId, spellId);
    await reloadSpellbook();
  };

  const updateSpellNotes = async (spellbookId: string, spellId: string, notes: string) => {
    await storageService.updateSpellNotes(spellbookId, spellId, notes);
    await reloadSpellbook();
  };

  return {
    spellbooks,
    loading,
    error,
    createSpellbook,
    updateSpellbook,
    deleteSpellbook,
    refreshSpellbooks,
    getSpellbook,
    addSpellToSpellbook,
    addSpellsToSpellbook,
    removeSpellFromSpellbook,
    togglePrepared,
    updateSpellNotes,
  };
}
