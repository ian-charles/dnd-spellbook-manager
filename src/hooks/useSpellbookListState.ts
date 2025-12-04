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
 * - `searchQuery`: Current search query string
 * - `setSearchQuery`: Function to update search query
 * - `sortColumn`: Current column being sorted
 * - `sortDirection`: Current sort direction ('asc' or 'desc')
 * - `handleSort`: Function to handle column header clicks
 * - `filteredAndSortedSpellbooks`: Resulting list of spellbooks after filtering and sorting
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

            // Secondary sort by name (always asc)
            return a.name.localeCompare(b.name);
        });

        return sorted;
    }, [spellbooks, searchQuery, sortColumn, sortDirection]);

    const handleSearch = (query: string) => {
        // Basic sanitization and length limit
        if (query.length > 100) {
            setSearchQuery(query.slice(0, 100));
        } else {
            setSearchQuery(query);
        }
    };

    const handleSort = (column: SortColumn) => {
        // Validate column exists in allowed values
        const validColumns: SortColumn[] = ['name', 'spells', 'ability', 'attack', 'saveDC', 'updated'];
        if (!validColumns.includes(column)) {
            console.warn(`Invalid sort column: ${column}`);
            return;
        }

        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    return {
        searchQuery,
        setSearchQuery: handleSearch,
        sortColumn,
        sortDirection,
        handleSort,
        filteredAndSortedSpellbooks,
    };
}
