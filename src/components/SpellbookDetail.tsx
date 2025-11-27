/**
 * SpellbookDetail Component (Container)
 *
 * Container component that handles data fetching and business logic.
 * Delegates rendering to SpellbookDetailView (presentational component).
 *
 * Responsibilities:
 * - Data fetching (loading spellbook from storage)
 * - State management (spellbook data, UI state)
 * - Event handling (toggle prepared, remove spell, etc.)
 * - Business logic (enriching spells with full data)
 */

import { useState, useEffect, useMemo } from 'react';
import { useSpellbooks } from '../hooks/useSpellbooks';
import { spellService } from '../services/spell.service';
import { Spellbook, CreateSpellbookInput } from '../types/spellbook';
import { useSpellSorting } from '../hooks/useSpellSorting';
import { SpellbookDetailView, EnrichedSpell } from './SpellbookDetailView';

interface SpellbookDetailProps {
  spellbookId: string;
  onBack: () => void;
}

export function SpellbookDetail({ spellbookId, onBack }: SpellbookDetailProps) {
  const { spellbooks, getSpellbook, updateSpellbook, togglePrepared, removeSpellFromSpellbook } = useSpellbooks();
  const [spellbook, setSpellbook] = useState<Spellbook | null>(null);
  const [enrichedSpells, setEnrichedSpells] = useState<EnrichedSpell[]>([]);
  const [expandedSpellId, setExpandedSpellId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showPreparedOnly, setShowPreparedOnly] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; spellId: string; spellName: string }>({
    isOpen: false,
    spellId: '',
    spellName: '',
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

  const handleTogglePrepared = async (spellId: string) => {
    await togglePrepared(spellbookId, spellId);
    await loadSpellbook();
  };

  const handleRemoveSpell = (spellId: string, spellName: string) => {
    setConfirmDialog({ isOpen: true, spellId, spellName });
  };

  const handleConfirmRemove = async () => {
    await removeSpellFromSpellbook(spellbookId, confirmDialog.spellId);
    setConfirmDialog({ isOpen: false, spellId: '', spellName: '' });
    await loadSpellbook();
  };

  const handleCancelRemove = () => {
    setConfirmDialog({ isOpen: false, spellId: '', spellName: '' });
  };

  const handleRowClick = (spellId: string) => {
    // Toggle expanded state: if clicking the same spell, collapse it; otherwise expand new spell
    if (expandedSpellId === spellId) {
      setExpandedSpellId(null);
    } else {
      setExpandedSpellId(spellId);
    }
  };

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
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

  const handleToggleShowPreparedOnly = () => {
    setShowPreparedOnly(!showPreparedOnly);
  };

  const handleSelectAllPrepared = async () => {
    // Determine if we should select all or deselect all
    const allPrepared = enrichedSpells.every(s => s.prepared);

    // Toggle all spells
    for (const spell of enrichedSpells) {
      if (allPrepared && spell.prepared) {
        // If all are prepared, deselect all
        await togglePrepared(spellbookId, spell.spell.id);
      } else if (!allPrepared && !spell.prepared) {
        // If not all are prepared, select all unprepared
        await togglePrepared(spellbookId, spell.spell.id);
      }
    }

    await loadSpellbook();
  };

  // Delegate rendering to presentational component
  return (
    <SpellbookDetailView
      spellbook={spellbook}
      enrichedSpells={enrichedSpells}
      sortedSpells={sortedSpells}
      expandedSpellId={expandedSpellId}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      confirmDialog={confirmDialog}
      editModalOpen={editModalOpen}
      showPreparedOnly={showPreparedOnly}
      onBack={onBack}
      onSort={handleSort}
      onTogglePrepared={handleTogglePrepared}
      onRemoveSpell={handleRemoveSpell}
      onConfirmRemove={handleConfirmRemove}
      onCancelRemove={handleCancelRemove}
      onRowClick={handleRowClick}
      onEdit={handleEdit}
      onEditClose={handleEditClose}
      onEditSave={handleEditSave}
      onToggleShowPreparedOnly={handleToggleShowPreparedOnly}
      onSelectAllPrepared={handleSelectAllPrepared}
      existingNames={spellbooks.map(sb => sb.name)}
    />
  );
}
