/**
 * Unit tests for useSpellSorting hook
 *
 * Tests the sorting state management, direction toggling, and generic type handling
 * for spell data arrays.
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpellSorting } from './useSpellSorting';
import { Spell } from '../types/spell';

// Mock spell data for testing
const mockSpells: Spell[] = [
  {
    id: '1',
    name: 'Fireball',
    level: 3,
    school: 'evocation',
    castingTime: '1 action',
    range: '150 feet',
    duration: 'Instantaneous',
    components: { v: true, s: true, m: true },
    materials: 'A tiny ball of bat guano and sulfur',
    description: 'A bright streak flashes from your pointing finger',
    source: 'PHB',
    ritual: false,
    concentration: false,
    classes: ['wizard', 'sorcerer'],
  },
  {
    id: '2',
    name: 'Aid',
    level: 2,
    school: 'abjuration',
    castingTime: '1 action',
    range: '30 feet',
    duration: '8 hours',
    components: { v: true, s: true, m: true },
    materials: 'A tiny strip of white cloth',
    description: 'Your spell bolsters your allies with toughness and resolve',
    source: 'PHB',
    ritual: false,
    concentration: false,
    classes: ['cleric', 'paladin'],
  },
  {
    id: '3',
    name: 'Zone of Truth',
    level: 2,
    school: 'enchantment',
    castingTime: '1 action',
    range: '60 feet',
    duration: '10 minutes',
    components: { v: true, s: false, m: false },
    description: 'You create a magical zone that guards against deception',
    source: 'PHB',
    ritual: false,
    concentration: false,
    classes: ['bard', 'cleric', 'paladin'],
  },
];

// Enriched spell type for testing custom getSpell extractor
interface EnrichedSpell {
  spell: Spell;
  prepared: boolean;
  notes: string;
}

describe('useSpellSorting', () => {
  describe('default behavior', () => {
    it('should sort by name ascending by default', () => {
      const { result } = renderHook(() => useSpellSorting(mockSpells));

      expect(result.current.sortColumn).toBe('name');
      expect(result.current.sortDirection).toBe('asc');
      expect(result.current.sortedData[0].name).toBe('Aid');
      expect(result.current.sortedData[1].name).toBe('Fireball');
      expect(result.current.sortedData[2].name).toBe('Zone of Truth');
    });

    it('should use custom initial column', () => {
      const { result } = renderHook(() =>
        useSpellSorting(mockSpells, { initialColumn: 'level' })
      );

      expect(result.current.sortColumn).toBe('level');
      expect(result.current.sortDirection).toBe('asc');
    });

    it('should use custom initial direction', () => {
      const { result } = renderHook(() =>
        useSpellSorting(mockSpells, { initialDirection: 'desc' })
      );

      expect(result.current.sortColumn).toBe('name');
      expect(result.current.sortDirection).toBe('desc');
      expect(result.current.sortedData[0].name).toBe('Zone of Truth');
      expect(result.current.sortedData[1].name).toBe('Fireball');
      expect(result.current.sortedData[2].name).toBe('Aid');
    });
  });

  describe('sort direction toggling', () => {
    it('should toggle direction when clicking same column', () => {
      const { result } = renderHook(() => useSpellSorting(mockSpells));

      // Initially sorted by name ascending
      expect(result.current.sortDirection).toBe('asc');
      expect(result.current.sortedData[0].name).toBe('Aid');

      // Click name again - should toggle to descending
      act(() => {
        result.current.handleSort('name');
      });

      expect(result.current.sortColumn).toBe('name');
      expect(result.current.sortDirection).toBe('desc');
      expect(result.current.sortedData[0].name).toBe('Zone of Truth');
      expect(result.current.sortedData[2].name).toBe('Aid');

      // Click name again - should toggle back to ascending
      act(() => {
        result.current.handleSort('name');
      });

      expect(result.current.sortDirection).toBe('asc');
      expect(result.current.sortedData[0].name).toBe('Aid');
    });
  });

  describe('column switching', () => {
    it('should reset to ascending when switching to different column', () => {
      const { result } = renderHook(() => useSpellSorting(mockSpells));

      // Start with name descending
      act(() => {
        result.current.handleSort('name');
      });
      expect(result.current.sortDirection).toBe('desc');

      // Switch to level - should reset to ascending
      act(() => {
        result.current.handleSort('level');
      });

      expect(result.current.sortColumn).toBe('level');
      expect(result.current.sortDirection).toBe('asc');
      expect(result.current.sortedData[0].level).toBe(2);
      expect(result.current.sortedData[2].level).toBe(3);
    });

    it('should sort by school alphabetically', () => {
      const { result } = renderHook(() => useSpellSorting(mockSpells));

      act(() => {
        result.current.handleSort('school');
      });

      expect(result.current.sortColumn).toBe('school');
      expect(result.current.sortedData[0].school).toBe('abjuration');
      expect(result.current.sortedData[1].school).toBe('enchantment');
      expect(result.current.sortedData[2].school).toBe('evocation');
    });

    it('should sort by casting time tactically', () => {
      const { result } = renderHook(() => useSpellSorting(mockSpells));

      act(() => {
        result.current.handleSort('castingTime');
      });

      expect(result.current.sortColumn).toBe('castingTime');
      // All three spells have '1 action', so order should be stable by name
      expect(result.current.sortedData.every((s) => s.castingTime === '1 action')).toBe(true);
    });

    it('should sort by range tactically', () => {
      const { result } = renderHook(() => useSpellSorting(mockSpells));

      act(() => {
        result.current.handleSort('range');
      });

      expect(result.current.sortColumn).toBe('range');
      expect(result.current.sortedData[0].range).toBe('30 feet');
      expect(result.current.sortedData[1].range).toBe('60 feet');
      expect(result.current.sortedData[2].range).toBe('150 feet');
    });

    it('should sort by duration tactically', () => {
      const { result } = renderHook(() => useSpellSorting(mockSpells));

      act(() => {
        result.current.handleSort('duration');
      });

      expect(result.current.sortColumn).toBe('duration');
      expect(result.current.sortedData[0].duration).toBe('Instantaneous'); // 0 seconds
      expect(result.current.sortedData[1].duration).toBe('10 minutes'); // 600 seconds
      expect(result.current.sortedData[2].duration).toBe('8 hours'); // 28800 seconds
    });

    it('should sort by source alphabetically', () => {
      const { result } = renderHook(() => useSpellSorting(mockSpells));

      act(() => {
        result.current.handleSort('source');
      });

      expect(result.current.sortColumn).toBe('source');
      // All spells are from PHB, so order should be stable
      expect(result.current.sortedData.every((s) => s.source === 'PHB')).toBe(true);
    });
  });

  describe('custom getSpell extractor', () => {
    it('should work with enriched spell objects', () => {
      const enrichedSpells: EnrichedSpell[] = [
        { spell: mockSpells[0], prepared: true, notes: 'Damage dealer' },
        { spell: mockSpells[1], prepared: false, notes: 'Healing' },
        { spell: mockSpells[2], prepared: true, notes: 'Utility' },
      ];

      const { result } = renderHook(() =>
        useSpellSorting(enrichedSpells, {
          getSpell: (item) => item.spell,
        })
      );

      expect(result.current.sortedData[0].spell.name).toBe('Aid');
      expect(result.current.sortedData[1].spell.name).toBe('Fireball');
      expect(result.current.sortedData[2].spell.name).toBe('Zone of Truth');
    });

    it('should preserve enriched data in sorted results', () => {
      const enrichedSpells: EnrichedSpell[] = [
        { spell: mockSpells[0], prepared: true, notes: 'Damage dealer' },
        { spell: mockSpells[1], prepared: false, notes: 'Healing' },
        { spell: mockSpells[2], prepared: true, notes: 'Utility' },
      ];

      const { result } = renderHook(() =>
        useSpellSorting(enrichedSpells, {
          getSpell: (item) => item.spell,
        })
      );

      // Check that enriched data is preserved
      expect(result.current.sortedData[0].prepared).toBe(false); // Aid
      expect(result.current.sortedData[0].notes).toBe('Healing');
      expect(result.current.sortedData[1].prepared).toBe(true); // Fireball
      expect(result.current.sortedData[1].notes).toBe('Damage dealer');
    });

    it('should sort enriched objects by level correctly', () => {
      const enrichedSpells: EnrichedSpell[] = [
        { spell: mockSpells[0], prepared: true, notes: 'Damage dealer' },
        { spell: mockSpells[1], prepared: false, notes: 'Healing' },
        { spell: mockSpells[2], prepared: true, notes: 'Utility' },
      ];

      const { result } = renderHook(() =>
        useSpellSorting(enrichedSpells, {
          getSpell: (item) => item.spell,
        })
      );

      act(() => {
        result.current.handleSort('level');
      });

      expect(result.current.sortedData[0].spell.level).toBe(2);
      expect(result.current.sortedData[1].spell.level).toBe(2);
      expect(result.current.sortedData[2].spell.level).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle empty array', () => {
      const { result } = renderHook(() => useSpellSorting([]));

      expect(result.current.sortedData).toEqual([]);
      expect(result.current.sortColumn).toBe('name');
      expect(result.current.sortDirection).toBe('asc');

      // Should not crash when sorting empty array
      act(() => {
        result.current.handleSort('level');
      });

      expect(result.current.sortedData).toEqual([]);
    });

    it('should handle single item array', () => {
      const { result } = renderHook(() => useSpellSorting([mockSpells[0]]));

      expect(result.current.sortedData).toHaveLength(1);
      expect(result.current.sortedData[0].name).toBe('Fireball');

      // Should work correctly with single item
      act(() => {
        result.current.handleSort('level');
      });

      expect(result.current.sortedData).toHaveLength(1);
      expect(result.current.sortedData[0].name).toBe('Fireball');
    });

    it('should handle array with duplicate values', () => {
      const duplicateSpells = [
        { ...mockSpells[1], id: '4', name: 'Aid Copy' }, // Same level as Aid
        mockSpells[1], // Aid (level 2)
      ];

      const { result } = renderHook(() => useSpellSorting(duplicateSpells));

      act(() => {
        result.current.handleSort('level');
      });

      // Both should have level 2, sorted by name as secondary sort
      expect(result.current.sortedData[0].level).toBe(2);
      expect(result.current.sortedData[1].level).toBe(2);
      expect(result.current.sortedData[0].name).toBe('Aid'); // Alphabetically first
      expect(result.current.sortedData[1].name).toBe('Aid Copy');
    });

    it('should not mutate original array', () => {
      const originalSpells = [...mockSpells];
      const { result } = renderHook(() => useSpellSorting(mockSpells));

      act(() => {
        result.current.handleSort('name');
      });

      // Original array should remain unchanged
      expect(mockSpells[0].name).toBe(originalSpells[0].name);
      expect(mockSpells[1].name).toBe(originalSpells[1].name);
      expect(mockSpells[2].name).toBe(originalSpells[2].name);
    });
  });

  describe('secondary sort by name', () => {
    it('should use name as tiebreaker when sorting by level', () => {
      const spellsWithSameLevel = [
        mockSpells[1], // Aid (level 2)
        mockSpells[2], // Zone of Truth (level 2)
      ];

      const { result } = renderHook(() => useSpellSorting(spellsWithSameLevel));

      act(() => {
        result.current.handleSort('level');
      });

      // Both level 2, should be sorted alphabetically by name
      expect(result.current.sortedData[0].name).toBe('Aid');
      expect(result.current.sortedData[1].name).toBe('Zone of Truth');
    });

    it('should use name as tiebreaker when sorting by school', () => {
      const spellsWithSameSchool = [
        { ...mockSpells[0], id: '10', school: 'evocation', name: 'Zone of Fire' },
        { ...mockSpells[0], id: '11', school: 'evocation', name: 'Aid to Fire' },
        { ...mockSpells[0], id: '12', school: 'evocation', name: 'Fireball' },
      ];

      const { result } = renderHook(() => useSpellSorting(spellsWithSameSchool));

      act(() => {
        result.current.handleSort('school');
      });

      // All evocation, should be sorted alphabetically by name
      expect(result.current.sortedData[0].name).toBe('Aid to Fire');
      expect(result.current.sortedData[1].name).toBe('Fireball');
      expect(result.current.sortedData[2].name).toBe('Zone of Fire');
    });

    it('should use name as tiebreaker when sorting by range', () => {
      const spellsWithSameRange = [
        { ...mockSpells[0], id: '20', range: '30 feet', name: 'Zap' },
        { ...mockSpells[0], id: '21', range: '30 feet', name: 'Aid' },
        { ...mockSpells[0], id: '22', range: '30 feet', name: 'Magic Missile' },
      ];

      const { result } = renderHook(() => useSpellSorting(spellsWithSameRange));

      act(() => {
        result.current.handleSort('range');
      });

      // All 30 feet, should be sorted alphabetically by name
      expect(result.current.sortedData[0].name).toBe('Aid');
      expect(result.current.sortedData[1].name).toBe('Magic Missile');
      expect(result.current.sortedData[2].name).toBe('Zap');
    });

    it('should respect primary sort direction with secondary name sort', () => {
      const spellsWithSameLevel = [
        { ...mockSpells[1], id: '30', name: 'Zebra Spell' },
        mockSpells[1], // Aid
      ];

      const { result } = renderHook(() => useSpellSorting(spellsWithSameLevel));

      act(() => {
        result.current.handleSort('level');
      });

      // Ascending: Aid < Zebra Spell
      expect(result.current.sortedData[0].name).toBe('Aid');
      expect(result.current.sortedData[1].name).toBe('Zebra Spell');

      // Toggle to descending - primary sort reverses, but name is still alphabetical
      act(() => {
        result.current.handleSort('level');
      });

      // Descending by level (both level 2), but still alphabetically by name
      expect(result.current.sortedData[0].name).toBe('Aid');
      expect(result.current.sortedData[1].name).toBe('Zebra Spell');
    });
  });

  describe('reactive updates', () => {
    it('should update sorted data when input array changes', () => {
      const { result, rerender } = renderHook(
        ({ spells }) => useSpellSorting(spells),
        { initialProps: { spells: [mockSpells[0]] } }
      );

      expect(result.current.sortedData).toHaveLength(1);

      // Update with more spells
      rerender({ spells: mockSpells });

      expect(result.current.sortedData).toHaveLength(3);
      expect(result.current.sortedData[0].name).toBe('Aid');
    });

    it('should maintain sort state when data changes', () => {
      const { result, rerender } = renderHook(
        ({ spells }) => useSpellSorting(spells),
        { initialProps: { spells: mockSpells } }
      );

      // Sort by level
      act(() => {
        result.current.handleSort('level');
      });

      expect(result.current.sortColumn).toBe('level');

      // Update data
      const newSpells = [...mockSpells, { ...mockSpells[0], id: '4', level: 1 }];
      rerender({ spells: newSpells });

      // Should maintain level sorting
      expect(result.current.sortColumn).toBe('level');
      expect(result.current.sortedData[0].level).toBe(1);
    });
  });
});
