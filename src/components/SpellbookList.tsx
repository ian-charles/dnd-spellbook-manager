import { useRef, useEffect } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { AlertDialog } from './AlertDialog';
import { CreateSpellbookModal } from './CreateSpellbookModal';

import LoadingSpinner from './LoadingSpinner';
import { SpellbookListHeader } from './spellbook-list/SpellbookListHeader';
import { SpellbookListTable } from './spellbook-list/SpellbookListTable';
import { CreateSpellbookInput, Spellbook } from '../types/spellbook';
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
  onDeleteSpellbook: (id: string) => Promise<void>;
  onRefreshSpellbooks: () => Promise<void>;
  onAddSpellToSpellbook: (spellbookId: string, spellId: string) => Promise<void>;
}

export function SpellbookList({
  spellbooks,
  loading,
  onSpellbookClick,
  onCreateSpellbook,
  onDeleteSpellbook,
  onRefreshSpellbooks,
  onAddSpellToSpellbook,
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
    copyData,
    setCopyData,
    copyProgress,
    importing,
    fileInputRef,
    handleCreateSpellbook,
    handleCopy,
    handleConfirmDelete,
    handleExport,
    handleImportClick,
    handleImport,
  } = useSpellbookOperations({
    spellbooks,
    onCreateSpellbook,
    onDeleteSpellbook,
    onRefreshSpellbooks,
    onAddSpellToSpellbook,
    setAlertDialog,
    closeConfirm,
  });

  // Context menu state for mobile long-press interactions.
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu<{
    spellbookId: string;
    spellbookName: string;
  }>();

  // Handle copy from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const copyId = params.get('copy');
    if (copyId && spellbooks.length > 0) {
      handleCopy(copyId);
      // Clear the parameter from URL
      window.location.hash = '#spellbooks';
    }
  }, [spellbooks]);

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

  const handleContextMenuAction = (action: 'copy' | 'delete', spellbookId: string, spellbookName: string) => {
    closeContextMenu();
    if (action === 'copy') {
      handleCopy(spellbookId);
    } else {
      showConfirm(spellbookId, spellbookName);
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
        style={{ display: 'none' }}
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
            onCopy={handleCopy}
            onDelete={handleDelete}
            onTouchStart={handleTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        </>
      )}

      {/* Create Spellbook Modal */}
      <CreateSpellbookModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setCopyData(undefined);
        }}
        onSubmit={handleCreateSpellbook}
        existingNames={spellbooks.map(sb => sb.name)}
        initialData={copyData}
        title={copyData ? 'Copy Spellbook' : 'Create New Spellbook'}
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
            position: 'fixed',
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="context-menu-item"
            onClick={() => handleContextMenuAction('copy', contextMenu.data.spellbookId, contextMenu.data.spellbookName)}
          >
            Copy Spellbook
          </button>
          <button
            className="context-menu-item context-menu-item-danger"
            onClick={() => handleContextMenuAction('delete', contextMenu.data.spellbookId, contextMenu.data.spellbookName)}
          >
            Delete Spellbook
          </button>
        </div>
      )}
    </div>
  );
}
