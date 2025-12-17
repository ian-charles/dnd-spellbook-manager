import { useRef } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { AlertDialog } from './AlertDialog';
import { CreateSpellbookModal } from './CreateSpellbookModal';
import { WandSparkles, SquarePen, Copy, Trash2 } from 'lucide-react';

import LoadingSpinner from './LoadingSpinner';
import { SpellbookListHeader } from './spellbook-list/SpellbookListHeader';
import { SpellbookListTable } from './spellbook-list/SpellbookListTable';
import { CreateSpellbookInput, UpdateSpellbookInput, Spellbook } from '../types/spellbook';
import { MESSAGES } from '../constants/messages';
import { useLongPress } from '../hooks/useLongPress';
import { useDialogs } from '../hooks/useDialogs';
import { useSpellbookListState } from '../hooks/useSpellbookListState';
import { useSpellbookOperations } from '../hooks/useSpellbookOperations';
import { useContextMenu } from '../hooks/useContextMenu';
import './SpellbookList.css';

interface SpellbookListProps {
  spellbooks: Spellbook[];
  loading: boolean;
  onSpellbookClick: (spellbookId: string) => void;
  onCreateSpellbook: (input: CreateSpellbookInput) => Promise<Spellbook>;
  onUpdateSpellbook: (id: string, input: UpdateSpellbookInput) => Promise<void>;
  onDeleteSpellbook: (id: string) => Promise<void>;
  onRefreshSpellbooks: () => Promise<void>;
  onAddSpellsToSpellbook: (spellbookId: string, spellIds: string[]) => Promise<void>;
}

export function SpellbookList({
  spellbooks,
  loading,
  onSpellbookClick,
  onCreateSpellbook,
  onUpdateSpellbook,
  onDeleteSpellbook,
  onRefreshSpellbooks,
  onAddSpellsToSpellbook,
}: SpellbookListProps) {
  // Custom hooks
  const {
    confirmDialog,
    alertDialog,
    showConfirm,
    closeConfirm,
    setAlertDialog,
    closeAlert,
  } = useDialogs();

  const {
    searchQuery,
    setSearchQuery,
    sortColumn,
    sortDirection,
    handleSort,
    filteredAndSortedSpellbooks,
  } = useSpellbookListState(spellbooks);

  const {
    createModalOpen,
    setCreateModalOpen,
    editSpellbookId,
    setEditSpellbookId,
    copyData,
    setCopyData,
    copyProgress,
    importing,
    fileInputRef,
    handleCreateOrUpdateSpellbook,
    handleEditStats,
    handleCopy,
    handleConfirmDelete,
    handleExport,
    handleImportClick,
    handleImport,
    cancelOperation,
  } = useSpellbookOperations({
    spellbooks,
    onCreateSpellbook,
    onUpdateSpellbook,
    onDeleteSpellbook,
    onRefreshSpellbooks,
    onAddSpellsToSpellbook,
    setAlertDialog,
    closeConfirm,
  });

  // Context menu state for mobile long-press interactions.
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu<{
    spellbookId: string;
    spellbookName: string;
  }>();


  // Long-press handlers for mobile context menu
  const pendingSpellbook = useRef<Spellbook | null>(null);

  const {
    onTouchStart: onTouchStartHook,
    onTouchMove,
    onTouchEnd
  } = useLongPress({
    onLongPress: (e: React.TouchEvent) => {
      if (pendingSpellbook.current) {
        openContextMenu(e, {
          spellbookId: pendingSpellbook.current.id,
          spellbookName: pendingSpellbook.current.name,
        });
      }
    }
  });

  const handleTouchStart = (e: React.TouchEvent, spellbook: Spellbook) => {
    pendingSpellbook.current = spellbook;
    onTouchStartHook(e);
  };

  const handleContextMenuAction = (action: 'editSpells' | 'editStats' | 'copy' | 'delete', spellbookId: string, spellbookName: string) => {
    closeContextMenu();
    switch (action) {
      case 'editSpells':
        onSpellbookClick(spellbookId);
        break;
      case 'editStats':
        handleEditStats(spellbookId);
        break;
      case 'copy':
        handleCopy(spellbookId);
        break;
      case 'delete':
        showConfirm(spellbookId, spellbookName);
        break;
    }
  };

  const handleDelete = (id: string, name: string) => {
    showConfirm(id, name);
  };

  if (loading) {
    return (
      <div className="spellbook-list">
        <h2 data-testid="spellbooks-header">My Spellbooks</h2>
        <LoadingSpinner message={MESSAGES.LOADING.SPELLBOOKS} />
      </div>
    );
  }

  return (
    <div className="spellbook-list">
      <SpellbookListHeader
        spellbookCount={spellbooks.length}
        importing={importing}
        onExport={handleExport}
        onImportClick={handleImportClick}
        onCreateClick={() => setCreateModalOpen(true)}
      />

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleImport}
        className="hidden-file-input"
        data-testid="file-input-import"
      />

      {spellbooks.length === 0 ? (
        <div className="spellbooks-empty" data-testid="spellbooks-empty">
          <p>{MESSAGES.EMPTY_STATES.NO_SPELLBOOKS_YET}</p>
          <p>{MESSAGES.EMPTY_STATES.CLICK_NEW_SPELLBOOK}</p>
        </div>
      ) : (
        <>
          {/* Search box */}
          <div className="spellbook-search">
            <input
              type="text"
              placeholder="Search spellbooks by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              data-testid="spellbook-search-input"
            />
            {searchQuery && (
              <button
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
                data-testid="btn-clear-search"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <SpellbookListTable
            spellbooks={filteredAndSortedSpellbooks}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            onSpellbookClick={onSpellbookClick}
            onEditStats={handleEditStats}
            onCopy={handleCopy}
            onDelete={handleDelete}
            onTouchStart={handleTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        </>
      )}

      {/* Create/Edit Spellbook Modal */}
      <CreateSpellbookModal
        isOpen={createModalOpen}
        onClose={() => {
          cancelOperation();
          setCreateModalOpen(false);
          setEditSpellbookId(null);
          setCopyData(undefined);
        }}
        onSubmit={handleCreateOrUpdateSpellbook}
        existingNames={editSpellbookId
          ? spellbooks.filter(sb => sb.id !== editSpellbookId).map(sb => sb.name)
          : spellbooks.map(sb => sb.name)}
        initialData={copyData}
        title={editSpellbookId ? 'Edit Spellbook' : copyData?.sourceSpellbookId ? 'Copy Spellbook' : 'Create New Spellbook'}
        loadingText={copyProgress}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Spellbook"
        message={`Delete spellbook "${confirmDialog.spellbookName}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => handleConfirmDelete(confirmDialog.spellbookId)}
        onCancel={closeConfirm}
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        variant={alertDialog.variant}
        onClose={closeAlert}
      />

      {/* Context Menu for mobile long-press */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="context-menu-item"
            onClick={() => handleContextMenuAction('editSpells', contextMenu.data.spellbookId, contextMenu.data.spellbookName)}
          >
            <WandSparkles size={16} />
            Edit Spells
          </button>
          <button
            className="context-menu-item"
            onClick={() => handleContextMenuAction('editStats', contextMenu.data.spellbookId, contextMenu.data.spellbookName)}
          >
            <SquarePen size={16} />
            Edit Stats
          </button>
          <button
            className="context-menu-item"
            onClick={() => handleContextMenuAction('copy', contextMenu.data.spellbookId, contextMenu.data.spellbookName)}
          >
            <Copy size={16} />
            Copy
          </button>
          <button
            className="context-menu-item context-menu-item-danger"
            onClick={() => handleContextMenuAction('delete', contextMenu.data.spellbookId, contextMenu.data.spellbookName)}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
