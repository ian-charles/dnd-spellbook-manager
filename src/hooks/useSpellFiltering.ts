import { useState, useEffect } from 'react';
import { useFilterReducer } from './useFilterReducer';
import { spellService } from '../services/spell.service';
import { Spell, SpellFilters as Filters } from '../types/spell';

export function useSpellFiltering(spells: Spell[], loading: boolean) {
    const filterReducer = useFilterReducer();
    const { state: filterState } = filterReducer;
    const [filteredSpells, setFilteredSpells] = useState<Spell[]>([]);
    const [schools, setSchools] = useState<string[]>([]);
    const [classes, setClasses] = useState<string[]>([]);

    // Initialize schools and classes when spells load
    useEffect(() => {
        if (!loading && spells.length > 0) {
            setSchools(spellService.getSchools());
            setClasses(spellService.getClasses());
            setFilteredSpells(spells);
        }
    }, [spells, loading]);

    // Filter spells when filters change
    useEffect(() => {
        if (!loading && spells.length > 0) {
            const filters: Filters = {
                searchText: filterState.searchText,
                levelRange: filterState.levelRange,
                schools: filterState.selectedSchools.length > 0 ? filterState.selectedSchools : undefined,
                classes: filterState.selectedClasses.length > 0 ? filterState.selectedClasses : undefined,
                concentration: filterState.concentrationOnly || undefined,
                ritual: filterState.ritualOnly || undefined,
                componentVerbal: filterState.verbalOnly || undefined,
                componentSomatic: filterState.somaticOnly || undefined,
                componentMaterial: filterState.materialOnly || undefined,
            };
            const results = spellService.searchSpells(filters);
            setFilteredSpells(results);
        }
    }, [filterState, spells, loading]);

    return {
        filterReducer,
        filteredSpells,
        schools,
        classes,
    };
}
