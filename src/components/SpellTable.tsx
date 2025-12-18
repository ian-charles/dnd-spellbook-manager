
import { useState, useRef, useEffect } from 'react';
import { Spell } from '../types/spell';
import { SortIcon } from './SortIcon';
import { useSpellSorting, SortColumn, SortDirection } from '../hooks/useSpellSorting';
import { useLongPress } from '../hooks/useLongPress';
import { SpellTableRow } from './SpellTableRow';
import { SpellDetailModal } from './SpellDetailModal';
import './SpellTable.css';

interface SpellTableProps {
  spells: Spell[];
  selectedSpellIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  /** Optional external sort column (for syncing with MobileSortChips) */
  sortColumn?: SortColumn;
  /** Optional external sort direction (for syncing with MobileSortChips) */
  sortDirection?: SortDirection;
  /** Optional external sort handler (for syncing with MobileSortChips) */
  onSort?: (column: SortColumn) => void;
}

/**
 * SpellTable Component
 * 
 * Displays a list of spells in a responsive table format.
 * Supports sorting, filtering (via parent), and expansion of spell details.
 * 
 * Features:
 * - Responsive design: Table layout on desktop, card layout on mobile
 * - Sorting: Clickable headers for Name, Level, Time, School, Range, Duration
 * - Expansion: Click row to expand/collapse spell details
 * - Mobile optimization: Custom card layout with badges for classes/components
 * 
 * @param {Object} props - Component props
 * @param {Spell[]} props.spells - Array of spell objects to display
 * @param {Set<string>} [props.selectedSpellIds] - Set of selected spell IDs
 * @param {Function} [props.onSelectionChange] - Callback when selection changes
 */
export function SpellTable({
  spells,
  selectedSpellIds = new Set(),
  onSelectionChange,
  sortColumn: externalSortColumn,
  sortDirection: externalSortDirection,
  onSort: externalOnSort,
}: SpellTableProps) {
  const [modalSpellId, setModalSpellId] = useState<string | null>(null);
  const internalSort = useSpellSorting(spells);
  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  // Use external sort if provided, otherwise use internal
  const sortColumn = externalSortColumn ?? internalSort.sortColumn;
  const sortDirection = externalSortDirection ?? internalSort.sortDirection;
  const handleSort = externalOnSort ?? internalSort.handleSort;
  const sortedSpells = externalSortColumn ? spells : internalSort.sortedData;

  const handleRowClick = (spellId: string) => {
    setModalSpellId(spellId);
  };

  const handleCloseModal = () => {
    setModalSpellId(null);
  };

  // Reset modal state when spells list changes to prevent memory leaks/stale state
  // This happens when filtering or searching changes the list
  if (modalSpellId && !spells.find(s => s.id === modalSpellId)) {
    setModalSpellId(null);
  }

  const modalSpell = modalSpellId ? spells.find(s => s.id === modalSpellId) : null;

  // Calculate selection state for master checkbox
  const selectedCount = selectedSpellIds.size;
  const totalCount = spells.length;
  const allSelected = totalCount > 0 && selectedCount === totalCount;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  // Update master checkbox indeterminate state
  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleMasterCheckboxChange = () => {
    if (!onSelectionChange) return;

    if (allSelected) {
      // Deselect all visible spells (preserve hidden selections)
      const newSelection = new Set(selectedSpellIds);
      spells.forEach(spell => newSelection.delete(spell.id));
      onSelectionChange(newSelection);
    } else {
      // Select all visible spells (preserve hidden selections)
      const newSelection = new Set(selectedSpellIds);
      spells.forEach(spell => newSelection.add(spell.id));
      onSelectionChange(newSelection);
    }
  };

  const handleCheckboxToggle = (spellId: string) => {
    if (!onSelectionChange) return;

    const newSelection = new Set(selectedSpellIds);
    if (newSelection.has(spellId)) {
      newSelection.delete(spellId);
    } else {
      newSelection.add(spellId);
    }
    onSelectionChange(newSelection);
  };

  // Long-press handlers for mobile selection
  const pendingSpell = useRef<Spell | null>(null);

  const {
    onTouchStart: onTouchStartHook,
    onTouchMove,
    onTouchEnd
  } = useLongPress({
    onLongPress: () => {
      if (pendingSpell.current && onSelectionChange) {
        handleCheckboxToggle(pendingSpell.current.id);
      }
    }
  });

  const handleTouchStart = (e: React.TouchEvent, spell: Spell) => {
    pendingSpell.current = spell;
    onTouchStartHook(e);
  };

  if (spells.length === 0) {
    return (
      <div className="spell-table-empty">
        <p>No spells found matching your search criteria.</p>
      </div>
    );
  }

  return (
    <>
      <div className="spell-table-container">
        <table className="spell-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                {onSelectionChange && (
                  <input
                    type="checkbox"
                    ref={masterCheckboxRef}
                    checked={allSelected}
                    onChange={handleMasterCheckboxChange}
                    aria-label={allSelected ? "Deselect all spells" : "Select all spells"}
                    title={allSelected ? "Deselect all spells" : "Select all spells"}
                  />
                )}
              </th>
              <th className="sortable-header">
                <button onClick={() => handleSort('name')} className="sort-button">
                  Name
                  <SortIcon column="name" currentColumn={sortColumn} currentDirection={sortDirection} />
                </button>
              </th>
              <th className="sortable-header level-col">
                <button onClick={() => handleSort('level')} className="sort-button">
                  Level
                  <SortIcon column="level" currentColumn={sortColumn} currentDirection={sortDirection} />
                </button>
              </th>
              <th className="sortable-header time-col">
                <button onClick={() => handleSort('castingTime')} className="sort-button">
                  Cast Time
                  <SortIcon column="castingTime" currentColumn={sortColumn} currentDirection={sortDirection} />
                </button>
              </th>
              <th className="sortable-header range-col">
                <button onClick={() => handleSort('range')} className="sort-button">
                  Range
                  <SortIcon column="range" currentColumn={sortColumn} currentDirection={sortDirection} />
                </button>
              </th>
              <th className="sortable-header duration-col">
                <button onClick={() => handleSort('duration')} className="sort-button">
                  Duration
                  <SortIcon column="duration" currentColumn={sortColumn} currentDirection={sortDirection} />
                </button>
              </th>
              <th className="sortable-header school-col">
                <button onClick={() => handleSort('school')} className="sort-button">
                  School
                  <SortIcon column="school" currentColumn={sortColumn} currentDirection={sortDirection} />
                </button>
              </th>
              <th className="components-col">Comp.</th>
              <th className="classes-col">Classes</th>
              <th className="sortable-header source-col">
                <button onClick={() => handleSort('source')} className="sort-button">
                  Source
                  <SortIcon column="source" currentColumn={sortColumn} currentDirection={sortDirection} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedSpells.map((spell) => (
              <SpellTableRow
                key={spell.id}
                spell={spell}
                isSelected={selectedSpellIds.has(spell.id)}
                isExpanded={false}
                onSelectionChange={onSelectionChange}
                selectedSpellIds={selectedSpellIds}
                onRowClick={handleRowClick}
                onCheckboxToggle={handleCheckboxToggle}
                onTouchStartLongPress={(e) => handleTouchStart(e, spell)}
                onTouchMoveLongPress={onTouchMove}
                onTouchEndLongPress={onTouchEnd}
              />
            ))}
          </tbody>
        </table>
      </div>
      {modalSpell && (
        <SpellDetailModal
          spell={modalSpell}
          isOpen={true}
          onClose={handleCloseModal}
          isSelected={selectedSpellIds.has(modalSpell.id)}
          onToggleSelected={onSelectionChange ? handleCheckboxToggle : undefined}
        />
      )}
    </>
  );
}
