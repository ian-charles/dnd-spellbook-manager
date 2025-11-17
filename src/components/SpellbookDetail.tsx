import { useState, useEffect } from 'react';
import { useSpellbooks } from '../hooks/useSpellbooks';
import { spellService } from '../services/spell.service';
import { Spell } from '../types/spell';
import { Spellbook } from '../types/spellbook';
import { SortIcon } from './SortIcon';
import { ConfirmDialog } from './ConfirmDialog';
import { useSpellSorting } from '../hooks/useSpellSorting';
import { getLevelText, getComponentsText, getComponentsWithMaterials, filterClasses } from '../utils/spellFormatters';
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
                    <div className="spell-name-header">
                      {spell.name}
                      {spell.concentration && <span className="badge badge-concentration">C</span>}
                      {spell.ritual && <span className="badge badge-ritual">R</span>}
                    </div>
                    {expandedSpellId === spell.id && (
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
                    )}
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Remove Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Remove Spell"
        message={`Remove "${confirmDialog.spellName}" from this spellbook?`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />
    </div>
  );
}
