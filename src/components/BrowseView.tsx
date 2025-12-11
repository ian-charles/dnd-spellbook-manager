import { useState, useEffect, useRef } from 'react';
import { Spell } from '../types/spell';
import { Spellbook, CreateSpellbookInput } from '../types/spellbook';
import { SpellFilters } from './SpellFilters';
import { SpellTable } from './SpellTable';
import { CreateSpellbookModal } from './CreateSpellbookModal';
import { SelectSpellbookModal } from './SelectSpellbookModal';
import { useSpellFiltering } from '../hooks/useSpellFiltering';
import { useSpellSelection } from '../hooks/useSpellSelection';
import { useSpellbookMutations } from '../hooks/useSpellbookMutations';

interface BrowseViewProps {
    spells: Spell[];
    spellbooks: Spellbook[];
    loading: boolean;
    addSpellsToSpellbook: (spellbookId: string, spellIds: string[]) => Promise<void>;
    createSpellbook: (input: CreateSpellbookInput) => Promise<Spellbook>;
    refreshSpellbooks: () => Promise<void>;
    onSuccess: (message: string) => void;
    onError: (title: string, message: string) => void;
    onInfo: (title: string, message: string) => void;
}

export function BrowseView({
    spells,
    spellbooks,
    loading,
    addSpellsToSpellbook,
    createSpellbook,
    refreshSpellbooks,
    onSuccess,
    onError,
    onInfo,
}: BrowseViewProps) {
    // Spell filtering state
    const {
        filterReducer,
        filteredSpells,
        schools,
        classes,
        sources,
    } = useSpellFiltering(spells, loading);

    // Selected spells state
    const {
        selectedSpellIds,
        setSelectedSpellIds,
        targetSpellbookId,
        setTargetSpellbookId: _setTargetSpellbookId,
    } = useSpellSelection();

    // Modal state
    const [selectModalOpen, setSelectModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [pendingSpellIds, setPendingSpellIds] = useState<Set<string>>(new Set());

    // Mutation hook
    const {
        isAddingSpells: _isAddingSpells,
        handleAddToSpellbook,
        handleCreateSpellbook,
    } = useSpellbookMutations({
        spellbooks,
        addSpellsToSpellbook,
        createSpellbook,
        refreshSpellbooks,
        onSuccess,
        onError,
        onInfo,
        selectedSpellIds,
        setSelectedSpellIds,
        setCreateModalOpen,
        setPendingSpellIds,
        pendingSpellIds,
        targetSpellbookId,
    });

    // Track filter state to clear selections on filter change
    const filterStateRef = useRef(filterReducer.state);
    useEffect(() => {
        const prevState = filterStateRef.current;
        const currState = filterReducer.state;

        // Check if any filter has changed
        const filtersChanged =
            prevState.searchText !== currState.searchText ||
            JSON.stringify(prevState.levelRange) !== JSON.stringify(currState.levelRange) ||
            JSON.stringify(prevState.selectedSchools) !== JSON.stringify(currState.selectedSchools) ||
            JSON.stringify(prevState.selectedClasses) !== JSON.stringify(currState.selectedClasses) ||
            JSON.stringify(prevState.selectedSources) !== JSON.stringify(currState.selectedSources) ||
            prevState.concentrationOnly !== currState.concentrationOnly ||
            prevState.ritualOnly !== currState.ritualOnly ||
            prevState.verbalOnly !== currState.verbalOnly ||
            prevState.somaticOnly !== currState.somaticOnly ||
            prevState.materialOnly !== currState.materialOnly;

        if (filtersChanged && selectedSpellIds.size > 0) {
            setSelectedSpellIds(new Set());
        }

        filterStateRef.current = currState;
    }, [filterReducer.state, selectedSpellIds.size, setSelectedSpellIds]);

    return (
        <>
            <SpellFilters
                {...filterReducer}
                schools={schools}
                classes={classes}
                sources={sources}
                filteredCount={filteredSpells.length}
                totalCount={spells.length}
                selectedCount={selectedSpellIds.size}
            />
            <div className="batch-add-container">
                <button
                    className="btn-secondary mobile-only-button"
                    onClick={() => {
                        if (selectedSpellIds.size === filteredSpells.length && filteredSpells.length > 0) {
                            setSelectedSpellIds(new Set());
                        } else {
                            const allSpellIds = new Set(filteredSpells.map(spell => spell.id));
                            setSelectedSpellIds(allSpellIds);
                        }
                    }}
                    data-testid="btn-select-all-mobile"
                >
                    {selectedSpellIds.size === filteredSpells.length && filteredSpells.length > 0
                        ? 'Deselect All'
                        : 'Select All'}
                </button>
                <button
                    className="btn-primary"
                    onClick={() => setSelectModalOpen(true)}
                    data-testid="btn-add-selected"
                    disabled={selectedSpellIds.size === 0}
                >
                    Add {selectedSpellIds.size} {selectedSpellIds.size === 1 ? 'Spell' : 'Spells'}
                </button>
            </div>
            <SpellTable
                spells={filteredSpells}
                selectedSpellIds={selectedSpellIds}
                onSelectionChange={setSelectedSpellIds}
            />

            {/* Select Spellbook Modal */}
            <SelectSpellbookModal
                isOpen={selectModalOpen}
                onClose={() => setSelectModalOpen(false)}
                onSelectExisting={(spellbookId) => {
                    setSelectModalOpen(false);
                    handleAddToSpellbook(spellbookId);
                }}
                onCreateNew={() => {
                    setPendingSpellIds(new Set(selectedSpellIds));
                    setCreateModalOpen(true);
                }}
                spellbooks={spellbooks}
                spellCount={selectedSpellIds.size}
            />

            {/* Create Spellbook Modal */}
            <CreateSpellbookModal
                isOpen={createModalOpen}
                onClose={() => {
                    setCreateModalOpen(false);
                    setPendingSpellIds(new Set());
                }}
                onSubmit={handleCreateSpellbook}
                existingNames={spellbooks.map(sb => sb.name)}
            />
        </>
    );
}
