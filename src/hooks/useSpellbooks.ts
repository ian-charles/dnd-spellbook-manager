import { useEffect, useState } from 'react';
import { storageService } from '../services/storage.service';
import { Spellbook, CreateSpellbookInput } from '../types/spellbook';

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
      setSpellbooks([...spellbooks, newBook]);
      return newBook;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteSpellbook = async (id: string) => {
    try {
      await storageService.deleteSpellbook(id);
      setSpellbooks(spellbooks.filter((book) => book.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const refreshSpellbooks = () => {
    loadSpellbooks();
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
    deleteSpellbook,
    refreshSpellbooks,
    getSpellbook,
    addSpellToSpellbook,
    removeSpellFromSpellbook,
    togglePrepared,
    updateSpellNotes,
  };
}
