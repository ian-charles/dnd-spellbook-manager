import { useState, useEffect, useMemo } from 'react';
import { useSpellbooks } from './useSpellbooks';
import { spellService } from '../services/spell.service';
import { Spellbook, CreateSpellbookInput, EnrichedSpell } from '../types/spellbook';
import { useSpellSorting } from './useSpellSorting';
import { SpellbookDetailContextType } from '../types/spellbookDetail';

interface UseSpellbookDetailLogicProps {
    spellbookId: string;
    onBack: () => void;
    onCopySpellbook?: (id: string) => void;
}

export function useSpellbookDetailLogic({
    spellbookId,
    onBack,
    onCopySpellbook,
}: UseSpellbookDetailLogicProps): SpellbookDetailContextType {
    const { spellbooks, getSpellbook, updateSpellbook, togglePrepared, removeSpellFromSpellbook } = useSpellbooks();
    const [spellbook, setSpellbook] = useState<Spellbook | null>(null);
    const [enrichedSpells, setEnrichedSpells] = useState<EnrichedSpell[]>([]);
    const [expandedSpellId, setExpandedSpellId] = useState<string | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [showPreparedOnly, setShowPreparedOnly] = useState(false);
    const [selectedSpellIds, setSelectedSpellIds] = useState<Set<string>>(new Set());
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; spellIds: string[]; message: string }>({
        isOpen: false,
        spellIds: [],
        message: '',
    });

    // Filter spells based on prepared status
    const filteredSpells = useMemo(() => {
        if (showPreparedOnly) {
            return enrichedSpells.filter(s => s.prepared);
        }
        return enrichedSpells;
    }, [enrichedSpells, showPreparedOnly]);

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
        // Toggle expanded state: if clicking the same spell, collapse it; otherwise expand new spell
        if (expandedSpellId === spellId) {
            setExpandedSpellId(null);
        } else {
            setExpandedSpellId(spellId);
        }
    };

    const handleEditSave = async (input: CreateSpellbookInput) => {
        await updateSpellbook(spellbookId, {
            name: input.name,
            spellcastingAbility: input.spellcastingAbility,
            spellAttackModifier: input.spellAttackModifier,
            spellSaveDC: input.spellSaveDC,
        });
        setEditModalOpen(false);
        await loadSpellbook();
    };

    const handleCopy = () => {
        if (onCopySpellbook) {
            onCopySpellbook(spellbookId);
        }
    };

    const existingNames = spellbooks.map(sb => sb.name);

    return {
        spellbook,
        enrichedSpells,
        sortedSpells,
        expandedSpellId,
        sortColumn,
        sortDirection,
        selectedSpellIds,
        confirmDialog,
        editModalOpen,
        showPreparedOnly,
        allPrepared,
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
        onEdit: () => setEditModalOpen(true),
        onEditClose: () => setEditModalOpen(false),
        onEditSave: handleEditSave,
        onToggleShowPreparedOnly: () => setShowPreparedOnly(prev => !prev),
        onCopy: handleCopy,
        existingNames,
    };
}
