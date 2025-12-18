import { useState, useEffect, useMemo, useRef } from 'react';
import { useSpellbooks } from './useSpellbooks';
import { spellService } from '../services/spell.service';
import { Spellbook, CreateSpellbookInput, EnrichedSpell } from '../types/spellbook';
import { useSpellSorting } from './useSpellSorting';
import { useSpellbookFiltering } from './useSpellbookFiltering';
import { SpellbookDetailContextType } from '../types/spellbookDetail';

interface UseSpellbookDetailLogicProps {
    spellbookId: string;
    openEditModal?: boolean;
    onBack: () => void;
    onCopySpellbook?: (id: string) => void;
    onDeleteSpellbook?: () => void;
}

export function useSpellbookDetailLogic({
    spellbookId,
    openEditModal,
    onBack,
    onCopySpellbook,
    onDeleteSpellbook,
}: UseSpellbookDetailLogicProps): SpellbookDetailContextType {
    const { spellbooks, getSpellbook, createSpellbook, updateSpellbook, togglePrepared, removeSpellFromSpellbook, addSpellsToSpellbook, deleteSpellbook } = useSpellbooks();
    const [spellbook, setSpellbook] = useState<Spellbook | null>(null);
    const [enrichedSpells, setEnrichedSpells] = useState<EnrichedSpell[]>([]);
    const [modalSpellId, setModalSpellId] = useState<string | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [copyModalOpen, setCopyModalOpen] = useState(false);
    const [showPreparedOnly, setShowPreparedOnly] = useState(false);
    const [selectedSpellIds, setSelectedSpellIds] = useState<Set<string>>(new Set());
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; spellIds: string[]; message: string }>({
        isOpen: false,
        spellIds: [],
        message: '',
    });
    const [deleteSpellbookDialog, setDeleteSpellbookDialog] = useState<{ isOpen: boolean }>({
        isOpen: false,
    });

    // Apply search and advanced filters first
    const { filterReducer, filteredEnrichedSpells, schools, classes, sources } = useSpellbookFiltering(enrichedSpells);

    // Then apply prepared-only filter
    const filteredSpells = useMemo(() => {
        if (showPreparedOnly) {
            return filteredEnrichedSpells.filter(s => s.prepared);
        }
        return filteredEnrichedSpells;
    }, [filteredEnrichedSpells, showPreparedOnly]);

    const { sortedData: sortedSpells, sortColumn, sortDirection, handleSort } = useSpellSorting(
        filteredSpells,
        { getSpell: (item) => item.spell }
    );

    // Check if all selected spells are prepared
    const allPrepared = useMemo(() => {
        if (selectedSpellIds.size === 0) return false;
        const selectedSpells = enrichedSpells.filter(s => selectedSpellIds.has(s.spell.id));
        return selectedSpells.every(s => s.prepared);
    }, [selectedSpellIds, enrichedSpells]);

    useEffect(() => {
        loadSpellbook();
    }, [spellbookId]);

    // Clear selections when filters change
    const prevShowPreparedOnlyRef = useRef(showPreparedOnly);
    const prevFilterStateRef = useRef(filterReducer.state);
    useEffect(() => {
        // Check if showPreparedOnly changed
        const preparedChanged = prevShowPreparedOnlyRef.current !== showPreparedOnly;

        // Check if any search/filter changed
        const prevState = prevFilterStateRef.current;
        const currState = filterReducer.state;
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

        if ((preparedChanged || filtersChanged) && selectedSpellIds.size > 0) {
            setSelectedSpellIds(new Set());
        }

        prevShowPreparedOnlyRef.current = showPreparedOnly;
        prevFilterStateRef.current = currState;
    }, [showPreparedOnly, filterReducer.state, selectedSpellIds.size]);

    // Watch for changes in spellbooks array and update local state
    useEffect(() => {
        const updatedBook = spellbooks.find(sb => sb.id === spellbookId);
        if (updatedBook) {
            setSpellbook(updatedBook);

            // Enrich spells with full data
            const enriched: EnrichedSpell[] = updatedBook.spells
                .map((spellEntry) => {
                    const spell = spellService.getSpellById(spellEntry.spellId);
                    if (!spell) return null;

                    return {
                        spell,
                        prepared: spellEntry.prepared,
                        notes: spellEntry.notes || '',
                    };
                })
                .filter((entry): entry is EnrichedSpell => entry !== null);

            setEnrichedSpells(enriched);
        }
    }, [spellbooks, spellbookId]);

    // Open edit modal on mount if requested via URL query param
    const openEditModalHandledRef = useRef(false);
    useEffect(() => {
        if (openEditModal && !openEditModalHandledRef.current) {
            openEditModalHandledRef.current = true;
            setEditModalOpen(true);
            // Clear the query param from URL to avoid re-opening on navigation
            if (typeof window !== 'undefined') {
                const hash = window.location.hash;
                if (hash.includes('?edit=true')) {
                    window.location.hash = hash.replace('?edit=true', '');
                }
            }
        }
    }, [openEditModal]);

    const loadSpellbook = async () => {
        const sb = await getSpellbook(spellbookId);
        if (sb) {
            setSpellbook(sb);

            // Enrich spells with full data
            const enriched: EnrichedSpell[] = sb.spells
                .map((spellEntry) => {
                    const spell = spellService.getSpellById(spellEntry.spellId);
                    if (!spell) return null;

                    return {
                        spell,
                        prepared: spellEntry.prepared,
                        notes: spellEntry.notes || '',
                    };
                })
                .filter((entry): entry is EnrichedSpell => entry !== null);

            setEnrichedSpells(enriched);
        }
    };

    const handleToggleSelected = (spellId: string) => {
        setSelectedSpellIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(spellId)) {
                newSet.delete(spellId);
            } else {
                newSet.add(spellId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        const allSpellIds = new Set(enrichedSpells.map(s => s.spell.id));
        setSelectedSpellIds(allSpellIds);
    };

    const handleDeselectAll = () => {
        setSelectedSpellIds(new Set());
    };

    const handlePrepSelected = async () => {
        if (selectedSpellIds.size === 0) return;

        const selectedSpells = enrichedSpells.filter(s => selectedSpellIds.has(s.spell.id));
        const shouldPrep = !allPrepared;

        // Toggle prepared status for all selected spells
        const promises: Promise<void>[] = [];
        for (const enrichedSpell of selectedSpells) {
            // Only toggle if the spell doesn't already have the desired state
            if (enrichedSpell.prepared !== shouldPrep) {
                promises.push(togglePrepared(spellbookId, enrichedSpell.spell.id));
            }
        }

        await Promise.all(promises);
        await loadSpellbook();

        // Deselect all after prep/unprep completion
        setSelectedSpellIds(new Set());
    };

    const handleRemoveSelected = () => {
        if (selectedSpellIds.size === 0) return;

        const selectedSpells = enrichedSpells.filter(s => selectedSpellIds.has(s.spell.id));
        const spellNames = selectedSpells.map(s => s.spell.name).join(', ');
        const message = selectedSpells.length === 1
            ? `Are you sure you want to remove ${spellNames}?`
            : `Are you sure you want to remove ${selectedSpells.length} spells?`;

        setConfirmDialog({
            isOpen: true,
            spellIds: Array.from(selectedSpellIds),
            message,
        });
    };

    const handleRequestRemoveSpell = (spellId: string) => {
        const spell = enrichedSpells.find(s => s.spell.id === spellId);
        if (!spell) return;

        const message = `Are you sure you want to remove ${spell.spell.name}?`;

        setConfirmDialog({
            isOpen: true,
            spellIds: [spellId],
            message,
        });
    };

    const handleConfirmRemove = async () => {
        const promises: Promise<void>[] = [];
        for (const spellId of confirmDialog.spellIds) {
            promises.push(removeSpellFromSpellbook(spellbookId, spellId));
        }

        await Promise.all(promises);
        setConfirmDialog({ isOpen: false, spellIds: [], message: '' });
        setSelectedSpellIds(new Set());
        await loadSpellbook();
    };

    const handleCancelRemove = () => {
        setConfirmDialog({ isOpen: false, spellIds: [], message: '' });
    };

    const handleRowClick = (spellId: string) => {
        setModalSpellId(spellId);
    };

    const handleCloseModal = () => {
        setModalSpellId(null);
    };

    const handleEditSave = async (input: CreateSpellbookInput) => {
        await updateSpellbook(spellbookId, {
            name: input.name,
            spellcastingAbility: input.spellcastingAbility,
            spellAttackModifier: input.spellAttackModifier,
            spellSaveDC: input.spellSaveDC,
            maxSpellSlots: input.maxSpellSlots,
        });
        setEditModalOpen(false);
        await loadSpellbook();
    };

    const handleCopy = () => {
        setCopyModalOpen(true);
    };

    const handleCopySave = async (input: CreateSpellbookInput) => {
        // Create the new spellbook
        const newSpellbook = await createSpellbook(input);

        // Copy all spells from the current spellbook to the new one
        if (spellbook && spellbook.spells.length > 0) {
            const spellIds = spellbook.spells.map(s => s.spellId);
            await addSpellsToSpellbook(newSpellbook.id, spellIds);
        }

        setCopyModalOpen(false);

        // Navigate to the newly copied spellbook
        if (onCopySpellbook) {
            onCopySpellbook(newSpellbook.id);
        }
    };

    const handleRequestDelete = () => {
        setDeleteSpellbookDialog({ isOpen: true });
    };

    const handleConfirmDelete = async () => {
        await deleteSpellbook(spellbookId);
        setDeleteSpellbookDialog({ isOpen: false });
        if (onDeleteSpellbook) {
            await onDeleteSpellbook();
        }
    };

    const handleCancelDelete = () => {
        setDeleteSpellbookDialog({ isOpen: false });
    };

    const existingNames = spellbooks.map(sb => sb.name);

    return {
        spellbook,
        enrichedSpells,
        sortedSpells,
        expandedSpellId: null,
        modalSpellId,
        sortColumn,
        sortDirection,
        selectedSpellIds,
        confirmDialog,
        deleteSpellbookDialog,
        editModalOpen,
        copyModalOpen,
        showPreparedOnly,
        allPrepared,
        filterReducer,
        schools,
        classes,
        sources,
        onBack,
        onSort: handleSort,
        onToggleSelected: handleToggleSelected,
        onSelectAll: handleSelectAll,
        onDeselectAll: handleDeselectAll,
        onPrepSelected: handlePrepSelected,
        onRemoveSelected: handleRemoveSelected,
        onConfirmRemove: handleConfirmRemove,
        onCancelRemove: handleCancelRemove,
        onRowClick: handleRowClick,
        onCloseModal: handleCloseModal,
        onEdit: () => setEditModalOpen(true),
        onEditClose: () => setEditModalOpen(false),
        onEditSave: handleEditSave,
        onToggleShowPreparedOnly: () => setShowPreparedOnly(prev => !prev),
        onCopy: handleCopy,
        onCopyClose: () => setCopyModalOpen(false),
        onCopySave: handleCopySave,
        onTogglePrepared: togglePrepared,
        onRemoveSpell: removeSpellFromSpellbook,
        onRequestRemoveSpell: handleRequestRemoveSpell,
        onDelete: handleRequestDelete,
        onConfirmDelete: handleConfirmDelete,
        onCancelDelete: handleCancelDelete,
        existingNames,
    };
}
