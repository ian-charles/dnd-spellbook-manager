import { useState, Fragment } from 'react';
import { Spell } from '../types/spell';
import { SortIcon } from './SortIcon';
import { useSpellSorting } from '../hooks/useSpellSorting';
import { getLevelText, getComponentsWithMaterials, filterClasses } from '../utils/spellFormatters';
import './SpellTable.css';

function ComponentBadges({ spell }: { spell: Spell }) {
  return (
    <div className="component-badges">
      {spell.components.verbal && <span className="component-badge badge-verbal">V</span>}
      {spell.components.somatic && <span className="component-badge badge-somatic">S</span>}
      {spell.components.material && <span className="component-badge badge-material">M</span>}
    </div>
  );
}

function ClassBadges({ classes }: { classes: string[] }) {
  const filteredClasses = filterClasses(classes);
  return (
    <div className="class-badges">
      {filteredClasses.map((className) => (
        <span key={className} className={`class-badge class-badge-${className.toLowerCase()}`}>
          {className.substring(0, 3).toUpperCase()}
        </span>
      ))}
    </div>
  );
}

interface SpellTableProps {
  spells: Spell[];
  selectedSpellIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onAddToSpellbook?: (spellId: string) => void;
}

export function SpellTable({ spells, selectedSpellIds = new Set(), onSelectionChange, onAddToSpellbook }: SpellTableProps) {
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
            {onAddToSpellbook && <th className="checkbox-col"></th>}
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
          </tr>
        </thead>
        <tbody>
          {sortedSpells.map((spell) => (
            <Fragment key={spell.id}>
              <tr
                onClick={() => handleRowClick(spell.id)}
                className={`spell-row ${expandedSpellId === spell.id ? 'expanded' : ''}`}
              >
                {onAddToSpellbook && (
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
                <td className="school-col">{spell.school}</td>
                <td>{spell.castingTime}</td>
                <td>{spell.range}</td>
                <td className="components-col"><ComponentBadges spell={spell} /></td>
                <td>{spell.duration}</td>
                <td className="classes-col"><ClassBadges classes={spell.classes} /></td>
                <td className="source-col">{spell.source}</td>
              </tr>
              {expandedSpellId === spell.id && (
                <tr key={`${spell.id}-expansion`} className="spell-expansion-row">
                  <td colSpan={onAddToSpellbook ? 10 : 9} className="spell-expansion-cell">
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
                        <div>
                          <strong>Components:</strong> {getComponentsWithMaterials(spell)}
                        </div>
                      </div>
                      <div className="spell-expanded-description">
                        {spell.description}
                      </div>
                      {spell.higherLevels && (
                        <div className="spell-expanded-higher-levels">
                          <strong>At Higher Levels:</strong> {spell.higherLevels}
                        </div>
                      )}
                      <div className="spell-expanded-footer">
                        <div><strong>Classes:</strong> {filterClasses(spell.classes).join(', ')}</div>
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
