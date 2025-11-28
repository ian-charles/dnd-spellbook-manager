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
});
