import { useState } from 'react';
import { Spell } from '../types/spell';
import { ExpandableSpellRow } from './ExpandableSpellRow';
import { SortIcon } from './SortIcon';
import { useSpellSorting } from '../hooks/useSpellSorting';
import { getLevelText, getComponentsText, filterClasses } from '../utils/spellFormatters';
import './SpellTable.css';

interface SpellTableProps {
  spells: Spell[];
  onSpellClick?: (spell: Spell) => void;
  onAddToSpellbook?: (spellId: string) => void;
}

export function SpellTable({ spells, onSpellClick, onAddToSpellbook }: SpellTableProps) {
  const [expandedSpellId, setExpandedSpellId] = useState<string | null>(null);
  const { sortedData: sortedSpells, sortColumn, sortDirection, handleSort } = useSpellSorting(spells);

  const handleRowClick = (spellId: string) => {
    // Toggle expanded state: if clicking the same spell, collapse it; otherwise expand new spell
    if (expandedSpellId === spellId) {
      setExpandedSpellId(null);
    } else {
      setExpandedSpellId(spellId);
    }
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
            <th onClick={() => handleSort('name')} className="sortable">
              <div className="th-content">
                Spell Name
                <SortIcon column="name" currentColumn={sortColumn} currentDirection={sortDirection} />
              </div>
            </th>
            <th onClick={() => handleSort('level')} className="sortable level-col">
              <div className="th-content">
                Level
                <SortIcon column="level" currentColumn={sortColumn} currentDirection={sortDirection} />
              </div>
            </th>
            <th onClick={() => handleSort('school')} className="sortable">
              <div className="th-content">
                School
                <SortIcon column="school" currentColumn={sortColumn} currentDirection={sortDirection} />
              </div>
            </th>
            <th onClick={() => handleSort('castingTime')} className="sortable">
              <div className="th-content">
                Time
                <SortIcon column="castingTime" currentColumn={sortColumn} currentDirection={sortDirection} />
              </div>
            </th>
            <th onClick={() => handleSort('range')} className="sortable">
              <div className="th-content">
                Range
                <SortIcon column="range" currentColumn={sortColumn} currentDirection={sortDirection} />
              </div>
            </th>
            <th className="components-col">Comp.</th>
            <th onClick={() => handleSort('duration')} className="sortable">
              <div className="th-content">
                Duration
                <SortIcon column="duration" currentColumn={sortColumn} currentDirection={sortDirection} />
              </div>
            </th>
            <th>Classes</th>
            <th onClick={() => handleSort('source')} className="sortable">
              <div className="th-content">
                Source
                <SortIcon column="source" currentColumn={sortColumn} currentDirection={sortDirection} />
              </div>
            </th>
            {onAddToSpellbook && <th className="action-col">Action</th>}
          </tr>
        </thead>
        <tbody>
          {sortedSpells.map((spell) => (
            <>
              <tr
                key={spell.id}
                onClick={() => handleRowClick(spell.id)}
                className={`spell-row ${expandedSpellId === spell.id ? 'expanded' : ''}`}
              >
                <td className="spell-name">
                  {spell.name}
                  {spell.concentration && <span className="badge badge-concentration">C</span>}
                  {spell.ritual && <span className="badge badge-ritual">R</span>}
                </td>
                <td className="level-col">{getLevelText(spell.level)}</td>
                <td className="school-col">{spell.school}</td>
                <td>{spell.castingTime}</td>
                <td>{spell.range}</td>
                <td className="components-col">{getComponentsText(spell)}</td>
                <td>{spell.duration}</td>
                <td className="classes-col">{filterClasses(spell.classes).join(', ')}</td>
                <td className="source-col">{spell.source}</td>
                {onAddToSpellbook && (
                  <td className="action-col" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-add-small"
                      onClick={() => onAddToSpellbook(spell.id)}
                      data-testid="btn-add-spell"
                    >
                      +
                    </button>
                  </td>
                )}
              </tr>
              <ExpandableSpellRow
                key={`${spell.id}-expanded`}
                spell={spell}
                isExpanded={expandedSpellId === spell.id}
                colSpan={onAddToSpellbook ? 10 : 9}
              />
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
