
import { useState, Fragment } from 'react';
import { Spell } from '../types/spell';
import { SortIcon } from './SortIcon';
import { useSpellSorting } from '../hooks/useSpellSorting';
import { getLevelText } from '../utils/spellFormatters';
import { SpellDescription } from './SpellDescription';
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
                Time
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
            <th className="components-col">Comp.</th>
            <th className="sortable-header school-col">
              <button onClick={() => handleSort('school')} className="sort-button">
                School
                <SortIcon column="school" currentColumn={sortColumn} currentDirection={sortDirection} />
              </button>
            </th>
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
            <Fragment key={spell.id}>
              <tr
                onClick={() => handleRowClick(spell.id)}
                className={`spell-row ${expandedSpellId === spell.id ? 'expanded' : ''}`}
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
                    {spell.concentration && <span className="badge badge-concentration">C</span>}
                    {spell.ritual && <span className="badge badge-ritual">R</span>}
                  </div>
                </td>
                <td className="level-col">{getLevelText(spell.level)}</td>
                <td className="time-col">{spell.castingTime}</td>
                <td className="range-col">{spell.range}</td>
                <td className="duration-col">{spell.duration}</td>
                <td className="components-col"><ComponentBadges spell={spell} /></td>
                <td className="school-col">{spell.school}</td>
                <td className="classes-col"><ClassBadges classes={spell.classes} /></td>
                <td className="source-col">{spell.source}</td>
              </tr>
              {expandedSpellId === spell.id && (
                <tr key={`${spell.id}-expansion`} className="spell-expansion-row">
                  <td colSpan={onSelectionChange ? 10 : 9} className="spell-expansion-cell">
                    <div className="spell-inline-expansion">
                      <div className="spell-meta">
                        {getLevelText(spell.level)} {spell.school}
                        {spell.concentration && <span className="badge badge-concentration">Concentration</span>}
                        {spell.ritual && <span className="badge badge-ritual">Ritual</span>}
                      </div>
                      <div className="spell-expanded-details">
                        <div><strong>Casting Time:</strong> {spell.castingTime}</div>
                        <div><strong>Range:</strong> {spell.range}</div>
                        <div><strong>Duration:</strong> {spell.duration}</div>
                        <div className="spell-expanded-components">
                          <strong>Components:</strong>
                          <div className="expanded-badges-container">
                            <ComponentBadges spell={spell} />
                            {spell.materials && <span className="materials-text">({spell.materials})</span>}
                          </div>
                        </div>
                      </div>
                      <div className="spell-expanded-description">
                        {/* SpellDescription highlights dice notation (e.g., 1d6, 2d8) in spell text */}
                        <SpellDescription text={spell.description} />
                      </div>
                      {spell.higherLevels && (
                        <div className="spell-expanded-higher-levels">
                          {/* SpellDescription highlights dice notation (e.g., 1d6, 2d8) in spell text */}
                          <strong>At Higher Levels:</strong> <SpellDescription text={spell.higherLevels} />
                        </div>
                      )}
                      <div className="spell-expanded-footer">
                        <div className="spell-expanded-classes">
                          <strong>Classes:</strong>
                          <ClassBadges classes={spell.classes} />
                        </div>
                        <div className="spell-source">{spell.source}</div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
