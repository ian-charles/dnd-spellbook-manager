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
      console.log('[useSpellbooks] Loaded spellbooks:', books.length);
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
      console.log('[useSpellbooks] Creating spellbook:', input.name);
      const newBook = await storageService.createSpellbook(input);
      console.log('[useSpellbooks] Created spellbook:', newBook.id);
      // Reload from storage to ensure we have the latest data
      await loadSpellbooks();
      console.log('[useSpellbooks] Reloaded after create');
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

  const addSpellToSpellbook = async (spellbookId: string, spellId: string) => {
    await storageService.addSpellToSpellbook(spellbookId, spellId);
    await loadSpellbooks();
  };

  const removeSpellFromSpellbook = async (spellbookId: string, spellId: string) => {
    await storageService.removeSpellFromSpellbook(spellbookId, spellId);
    await loadSpellbooks();
  };

  const togglePrepared = async (spellbookId: string, spellId: string) => {
    await storageService.toggleSpellPrepared(spellbookId, spellId);
    await loadSpellbooks();
  };

  const updateSpellNotes = async (spellbookId: string, spellId: string, notes: string) => {
    await storageService.updateSpellNotes(spellbookId, spellId, notes);
    await loadSpellbooks();
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
    removeSpellFromSpellbook,
    togglePrepared,
    updateSpellNotes,
  };
}
