import { useState } from 'react';
import { Spell } from '../types/spell';
import { Spellbook, CreateSpellbookInput } from '../types/spellbook';
import { SpellFilters } from './SpellFilters';
import { SpellTable } from './SpellTable';
import { LoadingButton } from './LoadingButton';
import { CreateSpellbookModal } from './CreateSpellbookModal';
import { useSpellFiltering } from '../hooks/useSpellFiltering';
import { useSpellSelection } from '../hooks/useSpellSelection';
import { useSpellbookMutations } from '../hooks/useSpellbookMutations';

interface BrowseViewProps {
    spells: Spell[];
    spellbooks: Spellbook[];
    loading: boolean;
    addSpellToSpellbook: (spellbookId: string, spellId: string) => Promise<void>;
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
    addSpellToSpellbook,
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
    } = useSpellFiltering(spells, loading);

    // Selected spells state
    const {
        selectedSpellIds,
        setSelectedSpellIds,
        targetSpellbookId,
        setTargetSpellbookId,
    } = useSpellSelection();

    // Create spellbook modal state
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [pendingSpellIds, setPendingSpellIds] = useState<Set<string>>(new Set());

    // Mutation hook
    const {
        isAddingSpells,
        handleAddToSpellbook,
        handleCreateSpellbook,
    } = useSpellbookMutations({
        spellbooks,
        addSpellToSpellbook,
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

    return (
        <>
            <div className="browse-header">
                <p>
                    Browse {spells.length} spells • {filteredSpells.length} results
                    {selectedSpellIds.size > 0 && ` • ${selectedSpellIds.size} selected`}
                </p>
            </div>
            <SpellFilters
                {...filterReducer}
                schools={schools}
                classes={classes}
            />
            <div className="batch-add-container">
                <button
                    className="btn-secondary"
                    onClick={() => setSelectedSpellIds(new Set())}
                    data-testid="btn-unselect-all"
                    disabled={selectedSpellIds.size === 0}
                >
                    Unselect All
                </button>
                <select
                    className="spellbook-dropdown"
                    value={targetSpellbookId}
                    onChange={(e) => setTargetSpellbookId(e.target.value)}
                    data-testid="spellbook-dropdown"
                >
                    <option value="">Select a spellbook...</option>
                    <option value="new">+ Create New Spellbook</option>
                    {spellbooks.map((spellbook) => (
                        <option key={spellbook.id} value={spellbook.id}>
                            {spellbook.name} ({spellbook.spells.length} spells)
                        </option>
                    ))}
                </select>
                <LoadingButton
                    className="btn-primary"
                    onClick={handleAddToSpellbook}
                    data-testid="btn-add-selected"
                    disabled={selectedSpellIds.size === 0 || !targetSpellbookId}
                    loading={isAddingSpells}
                    loadingText="Adding..."
                >
                    Add {selectedSpellIds.size} {selectedSpellIds.size === 1 ? 'Spell' : 'Spells'}
                </LoadingButton>
            </div>
            <SpellTable
                spells={filteredSpells}
                selectedSpellIds={selectedSpellIds}
                onSelectionChange={setSelectedSpellIds}
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
