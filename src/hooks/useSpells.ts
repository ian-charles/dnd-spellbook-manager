import { useEffect, useState } from 'react';
import { spellService } from '../services/spell.service';
import { Spell, SpellFilters } from '../types/spell';

/**
 * Hook to load and access spell data
 */
export function useSpells() {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadSpells() {
      try {
        setLoading(true);
        await spellService.loadSpells();
        setSpells(spellService.getAllSpells());
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    loadSpells();
  }, []);

  return { spells, loading, error };
}

/**
 * Hook to search spells with filters
 */
export function useSpellSearch(filters: SpellFilters) {
  const { spells, loading, error } = useSpells();
  const [results, setResults] = useState<Spell[]>([]);

  useEffect(() => {
    if (!loading && spells.length > 0) {
      const filtered = spellService.searchSpells(filters);
      setResults(filtered);
    }
  }, [spells, loading, filters]);

  return { results, loading, error };
}

/**
 * Hook to get a single spell by ID
 */
export function useSpell(spellId: string | undefined) {
  const { spells, loading, error } = useSpells();
  const [spell, setSpell] = useState<Spell | undefined>();

  useEffect(() => {
    if (!loading && spellId) {
      const found = spellService.getSpellById(spellId);
      setSpell(found);
    }
  }, [spells, loading, spellId]);

  return { spell, loading, error };
}
