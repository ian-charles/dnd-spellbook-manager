import { useEffect, useState } from 'react';
import { spellService } from '../services/spell.service';
import { Spell } from '../types/spell';

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
