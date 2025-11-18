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

import { useState, useEffect } from 'react';
import { useSpellbooks } from '../hooks/useSpellbooks';
import { spellService } from '../services/spell.service';
import { Spellbook } from '../types/spellbook';
import { useSpellSorting } from '../hooks/useSpellSorting';
import { SpellbookDetailView, EnrichedSpell } from './SpellbookDetailView';

interface SpellbookDetailProps {
  spellbookId: string;
  onBack: () => void;
}

export function SpellbookDetail({ spellbookId, onBack }: SpellbookDetailProps) {
  const { getSpellbook, togglePrepared, removeSpellFromSpellbook } = useSpellbooks();
  const [spellbook, setSpellbook] = useState<Spellbook | null>(null);
  const [enrichedSpells, setEnrichedSpells] = useState<EnrichedSpell[]>([]);
  const [expandedSpellId, setExpandedSpellId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; spellId: string; spellName: string }>({
    isOpen: false,
    spellId: '',
    spellName: '',
  });
  const { sortedData: sortedSpells, sortColumn, sortDirection, handleSort } = useSpellSorting(
    enrichedSpells,
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
      onBack={onBack}
      onSort={handleSort}
      onTogglePrepared={handleTogglePrepared}
      onRemoveSpell={handleRemoveSpell}
      onConfirmRemove={handleConfirmRemove}
      onCancelRemove={handleCancelRemove}
      onRowClick={handleRowClick}
    />
  );
}
