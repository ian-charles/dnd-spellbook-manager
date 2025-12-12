/**
 * SpellbookDetailView Component (Presentational)
 *
 * Pure presentational component for displaying spellbook details.
 * Receives all data and callbacks as props from the container component.
 *
 * This component has no data fetching or business logic - it only renders UI.
 */



import { ConfirmDialog } from './ConfirmDialog';
import { CreateSpellbookModal } from './CreateSpellbookModal';
import { SpellDetailModal } from './SpellDetailModal';
import LoadingSpinner from './LoadingSpinner';
import { MESSAGES } from '../constants/messages';
import { SpellbookSpellsTable } from './spellbook-detail/SpellbookSpellsTable';
import './SpellbookDetail.css';


import { useSpellbookDetail } from '../contexts/SpellbookDetailContext';

export function SpellbookDetailView() {
  const {
    spellbook,
    enrichedSpells,
    selectedSpellIds,
    confirmDialog,
    editModalOpen,
    copyModalOpen,
    showPreparedOnly,
    allPrepared,
    modalSpellId,
    onBack: _onBack,
    onSelectAll,
    onDeselectAll,
    onPrepSelected,
    onRemoveSelected,
    onConfirmRemove,
    onCancelRemove,
    onCloseModal,
    onToggleSelected,
    onEdit,
    onEditClose,
    onEditSave,
    onToggleShowPreparedOnly,
    onCopy,
    onCopyClose,
    onCopySave,
    onTogglePrepared,
    onRequestRemoveSpell,
    existingNames,
  } = useSpellbookDetail();

  const modalEnrichedSpell = modalSpellId
    ? enrichedSpells.find(es => es.spell.id === modalSpellId)
    : null;
  const modalSpell = modalEnrichedSpell?.spell || null;


  // Loading state
  if (!spellbook) {
    return (
      <div className="spellbook-detail">
        <LoadingSpinner message={MESSAGES.LOADING.SPELLBOOK} />
      </div>
    );
  }

  const preparedCount = enrichedSpells.filter(s => s.prepared).length;
  const hasSelection = selectedSpellIds.size > 0;
  const allSelected = enrichedSpells.length > 0 && selectedSpellIds.size === enrichedSpells.length;

  return (
    <div className="spellbook-detail" data-testid="spellbook-detail">
      <div className="spellbook-detail-header">
        <div className="spellbook-header-content">
          <button
            className="back-link"
            onClick={_onBack}
            data-testid="back-to-spellbooks"
          >
            ← Back to Spellbooks
          </button>
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
          {/* Filter and Selection Controls */}
          <div className="spellbook-controls">
            <label className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={showPreparedOnly}
                onChange={onToggleShowPreparedOnly}
                data-testid="filter-prepared-only"
              />
              <span>Show <span className="prepared-text">Prepared</span> Only</span>
            </label>
            <div className="spellbook-actions">
              <button
                className="btn-secondary"
                onClick={allSelected ? onDeselectAll : onSelectAll}
                data-testid="btn-select-all"
                disabled={enrichedSpells.length === 0}
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
              <button
                className={`btn-secondary ${!allPrepared && hasSelection ? 'btn-prep' : ''} ${allPrepared && hasSelection ? 'btn-unprep' : ''}`}
                onClick={onPrepSelected}
                data-testid="btn-prep-selected"
                disabled={!hasSelection}
              >
                {allPrepared ? 'Unprep' : 'Prep'}
              </button>
              <button
                className="btn-secondary btn-danger"
                onClick={onRemoveSelected}
                data-testid="btn-remove-selected"
                disabled={!hasSelection}
              >
                Remove
              </button>
            </div>
          </div>

          <SpellbookSpellsTable />

          {/* Confirm Remove Dialog */}
          <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            title={MESSAGES.DIALOG.REMOVE_SPELL}
            message={confirmDialog.message}
            confirmLabel="Remove"
            cancelLabel="Cancel"
            variant="danger"
            onConfirm={onConfirmRemove}
            onCancel={onCancelRemove}
          />

          {/* Spell Detail Modal */}
          {modalSpell && spellbook && (
            <SpellDetailModal
              spell={modalSpell}
              isOpen={true}
              onClose={onCloseModal}
              isSelected={selectedSpellIds.has(modalSpell.id)}
              onToggleSelected={onToggleSelected}
              isPrepared={modalEnrichedSpell?.prepared || false}
              onTogglePrepared={(spellId) => onTogglePrepared(spellbook.id, spellId)}
              onRemove={onRequestRemoveSpell}
            />
          )}
        </>
      )}

      {/* Edit Spellbook Modal - outside conditional so it works for empty spellbooks */}
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
          maxSpellSlots: spellbook.maxSpellSlots,
        }}
        title="Edit Spellbook"
      />

      {/* Copy Spellbook Modal */}
      <CreateSpellbookModal
        isOpen={copyModalOpen}
        onClose={onCopyClose}
        onSubmit={onCopySave}
        existingNames={existingNames}
        initialData={{
          name: `${spellbook.name}${MESSAGES.GENERATED.COPY_SUFFIX}`,
          spellcastingAbility: spellbook.spellcastingAbility,
          spellAttackModifier: spellbook.spellAttackModifier,
          spellSaveDC: spellbook.spellSaveDC,
          maxSpellSlots: spellbook.maxSpellSlots,
        }}
        title="Copy Spellbook"
        loadingText="Copying..."
      />
    </div>
  );
}
