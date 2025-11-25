/**
 * SpellbookDetailView Component (Presentational)
 *
 * Pure presentational component for displaying spellbook details.
 * Receives all data and callbacks as props from the container component.
 *
 * This component has no data fetching or business logic - it only renders UI.
 */

import { Spell } from '../types/spell';
import { Spellbook, CreateSpellbookInput } from '../types/spellbook';
import { SortIcon } from './SortIcon';
import { ConfirmDialog } from './ConfirmDialog';
import { CreateSpellbookModal } from './CreateSpellbookModal';
import LoadingSpinner from './LoadingSpinner';
import { SortColumn, SortDirection } from '../hooks/useSpellSorting';
import { getLevelText, getComponentsWithMaterials, filterClasses } from '../utils/spellFormatters';
import { MESSAGES } from '../constants/messages';
import './SpellbookDetail.css';

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
  editModalOpen: boolean;
  showPreparedOnly: boolean;
  onBack: () => void;
  onSort: (column: SortColumn) => void;
  onTogglePrepared: (spellId: string) => void;
  onRemoveSpell: (spellId: string, spellName: string) => void;
  onConfirmRemove: () => void;
  onCancelRemove: () => void;
  onRowClick: (spellId: string) => void;
  onEdit: () => void;
  onEditClose: () => void;
  onEditSave: (input: CreateSpellbookInput) => Promise<void>;
  onToggleShowPreparedOnly: () => void;
  onSelectAllPrepared: () => void;
  existingNames: string[];
}

export function SpellbookDetailView({
  spellbook,
  enrichedSpells,
  sortedSpells,
  expandedSpellId,
  sortColumn,
  sortDirection,
  confirmDialog,
  editModalOpen,
  showPreparedOnly,
  onBack,
  onSort,
  onTogglePrepared,
  onRemoveSpell,
  onConfirmRemove,
  onCancelRemove,
  onRowClick,
  onEdit,
  onEditClose,
  onEditSave,
  onToggleShowPreparedOnly,
  onSelectAllPrepared,
  existingNames,
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
  const allPrepared = enrichedSpells.length > 0 && enrichedSpells.every(s => s.prepared);

  return (
    <div className="spellbook-detail" data-testid="spellbook-detail">
      <div className="spellbook-detail-header">
        <button className="btn-back" onClick={onBack}>
          {MESSAGES.DIALOG.BACK_TO_SPELLBOOKS}
        </button>
        <div className="spellbook-header-content">
          <div className="spellbook-header-top">
            <h2 data-testid="spellbook-detail-name">{spellbook.name}</h2>
            <button
              className="btn-secondary"
              onClick={onEdit}
              data-testid="btn-edit-spellbook"
            >
              Edit
            </button>
          </div>
          <p className="spellbook-stats">
            {enrichedSpells.length} spell{enrichedSpells.length !== 1 ? 's' : ''} · {preparedCount} prepared
          </p>
          <div className="spellbook-attributes">
            <span>
              <strong>Ability</strong>
              <span>{spellbook.spellcastingAbility || 'N/A'}</span>
            </span>
            <span>
              <strong>Attack</strong>
              <span>{spellbook.spellAttackModifier !== undefined ? `+${spellbook.spellAttackModifier}` : 'N/A'}</span>
            </span>
            <span>
              <strong>Save DC</strong>
              <span>{spellbook.spellSaveDC !== undefined ? spellbook.spellSaveDC : 'N/A'}</span>
            </span>
            <span>
              <strong>Last Updated</strong>
              <span>{new Date(spellbook.updated).toLocaleDateString()}</span>
            </span>
          </div>
        </div>
      </div>

      {enrichedSpells.length === 0 ? (
        <div className="spellbook-detail-empty">
          <p>{MESSAGES.EMPTY_STATES.SPELLBOOK_IS_EMPTY}</p>
          <p>{MESSAGES.EMPTY_STATES.GO_TO_BROWSE}</p>
        </div>
      ) : (
        <>
          {/* Filter and Select All Controls */}
          <div className="spellbook-controls">
            <label className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={showPreparedOnly}
                onChange={onToggleShowPreparedOnly}
                data-testid="filter-prepared-only"
              />
              <span>Show Prepared Only</span>
            </label>
            <button
              className="btn-secondary"
              onClick={onSelectAllPrepared}
              data-testid="btn-select-all-prepared"
              disabled={enrichedSpells.length === 0}
            >
              {allPrepared ? 'Deselect All' : 'Select All'}
            </button>
          </div>

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
                <>
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
                    </td>
                    <td className="level-col">{getLevelText(spell.level)}</td>
                    <td className="school-col">{spell.school}</td>
                    <td>{spell.castingTime}</td>
                    <td>{spell.range}</td>
                    <td className="components-col"><ComponentBadges spell={spell} /></td>
                    <td>{spell.duration}</td>
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
                  {expandedSpellId === spell.id && (
                    <tr key={`${spell.id}-expansion`} className="spell-expansion-row">
                      <td colSpan={10} className="spell-expansion-cell">
                        <div className="spell-inline-expansion">
                          <div className="spell-expanded-description">
                            {spell.description}
                          </div>
                          {spell.higherLevels && (
                            <div className="spell-expanded-higher-levels">
                              <strong>At Higher Levels:</strong> {spell.higherLevels}
                            </div>
                          )}
                          <div className="spell-expanded-footer">
                            <div>
                              <strong>Classes:</strong> <ClassBadges classes={spell.classes} />
                            </div>
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
        </>
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

      {/* Edit Spellbook Modal */}
      <CreateSpellbookModal
        isOpen={editModalOpen}
        onClose={onEditClose}
        onCreate={onEditSave}
        existingNames={existingNames.filter(name => name !== spellbook.name)}
        initialData={{
          name: spellbook.name,
          spellcastingAbility: spellbook.spellcastingAbility,
          spellAttackModifier: spellbook.spellAttackModifier,
          spellSaveDC: spellbook.spellSaveDC,
        }}
        title="Edit Spellbook"
      />
    </div>
  );
}
