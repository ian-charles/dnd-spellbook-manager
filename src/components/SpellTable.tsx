
import { useState, Fragment, useRef } from 'react';
import { Spell } from '../types/spell';
import { SortIcon } from './SortIcon';
import { useSpellSorting } from '../hooks/useSpellSorting';
import { getLevelText, truncateCastingTime } from '../utils/spellFormatters';
import { SpellExpansionRow } from './SpellExpansionRow';
import { useLongPress } from '../hooks/useLongPress';
import './SpellTable.css';

import { ComponentBadges, ClassBadges } from './SpellBadges';

interface SpellTableProps {
  spells: Spell[];
  selectedSpellIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
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
  onSelectionChange
}: SpellTableProps) {
  const [expandedSpellId, setExpandedSpellId] = useState<string | null>(null);
  const { sortedData: sortedSpells, sortColumn, sortDirection, handleSort } = useSpellSorting(spells);

  const handleRowClick = (spellId: string) => {
    // Toggle expanded state: if clicking the same spell, collapse it; otherwise expand new spell
    setExpandedSpellId(expandedSpellId === spellId ? null : spellId);
  };

  // Reset expanded state when spells list changes to prevent memory leaks/stale state
  // This happens when filtering or searching changes the list
  if (expandedSpellId && !spells.find(s => s.id === expandedSpellId)) {
    setExpandedSpellId(null);
  }



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
    <div className="spell-table-container">
      <table className="spell-table">
        <thead>
          <tr>
            <th className="checkbox-col"></th>
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
          {sortedSpells.map((spell) => {
            const isSelected = selectedSpellIds.has(spell.id);
            return (
            <Fragment key={spell.id}>
              <tr
                onClick={() => handleRowClick(spell.id)}
                className={`spell-row ${isSelected ? 'selected-row' : ''} ${expandedSpellId === spell.id ? 'expanded' : ''}`}
                onTouchStart={(e) => handleTouchStart(e, spell)}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {onSelectionChange && (
                  <td className="checkbox-col" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedSpellIds.has(spell.id)}
                      onChange={() => handleCheckboxToggle(spell.id)}
                      data-testid="spell-checkbox"
                    />
                  </td>
                )}
                <td className="spell-name">
                  <div className="spell-name-header">
                    {spell.name}
                  </div>
                </td>
                <td className="level-col">{getLevelText(spell.level)}</td>
                <td className="time-col">
                  <span className="cell-content">
                    {truncateCastingTime(spell.castingTime)}
                    {spell.ritual && <span className="badge badge-ritual">R</span>}
                  </span>
                </td>
                <td className="range-col">{spell.range}</td>
                <td className="duration-col">
                  <span className="cell-content">
                    {spell.duration}
                    {spell.concentration && <span className="badge badge-concentration">C</span>}
                  </span>
                </td>
                <td className="school-col">{spell.school}</td>
                <td className="components-col"><ComponentBadges spell={spell} /></td>
                <td className="classes-col"><ClassBadges classes={spell.classes} /></td>
                <td className="source-col">{spell.source}</td>
              </tr>
              {expandedSpellId === spell.id && (
                <SpellExpansionRow
                  spell={spell}
                  colSpan={onSelectionChange ? 10 : 9}
                  variant="full"
                />
              )}
            </Fragment>
            );
          }
          )}
        </tbody>
      </table>
    </div>
  );
}
