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

  return {
    spellbooks,
    loading,
    error,
    createSpellbook,
    deleteSpellbook,
    refreshSpellbooks,
  };
}

/**
 * Hook to manage a single spellbook
 */
export function useSpellbook(spellbookId: string | undefined) {
  const [spellbook, setSpellbook] = useState<Spellbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSpellbook = async () => {
    if (!spellbookId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const book = await storageService.getSpellbook(spellbookId);
      setSpellbook(book || null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpellbook();
  }, [spellbookId]);

  const addSpell = async (spellId: string) => {
    if (!spellbookId) return;

    try {
      await storageService.addSpellToSpellbook(spellbookId, spellId);
      await loadSpellbook();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const removeSpell = async (spellId: string) => {
    if (!spellbookId) return;

    try {
      await storageService.removeSpellFromSpellbook(spellbookId, spellId);
      await loadSpellbook();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const togglePrepared = async (spellId: string) => {
    if (!spellbookId) return;

    try {
      await storageService.toggleSpellPrepared(spellbookId, spellId);
      await loadSpellbook();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateNotes = async (spellId: string, notes: string) => {
    if (!spellbookId) return;

    try {
      await storageService.updateSpellNotes(spellbookId, spellId, notes);
      await loadSpellbook();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    spellbook,
    loading,
    error,
    addSpell,
    removeSpell,
    togglePrepared,
    updateNotes,
    refresh: loadSpellbook,
  };
}
