import { useState, useEffect } from 'react';
import { useSpellbooks } from '../hooks/useSpellbooks';
import { spellService } from '../services/spell.service';
import { Spell } from '../types/spell';
import { Spellbook } from '../types/spellbook';
import { ExpandableSpellRow } from './ExpandableSpellRow';
import { SortIcon } from './SortIcon';
import { useSpellSorting } from '../hooks/useSpellSorting';
import { getLevelText, getComponentsText, filterClasses } from '../utils/spellFormatters';
import './SpellbookDetail.css';

interface SpellbookDetailProps {
  spellbookId: string;
  onBack: () => void;
}

interface EnrichedSpell {
  spell: Spell;
  prepared: boolean;
  notes: string;
}

export function SpellbookDetail({ spellbookId, onBack }: SpellbookDetailProps) {
  const { getSpellbook, togglePrepared, removeSpellFromSpellbook } = useSpellbooks();
  const [spellbook, setSpellbook] = useState<Spellbook | null>(null);
  const [enrichedSpells, setEnrichedSpells] = useState<EnrichedSpell[]>([]);
  const [expandedSpellId, setExpandedSpellId] = useState<string | null>(null);
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

  const handleRemoveSpell = async (spellId: string, spellName: string) => {
    if (confirm(`Remove "${spellName}" from this spellbook?`)) {
      await removeSpellFromSpellbook(spellbookId, spellId);
      await loadSpellbook();
    }
  };

  const handleRowClick = (spellId: string) => {
    // Toggle expanded state: if clicking the same spell, collapse it; otherwise expand new spell
    if (expandedSpellId === spellId) {
      setExpandedSpellId(null);
    } else {
      setExpandedSpellId(spellId);
    }
  };

  if (!spellbook) {
    return (
      <div className="spellbook-detail">
        <p>Loading spellbook...</p>
      </div>
    );
  }

  const preparedCount = enrichedSpells.filter(s => s.prepared).length;

  return (
    <div className="spellbook-detail" data-testid="spellbook-detail">
      <div className="spellbook-detail-header">
        <button className="btn-back" onClick={onBack}>
          ← Back to Spellbooks
        </button>
        <div>
          <h2 data-testid="spellbook-detail-name">{spellbook.name}</h2>
          <p className="spellbook-stats">
            {enrichedSpells.length} spell{enrichedSpells.length !== 1 ? 's' : ''} · {preparedCount} prepared
          </p>
        </div>
      </div>

      {enrichedSpells.length === 0 ? (
        <div className="spellbook-detail-empty">
          <p>This spellbook is empty.</p>
          <p>Go to the Browse tab to add spells!</p>
        </div>
      ) : (
        <div className="spellbook-table-container" data-testid="spellbook-spell-list">
          <table className="spell-table spellbook-table">
            <thead>
              <tr>
                <th className="prepared-col">Prep</th>
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
                <th className="action-col">Remove</th>
              </tr>
            </thead>
            <tbody>
              {sortedSpells.map(({ spell, prepared }) => (
                <>
                  <tr
                    key={spell.id}
                    className={`spell-row ${prepared ? 'prepared-row' : ''} ${expandedSpellId === spell.id ? 'expanded' : ''}`}
                    data-testid={`spellbook-spell-${spell.id}`}
                    onClick={() => handleRowClick(spell.id)}
                  >
                    <td className="prepared-col" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={prepared}
                        onChange={() => handleTogglePrepared(spell.id)}
                        data-testid="toggle-prepared"
                        aria-label={`Toggle ${spell.name} prepared status`}
                      />
                    </td>
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
                    <td className="action-col" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-remove-small"
                        onClick={() => handleRemoveSpell(spell.id, spell.name)}
                        data-testid={`btn-remove-spell-${spell.id}`}
                        aria-label={`Remove ${spell.name}`}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                  <ExpandableSpellRow
                    key={`${spell.id}-expanded`}
                    spell={spell}
                    isExpanded={expandedSpellId === spell.id}
                    colSpan={11}
                  />
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
