import { useState, useEffect } from 'react';
import { useSpellbooks } from '../hooks/useSpellbooks';
import { spellService } from '../services/spell.service';
import { Spell } from '../types/spell';
import './SpellbookDetail.css';

interface SpellbookDetailProps {
  spellbookId: string;
  onBack: () => void;
}

type SortColumn = 'name' | 'level' | 'school' | 'castingTime' | 'range' | 'duration' | 'source';
type SortDirection = 'asc' | 'desc';

export function SpellbookDetail({ spellbookId, onBack }: SpellbookDetailProps) {
  const { getSpellbook, togglePrepared, removeSpellFromSpellbook } = useSpellbooks();
  const [spellbook, setSpellbook] = useState<any>(null);
  const [enrichedSpells, setEnrichedSpells] = useState<Array<{spell: Spell, prepared: boolean, notes: string}>>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedSpellId, setExpandedSpellId] = useState<string | null>(null);

  useEffect(() => {
    loadSpellbook();
  }, [spellbookId]);

  const loadSpellbook = async () => {
    const sb = await getSpellbook(spellbookId);
    if (sb) {
      setSpellbook(sb);

      // Enrich spells with full data
      const enriched = sb.spells.map((spellEntry: any) => {
        const spell = spellService.getSpellById(spellEntry.spellId);
        return {
          spell: spell!,
          prepared: spellEntry.prepared,
          notes: spellEntry.notes || '',
        };
      }).filter((entry: any) => entry.spell !== undefined);

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

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortedSpells = () => {
    const sorted = [...enrichedSpells].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortColumn) {
        case 'level':
          aVal = a.spell.level;
          bVal = b.spell.level;
          break;
        case 'name':
          aVal = a.spell.name.toLowerCase();
          bVal = b.spell.name.toLowerCase();
          break;
        case 'school':
          aVal = a.spell.school.toLowerCase();
          bVal = b.spell.school.toLowerCase();
          break;
        case 'castingTime':
          aVal = a.spell.castingTime.toLowerCase();
          bVal = b.spell.castingTime.toLowerCase();
          break;
        case 'range':
          aVal = a.spell.range.toLowerCase();
          bVal = b.spell.range.toLowerCase();
          break;
        case 'duration':
          aVal = a.spell.duration.toLowerCase();
          bVal = b.spell.duration.toLowerCase();
          break;
        case 'source':
          aVal = a.spell.source.toLowerCase();
          bVal = b.spell.source.toLowerCase();
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

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <span className="sort-icon">⇅</span>;
    }
    return <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

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
                <th className="action-col">Remove</th>
              </tr>
            </thead>
            <tbody>
              {getSortedSpells().map(({ spell, prepared }) => (
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
                    <td className="classes-col">{spell.classes.join(', ')}</td>
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
                  {expandedSpellId === spell.id && (
                    <tr key={`${spell.id}-expanded`} className="spell-expanded-row">
                      <td colSpan={11}>
                        <div className="spell-expanded-content">
                          <div className="spell-expanded-header">
                            <h3>{spell.name}</h3>
                            <p className="spell-meta">
                              {getLevelText(spell.level)} {spell.school}
                              {spell.concentration && <span className="badge badge-concentration">Concentration</span>}
                              {spell.ritual && <span className="badge badge-ritual">Ritual</span>}
                            </p>
                          </div>
                          <div className="spell-expanded-details">
                            <div><strong>Casting Time:</strong> {spell.castingTime}</div>
                            <div><strong>Range:</strong> {spell.range}</div>
                            <div><strong>Duration:</strong> {spell.duration}</div>
                            <div>
                              <strong>Components:</strong>{' '}
                              {[
                                spell.components.verbal && 'V',
                                spell.components.somatic && 'S',
                                spell.components.material && `M (${spell.materials})`
                              ].filter(Boolean).join(', ')}
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
                            <div><strong>Classes:</strong> {spell.classes.join(', ')}</div>
                            <div className="spell-source">{spell.source}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
