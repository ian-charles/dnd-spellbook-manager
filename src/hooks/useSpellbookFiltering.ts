import { useState, useEffect } from 'react';
import { useFilterReducer } from './useFilterReducer';
import { EnrichedSpell } from '../types/spellbook';

export function useSpellbookFiltering(enrichedSpells: EnrichedSpell[]) {
    const filterReducer = useFilterReducer();
    const { state: filterState } = filterReducer;
    const [filteredEnrichedSpells, setFilteredEnrichedSpells] = useState<EnrichedSpell[]>(enrichedSpells);
    const [schools, setSchools] = useState<string[]>([]);
    const [classes, setClasses] = useState<string[]>([]);
    const [sources, setSources] = useState<string[]>([]);

    // Initialize schools, classes, and sources from spellbook spells only
    useEffect(() => {
        if (enrichedSpells.length > 0) {
            // Extract unique schools from spellbook spells
            const spellbookSchools = [...new Set(enrichedSpells.map(e => e.spell.school))].sort();
            setSchools(spellbookSchools);

            // Extract unique classes from spellbook spells
            const spellbookClasses = [...new Set(
                enrichedSpells.flatMap(e => e.spell.classes)
            )].sort();
            setClasses(spellbookClasses);

            // Extract unique sources from spellbook spells
            const spellbookSources = [...new Set(enrichedSpells.map(e => e.spell.source))].sort();
            setSources(spellbookSources);

            setFilteredEnrichedSpells(enrichedSpells);
        } else {
            setSchools([]);
            setClasses([]);
            setSources([]);
            setFilteredEnrichedSpells([]);
        }
    }, [enrichedSpells]);

    // Filter spells when filters change
    useEffect(() => {
        if (enrichedSpells.length > 0) {
            let results = enrichedSpells;

            // Text search by spell name only (case insensitive)
            if (filterState.searchText) {
                const searchLower = filterState.searchText.toLowerCase();
                results = results.filter((e) =>
                    e.spell.name.toLowerCase().includes(searchLower)
                );
            }

            // Filter by spell level range
            if (filterState.levelRange) {
                results = results.filter(
                    (e) =>
                        e.spell.level >= filterState.levelRange.min &&
                        e.spell.level <= filterState.levelRange.max
                );
            }

            // Filter by schools
            if (filterState.selectedSchools.length > 0) {
                results = results.filter((e) =>
                    filterState.selectedSchools.some(s => s.toLowerCase() === e.spell.school.toLowerCase())
                );
            }

            // Filter by classes
            if (filterState.selectedClasses.length > 0) {
                results = results.filter((e) =>
                    filterState.selectedClasses.some((filterClass) =>
                        e.spell.classes.some(c => c.toLowerCase() === filterClass.toLowerCase())
                    )
                );
            }

            // Filter by sources
            if (filterState.selectedSources.length > 0) {
                results = results.filter((e) =>
                    filterState.selectedSources.some(s => s.toLowerCase() === e.spell.source.toLowerCase())
                );
            }

            // Filter by concentration
            if (filterState.concentrationOnly) {
                results = results.filter((e) => e.spell.concentration === true);
            }

            // Filter by ritual
            if (filterState.ritualOnly) {
                results = results.filter((e) => e.spell.ritual === true);
            }

            // Filter by verbal component
            if (filterState.verbalOnly) {
                results = results.filter((e) => e.spell.components.verbal === true);
            }

            // Filter by somatic component
            if (filterState.somaticOnly) {
                results = results.filter((e) => e.spell.components.somatic === true);
            }

            // Filter by material component
            if (filterState.materialOnly) {
                results = results.filter((e) => e.spell.components.material !== undefined);
            }

            setFilteredEnrichedSpells(results);
        }
    }, [filterState, enrichedSpells]);

    return {
        filterReducer,
        filteredEnrichedSpells,
        schools,
        classes,
        sources,
    };
}
