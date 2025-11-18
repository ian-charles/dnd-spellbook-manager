/**
 * SpellbookDetailView Component (Presentational)
 *
 * Pure presentational component for displaying spellbook details.
 * Receives all data and callbacks as props from the container component.
 *
 * This component has no data fetching or business logic - it only renders UI.
 */

import { Spell } from '../types/spell';
import { Spellbook } from '../types/spellbook';
import { SortIcon } from './SortIcon';
import { ConfirmDialog } from './ConfirmDialog';
import LoadingSpinner from './LoadingSpinner';
import { SortColumn, SortDirection } from '../hooks/useSpellSorting';
import { getLevelText, getComponentsText, getComponentsWithMaterials, filterClasses } from '../utils/spellFormatters';
import { MESSAGES } from '../constants/messages';
import './SpellbookDetail.css';

export interface EnrichedSpell {
  spell: Spell;
  prepared: boolean;
  notes: string;
}

export interface SpellbookDetailViewProps {
  spellbook: Spellbook | null;
  enrichedSpells: EnrichedSpell[];
  sortedSpells: EnrichedSpell[];
  expandedSpellId: string | null;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  confirmDialog: {
    isOpen: boolean;
    spellId: string;
    spellName: string;
  };
  onBack: () => void;
  onSort: (column: SortColumn) => void;
  onTogglePrepared: (spellId: string) => void;
  onRemoveSpell: (spellId: string, spellName: string) => void;
  onConfirmRemove: () => void;
  onCancelRemove: () => void;
  onRowClick: (spellId: string) => void;
}

export function SpellbookDetailView({
  spellbook,
  enrichedSpells,
  sortedSpells,
  expandedSpellId,
  sortColumn,
  sortDirection,
  confirmDialog,
  onBack,
  onSort,
  onTogglePrepared,
  onRemoveSpell,
  onConfirmRemove,
  onCancelRemove,
  onRowClick,
}: SpellbookDetailViewProps) {
  // Loading state
  if (!spellbook) {
    return (
      <div className="spellbook-detail">
        <LoadingSpinner message={MESSAGES.LOADING.SPELLBOOK} />
      </div>
    );
  }

  const preparedCount = enrichedSpells.filter(s => s.prepared).length;

  return (
    <div className="spellbook-detail" data-testid="spellbook-detail">
      <div className="spellbook-detail-header">
        <button className="btn-back" onClick={onBack}>
          {MESSAGES.DIALOG.BACK_TO_SPELLBOOKS}
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
          <p>{MESSAGES.EMPTY_STATES.SPELLBOOK_IS_EMPTY}</p>
          <p>{MESSAGES.EMPTY_STATES.GO_TO_BROWSE}</p>
        </div>
      ) : (
        <div className="spellbook-table-container" data-testid="spellbook-spell-list">
          <table className="spell-table spellbook-table">
            <thead>
              <tr>
                <th className="prepared-col">Prep</th>
                <th onClick={() => onSort('name')} className="sortable">
                  <div className="th-content">
                    Spell Name
                    <SortIcon column="name" currentColumn={sortColumn} currentDirection={sortDirection} />
                  </div>
                </th>
                <th onClick={() => onSort('level')} className="sortable level-col">
                  <div className="th-content">
                    Level
                    <SortIcon column="level" currentColumn={sortColumn} currentDirection={sortDirection} />
                  </div>
                </th>
                <th onClick={() => onSort('school')} className="sortable">
                  <div className="th-content">
                    School
                    <SortIcon column="school" currentColumn={sortColumn} currentDirection={sortDirection} />
                  </div>
                </th>
                <th onClick={() => onSort('castingTime')} className="sortable">
                  <div className="th-content">
                    Time
                    <SortIcon column="castingTime" currentColumn={sortColumn} currentDirection={sortDirection} />
                  </div>
                </th>
                <th onClick={() => onSort('range')} className="sortable">
                  <div className="th-content">
                    Range
                    <SortIcon column="range" currentColumn={sortColumn} currentDirection={sortDirection} />
                  </div>
                </th>
                <th className="components-col">Comp.</th>
                <th onClick={() => onSort('duration')} className="sortable">
                  <div className="th-content">
                    Duration
                    <SortIcon column="duration" currentColumn={sortColumn} currentDirection={sortDirection} />
                  </div>
                </th>
                <th>Classes</th>
                <th onClick={() => onSort('source')} className="sortable">
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
                  onClick={() => onRowClick(spell.id)}
                >
                  <td className="prepared-col" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={prepared}
                      onChange={() => onTogglePrepared(spell.id)}
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
                      onClick={() => onRemoveSpell(spell.id, spell.name)}
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
        title={MESSAGES.DIALOG.REMOVE_SPELL}
        message={MESSAGES.DIALOG.REMOVE_SPELL_CONFIRM.replace('{spellName}', confirmDialog.spellName)}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={onConfirmRemove}
        onCancel={onCancelRemove}
      />
    </div>
  );
}
