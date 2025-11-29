import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSpellFiltering } from './useSpellFiltering';
import { spellService } from '../services/spell.service';
import { useFilterReducer } from './useFilterReducer';

// Mock dependencies
vi.mock('../services/spell.service');
vi.mock('./useFilterReducer');

describe('useSpellFiltering', () => {
    const mockSpells = [
        { id: 'spell1', name: 'Fireball', level: 3, school: 'Evocation', classes: ['Wizard'] },
        { id: 'spell2', name: 'Cure Wounds', level: 1, school: 'Evocation', classes: ['Cleric'] },
    ] as any[];

    const mockFilterState = {
        searchText: '',
        levelRange: [0, 9],
        selectedSchools: [],
        selectedClasses: [],
        concentrationOnly: false,
        ritualOnly: false,
        verbalOnly: false,
        somaticOnly: false,
        materialOnly: false,
    };

    const mockDispatch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        (useFilterReducer as any).mockReturnValue({
            state: mockFilterState,
            dispatch: mockDispatch,
        });

        (spellService.getSchools as any).mockReturnValue(['Evocation', 'Illusion']);
        (spellService.getClasses as any).mockReturnValue(['Wizard', 'Cleric']);
        (spellService.searchSpells as any).mockImplementation(() => mockSpells);
    });

    it('should initialize schools and classes when spells load', async () => {
        const { result } = renderHook(() => useSpellFiltering(mockSpells, false));

        await waitFor(() => {
            expect(result.current.schools).toEqual(['Evocation', 'Illusion']);
            expect(result.current.classes).toEqual(['Wizard', 'Cleric']);
            expect(result.current.filteredSpells).toEqual(mockSpells);
        });
    });

    it('should not initialize if loading', () => {
        const { result } = renderHook(() => useSpellFiltering(mockSpells, true));

        expect(result.current.schools).toEqual([]);
        expect(result.current.classes).toEqual([]);
        expect(result.current.filteredSpells).toEqual([]);
    });

    it('should filter spells when filter state changes', async () => {
        const modifiedFilterState = { ...mockFilterState, searchText: 'Fire' };
        (useFilterReducer as any).mockReturnValue({
            state: modifiedFilterState,
            dispatch: mockDispatch,
        });

        const filteredResult = [mockSpells[0]];
        (spellService.searchSpells as any).mockReturnValue(filteredResult);

        const { result } = renderHook(() => useSpellFiltering(mockSpells, false));

        await waitFor(() => {
            expect(spellService.searchSpells).toHaveBeenCalledWith(expect.objectContaining({
                searchText: 'Fire',
            }));
            expect(result.current.filteredSpells).toEqual(filteredResult);
        });
    });

    it('should pass all filter options to searchSpells', async () => {
        const complexFilterState = {
            ...mockFilterState,
            selectedSchools: ['Evocation'],
            selectedClasses: ['Wizard'],
            concentrationOnly: true,
            ritualOnly: true,
            verbalOnly: true,
            somaticOnly: true,
            materialOnly: true,
        };

        (useFilterReducer as any).mockReturnValue({
            state: complexFilterState,
            dispatch: mockDispatch,
        });

        renderHook(() => useSpellFiltering(mockSpells, false));

        await waitFor(() => {
            expect(spellService.searchSpells).toHaveBeenCalledWith({
                searchText: '',
                levelRange: [0, 9],
                schools: ['Evocation'],
                classes: ['Wizard'],
                concentration: true,
                ritual: true,
                componentVerbal: true,
                componentSomatic: true,
                componentMaterial: true,
            });
        });
    });
});
