/**
 * SpellbookDetailView Component (Presentational)
 *
 * Pure presentational component for displaying spellbook details.
 * Receives all data and callbacks as props from the container component.
 *
 * This component has no data fetching or business logic - it only renders UI.
 */

import { Spellbook, CreateSpellbookInput, EnrichedSpell } from '../types/spellbook';

import { ConfirmDialog } from './ConfirmDialog';
import { CreateSpellbookModal } from './CreateSpellbookModal';
import LoadingSpinner from './LoadingSpinner';
import { SortColumn, SortDirection } from '../hooks/useSpellSorting';
import { MESSAGES } from '../constants/messages';
import { SpellbookSpellsTable } from './spellbook-detail/SpellbookSpellsTable';
import './SpellbookDetail.css';





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
  onCopy: () => void;
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
  onCopy,
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
            <div className="header-actions">
              <button
                className="btn-secondary"
                onClick={onCopy}
                data-testid="btn-copy-spellbook"
              >
                Copy
              </button>
              <button
                className="btn-secondary"
                onClick={onEdit}
                data-testid="btn-edit-spellbook"
              >
                Edit
              </button>
            </div>
          </div>
          <p className="spellbook-stats">
            {enrichedSpells.length} spell{enrichedSpells.length !== 1 ? 's' : ''} · {preparedCount} prepared · {new Date(spellbook.updated).toLocaleDateString()}
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

          <SpellbookSpellsTable
            sortedSpells={sortedSpells}
            expandedSpellId={expandedSpellId}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={onSort}
            onRowClick={onRowClick}
            onTogglePrepared={onTogglePrepared}
            onRemoveSpell={onRemoveSpell}
          />

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
            onSubmit={onEditSave}
            existingNames={existingNames.filter(name => name !== spellbook.name)}
            initialData={{
              name: spellbook.name,
              spellcastingAbility: spellbook.spellcastingAbility,
              spellAttackModifier: spellbook.spellAttackModifier,
              spellSaveDC: spellbook.spellSaveDC,
            }}
            title="Edit Spellbook"
          />
        </>
      )}
    </div>
  );
}
