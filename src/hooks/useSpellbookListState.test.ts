import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSpellbookListState } from './useSpellbookListState';
import { Spellbook } from '../types/spellbook';

describe('useSpellbookListState', () => {
    const mockSpellbooks: Spellbook[] = [
        { id: '1', name: 'B Spellbook', spells: [], created: '', updated: '' },
        { id: '2', name: 'A Spellbook', spells: [], created: '', updated: '' },
    ];

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useSpellbookListState(mockSpellbooks));

        expect(result.current.searchQuery).toBe('');
        expect(result.current.sortColumn).toBe('name');
        expect(result.current.sortDirection).toBe('asc');
        expect(result.current.filteredAndSortedSpellbooks).toHaveLength(2);
    });

    it('should filter spellbooks by search query', () => {
        const { result } = renderHook(() => useSpellbookListState(mockSpellbooks));

        act(() => {
            result.current.setSearchQuery('A Spell');
        });

        expect(result.current.filteredAndSortedSpellbooks).toHaveLength(1);
        expect(result.current.filteredAndSortedSpellbooks[0].name).toBe('A Spellbook');
    });

    it('should sort spellbooks', () => {
        const { result } = renderHook(() => useSpellbookListState(mockSpellbooks));

        // Default sort is name asc
        expect(result.current.filteredAndSortedSpellbooks[0].name).toBe('A Spellbook');
        expect(result.current.filteredAndSortedSpellbooks[1].name).toBe('B Spellbook');

        act(() => {
            result.current.handleSort('name'); // Toggle to desc
        });

        expect(result.current.filteredAndSortedSpellbooks[0].name).toBe('B Spellbook');
        expect(result.current.filteredAndSortedSpellbooks[1].name).toBe('A Spellbook');
    });
    it('should handle empty spellbooks list', () => {
        const { result } = renderHook(() => useSpellbookListState([]));
        expect(result.current.filteredAndSortedSpellbooks).toHaveLength(0);
    });

    it('should handle search with no results', () => {
        const { result } = renderHook(() => useSpellbookListState(mockSpellbooks));
        act(() => {
            result.current.setSearchQuery('Nonexistent');
        });
        expect(result.current.filteredAndSortedSpellbooks).toHaveLength(0);
    });

    it('should sort by spell count', () => {
        const books = [
            { ...mockSpellbooks[0], spells: [1, 2] }, // 2 spells
            { ...mockSpellbooks[1], spells: [1] },    // 1 spell
        ] as any;
        const { result } = renderHook(() => useSpellbookListState(books));

        act(() => {
            result.current.handleSort('spells');
        });

        expect(result.current.filteredAndSortedSpellbooks[0].spells).toHaveLength(1);
        expect(result.current.filteredAndSortedSpellbooks[1].spells).toHaveLength(2);
    });

    it('should sort by updated date', () => {
        const books = [
            { ...mockSpellbooks[0], updated: '2024-01-02' },
            { ...mockSpellbooks[1], updated: '2024-01-01' },
        ];
        const { result } = renderHook(() => useSpellbookListState(books));

        act(() => {
            result.current.handleSort('updated');
        });

        expect(result.current.filteredAndSortedSpellbooks[0].updated).toBe('2024-01-01');
        expect(result.current.filteredAndSortedSpellbooks[1].updated).toBe('2024-01-02');
    });

    it('should handle null/undefined values in sort', () => {
        const books = [
            { ...mockSpellbooks[0], spellAttackModifier: null } as any,
            { ...mockSpellbooks[1], spellAttackModifier: 5 },
        ];
        const { result } = renderHook(() => useSpellbookListState(books));

        act(() => {
            result.current.handleSort('attack');
        });

        // Ascending: nulls last (Infinity)
        expect(result.current.filteredAndSortedSpellbooks[0].spellAttackModifier).toBe(5);
        expect(result.current.filteredAndSortedSpellbooks[1].spellAttackModifier).toBe(null);

        act(() => {
            result.current.handleSort('attack'); // Descending
        });

        // Descending: nulls last (-Infinity? No, logic says:
        // aVal = a.spellAttackModifier ?? (sortDirection === 'asc' ? Infinity : -Infinity);
        // If desc, null becomes -Infinity.
        // If aVal (-Inf) < bVal (5), return 1 (because desc logic: if a < b return 1).
        // So -Inf comes AFTER 5.
        // Wait: if aVal (-Inf) < bVal (5) -> return 1. So a is "greater" index than b. a comes after b.
        // So 5 comes first, then null.
        expect(result.current.filteredAndSortedSpellbooks[0].spellAttackModifier).toBe(5);
        expect(result.current.filteredAndSortedSpellbooks[1].spellAttackModifier).toBe(null);
    });
});
