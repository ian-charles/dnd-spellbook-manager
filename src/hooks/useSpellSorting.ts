import { useState, useMemo } from 'react';
import { Spell } from '../types/spell';

export type SortColumn = 'name' | 'level' | 'school' | 'castingTime' | 'range' | 'duration' | 'source';
export type SortDirection = 'asc' | 'desc';

interface UseSpellSortingOptions<T> {
  /** Initial column to sort by */
  initialColumn?: SortColumn;
  /** Initial sort direction */
  initialDirection?: SortDirection;
  /** Function to extract the Spell object from the data item */
  getSpell?: (item: T) => Spell;
}

/**
 * Custom hook for sorting spell data with column and direction state management.
 *
 * Supports sorting arrays of Spell objects or enriched spell objects (e.g., with prepared/notes data).
 *
 * @example
 * // For simple Spell arrays
 * const { sortedData, sortColumn, sortDirection, handleSort } = useSpellSorting(spells);
 *
 * @example
 * // For enriched spell objects
 * const { sortedData, sortColumn, sortDirection, handleSort } = useSpellSorting(
 *   enrichedSpells,
 *   { getSpell: (item) => item.spell }
 * );
 */
export function useSpellSorting<T = Spell>(
  data: T[],
  options: UseSpellSortingOptions<T> = {}
) {
  const {
    initialColumn = 'name',
    initialDirection = 'asc',
    getSpell = (item) => item as unknown as Spell,
  } = options;

  const [sortColumn, setSortColumn] = useState<SortColumn>(initialColumn);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const spellA = getSpell(a);
      const spellB = getSpell(b);

      let aVal: string | number;
      let bVal: string | number;

      switch (sortColumn) {
        case 'level':
          aVal = spellA.level;
          bVal = spellB.level;
          break;
        case 'name':
          aVal = spellA.name.toLowerCase();
          bVal = spellB.name.toLowerCase();
          break;
        case 'school':
          aVal = spellA.school.toLowerCase();
          bVal = spellB.school.toLowerCase();
          break;
        case 'castingTime':
          aVal = spellA.castingTime.toLowerCase();
          bVal = spellB.castingTime.toLowerCase();
          break;
        case 'range':
          aVal = spellA.range.toLowerCase();
          bVal = spellB.range.toLowerCase();
          break;
        case 'duration':
          aVal = spellA.duration.toLowerCase();
          bVal = spellB.duration.toLowerCase();
          break;
        case 'source':
          aVal = spellA.source.toLowerCase();
          bVal = spellB.source.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection, getSpell]);

  return {
    sortedData,
    sortColumn,
    sortDirection,
    handleSort,
  };
}
