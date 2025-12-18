import { useState } from 'react';
import { Spell } from '../types/spell';
import { Spellbook, CreateSpellbookInput } from '../types/spellbook';
import { FilterModal } from './FilterModal';
import { SpellTable } from './SpellTable';
import { CreateSpellbookModal } from './CreateSpellbookModal';
import { SelectSpellbookModal } from './SelectSpellbookModal';
import { MobileSortChips } from './MobileSortChips';
import { useSpellFiltering } from '../hooks/useSpellFiltering';
import { useSpellSelection } from '../hooks/useSpellSelection';
import { useSpellbookMutations } from '../hooks/useSpellbookMutations';
import { useSpellSorting } from '../hooks/useSpellSorting';

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

    // Spell sorting state (lifted up for MobileSortChips sync)
    const {
        sortedData: sortedSpells,
        sortColumn,
        sortDirection,
        handleSort,
    } = useSpellSorting(filteredSpells);

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
    const [filterModalOpen, setFilterModalOpen] = useState(false);
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


    // Check if any filters are active
    const hasActiveFilters =
        filterReducer.state.searchText.length > 0 ||
        (filterReducer.state.levelRange.min !== 0 || filterReducer.state.levelRange.max !== 9) ||
        filterReducer.state.selectedSchools.length > 0 ||
        filterReducer.state.selectedClasses.length > 0 ||
        filterReducer.state.selectedSources.length > 0 ||
        filterReducer.state.concentrationOnly ||
        filterReducer.state.ritualOnly ||
        filterReducer.state.verbalOnly ||
        filterReducer.state.somaticOnly ||
        filterReducer.state.materialOnly;

    // Count active filters (excluding search text)
    const activeFilterCount = [
        filterReducer.state.selectedSchools.length > 0,
        filterReducer.state.selectedClasses.length > 0,
        filterReducer.state.selectedSources.length > 0,
        filterReducer.state.levelRange.min !== 0 || filterReducer.state.levelRange.max !== 9,
        filterReducer.state.concentrationOnly,
        filterReducer.state.ritualOnly,
        filterReducer.state.verbalOnly,
        filterReducer.state.somaticOnly,
        filterReducer.state.materialOnly,
    ].filter(Boolean).length;

    return (
        <>
            {/* Search Box - Always Visible */}
            <div className="search-box">
                <input
                    type="text"
                    placeholder="Search spells..."
                    value={filterReducer.state.searchText}
                    onChange={(e) => filterReducer.setSearchText(e.target.value)}
                    className="search-input"
                    aria-label="Search spells"
                />
            </div>

            <div className="browse-view-header" data-testid="spell-filters">
                <button
                    className="btn-secondary"
                    onClick={() => setFilterModalOpen(true)}
                    aria-label="Open filters"
                >
                    Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>
                <div className="filter-results-text">
                    Showing {filteredSpells.length} of {spells.length} spells
                </div>
                <button
                    className="btn-clear-filters"
                    onClick={filterReducer.clearFilters}
                    disabled={!hasActiveFilters}
                    aria-label="Clear all active filters"
                >
                    Clear Filters
                </button>
            </div>
            <div className="batch-add-container">
                <button
                    className="btn-secondary mobile-only-button"
                    onClick={() => {
                        const visibleSelectedCount = filteredSpells.filter(spell => selectedSpellIds.has(spell.id)).length;
                        const allVisibleSelected = visibleSelectedCount === filteredSpells.length && filteredSpells.length > 0;

                        if (allVisibleSelected) {
                            // Deselect all visible spells
                            const newSelection = new Set(selectedSpellIds);
                            filteredSpells.forEach(spell => newSelection.delete(spell.id));
                            setSelectedSpellIds(newSelection);
                        } else {
                            // Select all visible spells (preserve hidden selections)
                            const newSelection = new Set(selectedSpellIds);
                            filteredSpells.forEach(spell => newSelection.add(spell.id));
                            setSelectedSpellIds(newSelection);
                        }
                    }}
                    data-testid="btn-select-all-mobile"
                >
                    {(() => {
                        const visibleSelectedCount = filteredSpells.filter(spell => selectedSpellIds.has(spell.id)).length;
                        const allVisibleSelected = visibleSelectedCount === filteredSpells.length && filteredSpells.length > 0;
                        return allVisibleSelected ? 'Deselect All' : 'Select All';
                    })()}
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
            <MobileSortChips
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
            />
            <SpellTable
                spells={sortedSpells}
                selectedSpellIds={selectedSpellIds}
                onSelectionChange={setSelectedSpellIds}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
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

            {/* Filter Modal */}
            <FilterModal
                isOpen={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                {...filterReducer}
                schools={schools}
                classes={classes}
                sources={sources}
                filteredCount={filteredSpells.length}
                totalCount={spells.length}
                selectedCount={selectedSpellIds.size}
            />
        </>
    );
}
