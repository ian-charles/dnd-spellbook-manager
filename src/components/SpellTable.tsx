import { useState } from 'react';
import { Spell } from '../types/spell';
import { ExpandableSpellRow } from './ExpandableSpellRow';
import './SpellTable.css';

interface SpellTableProps {
  spells: Spell[];
  onSpellClick?: (spell: Spell) => void;
  onAddToSpellbook?: (spellId: string) => void;
}

type SortColumn = 'name' | 'level' | 'school' | 'castingTime' | 'range' | 'duration' | 'source';
type SortDirection = 'asc' | 'desc';

export function SpellTable({ spells, onSpellClick, onAddToSpellbook }: SpellTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedSpellId, setExpandedSpellId] = useState<string | null>(null);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortedSpells = () => {
    const sorted = [...spells].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortColumn) {
        case 'level':
          aVal = a.level;
          bVal = b.level;
          break;
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'school':
          aVal = a.school.toLowerCase();
          bVal = b.school.toLowerCase();
          break;
        case 'castingTime':
          aVal = a.castingTime.toLowerCase();
          bVal = b.castingTime.toLowerCase();
          break;
        case 'range':
          aVal = a.range.toLowerCase();
          bVal = b.range.toLowerCase();
          break;
        case 'duration':
          aVal = a.duration.toLowerCase();
          bVal = b.duration.toLowerCase();
          break;
        case 'source':
          aVal = a.source.toLowerCase();
          bVal = b.source.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const getLevelText = (level: number) => {
    if (level === 0) return 'Cantrip';
    return level.toString();
  };

  const getComponentsText = (spell: Spell) => {
    const parts: string[] = [];
    if (spell.components.verbal) parts.push('V');
    if (spell.components.somatic) parts.push('S');
    if (spell.components.material) parts.push('M');
    return parts.join(', ');
  };

  const filterClasses = (classes: string[]) => {
    return classes.filter(c => c.toLowerCase() !== 'ritual caster');
  };

  const handleRowClick = (spellId: string) => {
    // Toggle expanded state: if clicking the same spell, collapse it; otherwise expand new spell
    if (expandedSpellId === spellId) {
      setExpandedSpellId(null);
    } else {
      setExpandedSpellId(spellId);
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <span className="sort-icon">⇅</span>;
    }
    return <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  if (spells.length === 0) {
    return (
      <div className="spell-table-empty">
        <p>No spells found matching your search criteria.</p>
      </div>
    );
  }

  const sortedSpells = getSortedSpells();

  return (
    <div className="spell-table-container">
      <table className="spell-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('name')} className="sortable">
              <div className="th-content">
                Spell Name
                <SortIcon column="name" />
              </div>
            </th>
            <th onClick={() => handleSort('level')} className="sortable level-col">
              <div className="th-content">
                Level
                <SortIcon column="level" />
              </div>
            </th>
            <th onClick={() => handleSort('school')} className="sortable">
              <div className="th-content">
                School
                <SortIcon column="school" />
              </div>
            </th>
            <th onClick={() => handleSort('castingTime')} className="sortable">
              <div className="th-content">
                Time
                <SortIcon column="castingTime" />
              </div>
            </th>
            <th onClick={() => handleSort('range')} className="sortable">
              <div className="th-content">
                Range
                <SortIcon column="range" />
              </div>
            </th>
            <th className="components-col">Comp.</th>
            <th onClick={() => handleSort('duration')} className="sortable">
              <div className="th-content">
                Duration
                <SortIcon column="duration" />
              </div>
            </th>
            <th>Classes</th>
            <th onClick={() => handleSort('source')} className="sortable">
              <div className="th-content">
                Source
                <SortIcon column="source" />
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
