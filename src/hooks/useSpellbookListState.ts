import { useState, useMemo } from 'react';
import { Spellbook } from '../types/spellbook';
import { SortColumn } from '../components/spellbook-list/SpellbookListTable';

type SortDirection = 'asc' | 'desc';

/**
 * Custom hook for managing spellbook list state (search, sort, filter).
 * 
 * Handles client-side filtering and sorting of spellbooks.
 * 
 * @param spellbooks - The list of spellbooks to filter and sort
 * @returns Object containing state and handlers for filtering and sorting:
 * - searchQuery: Current search query string
 * - setSearchQuery: Function to update search query
 * - sortColumn: Current column being sorted
 * - sortDirection: Current sort direction ('asc' or 'desc')
 * - handleSort: Function to handle column header clicks
 * - filteredAndSortedSpellbooks: Resulting list of spellbooks after filtering and sorting
 */
export function useSpellbookListState(spellbooks: Spellbook[]) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState<SortColumn>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const filteredAndSortedSpellbooks = useMemo(() => {
        // Filter by search query
        let filtered = spellbooks ?? [];
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = spellbooks.filter(sb =>
                sb.name.toLowerCase().includes(query)
            );
        }

        // Sort
        const sorted = [...filtered].sort((a, b) => {
            let aVal: string | number;
            let bVal: string | number;

            switch (sortColumn) {
                case 'name':
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                    break;
                case 'spells':
                    aVal = a.spells.length;
                    bVal = b.spells.length;
                    break;
                case 'ability':
                    aVal = a.spellcastingAbility || '';
                    bVal = b.spellcastingAbility || '';
                    break;
                case 'attack':
                    aVal = a.spellAttackModifier ?? (sortDirection === 'asc' ? Infinity : -Infinity);
                    bVal = b.spellAttackModifier ?? (sortDirection === 'asc' ? Infinity : -Infinity);
                    break;
                case 'saveDC':
                    aVal = a.spellSaveDC ?? (sortDirection === 'asc' ? Infinity : -Infinity);
                    bVal = b.spellSaveDC ?? (sortDirection === 'asc' ? Infinity : -Infinity);
                    break;
                case 'updated':
                    aVal = new Date(a.updated).getTime();
                    bVal = new Date(b.updated).getTime();
                    break;
                default:
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [spellbooks, searchQuery, sortColumn, sortDirection]);

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    return {
        searchQuery,
        setSearchQuery,
        sortColumn,
        sortDirection,
        handleSort,
        filteredAndSortedSpellbooks,
    };
}
