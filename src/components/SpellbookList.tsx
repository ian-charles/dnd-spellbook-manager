import { useState, useRef, useMemo, useEffect } from 'react';
import { exportImportService } from '../services/exportImport.service';
import { ConfirmDialog } from './ConfirmDialog';
import { AlertDialog } from './AlertDialog';
import { CreateSpellbookModal } from './CreateSpellbookModal';

import LoadingSpinner from './LoadingSpinner';
import { SpellbookListHeader } from './spellbook-list/SpellbookListHeader';
import { SpellbookListTable, SortColumn } from './spellbook-list/SpellbookListTable';
import { CreateSpellbookInput, Spellbook } from '../types/spellbook';
import { MESSAGES } from '../constants/messages';
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

type SortDirection = 'asc' | 'desc';

export function SpellbookList({
  spellbooks,
  loading,
  onSpellbookClick,
  onCreateSpellbook,
  onDeleteSpellbook,
  onRefreshSpellbooks,
  onAddSpellToSpellbook,
}: SpellbookListProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [copyData, setCopyData] = useState<{
    name: string;
    spellcastingAbility?: 'INT' | 'WIS' | 'CHA';
    spellAttackModifier?: number;
    spellSaveDC?: number;
    sourceSpellbookId?: string;
  } | undefined>(undefined);
  const [copyProgress, setCopyProgress] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Context menu state for mobile long-press
  const [contextMenu, setContextMenu] = useState<{
    spellbookId: string;
    spellbookName: string;
    x: number;
    y: number;
  } | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressStartPos = useRef<{ x: number; y: number } | null>(null);

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; spellbookId: string; spellbookName: string }>({
    isOpen: false,
    spellbookId: '',
    spellbookName: '',
  });
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'error' | 'success' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
  });

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

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

  // Filter and sort spellbooks
  const filteredAndSortedSpellbooks = useMemo(() => {
    // Filter by search query
    let filtered = spellbooks ?? [];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = spellbooks.filter(sb =>
        sb.name.toLowerCase().includes(query)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortColumn) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'spells':
          aVal = a.spells.length;
          bVal = b.spells.length;
          break;
        case 'ability':
          aVal = a.spellcastingAbility || '';
          bVal = b.spellcastingAbility || '';
          break;
        case 'attack':
          aVal = a.spellAttackModifier ?? (sortDirection === 'asc' ? Infinity : -Infinity);
          bVal = b.spellAttackModifier ?? (sortDirection === 'asc' ? Infinity : -Infinity);
          break;
        case 'saveDC':
          aVal = a.spellSaveDC ?? (sortDirection === 'asc' ? Infinity : -Infinity);
          bVal = b.spellSaveDC ?? (sortDirection === 'asc' ? Infinity : -Infinity);
          break;
        case 'updated':
          aVal = new Date(a.updated).getTime();
          bVal = new Date(b.updated).getTime();
          break;
        default:
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [spellbooks, searchQuery, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleCreateSpellbook = async (input: CreateSpellbookInput) => {
    try {
      const newSpellbook = await onCreateSpellbook(input);

      // If this is a copy operation, copy all spells from the source spellbook
      if (copyData?.sourceSpellbookId) {
        const sourceSpellbook = spellbooks.find(sb => sb.id === copyData.sourceSpellbookId);
        if (sourceSpellbook && sourceSpellbook.spells.length > 0) {
          // Copy all spells from the source spellbook to the new one
          const errors: string[] = [];
          const spellsToCopy = sourceSpellbook.spells.map(spell => spell.spellId);
          const totalSpells = spellsToCopy.length;
          let completedSpells = 0;
          setCopyProgress(`Copying 0/${totalSpells} spells...`);

          const results = await Promise.allSettled(spellsToCopy.map(async (spellId) => {
            try {
              await onAddSpellToSpellbook(newSpellbook.id, spellId);
            } finally {
              completedSpells++;
              setCopyProgress(`Copying ${completedSpells}/${totalSpells} spells...`);
            }
          }));

          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              errors.push(`Failed to copy spell ${spellsToCopy[index]}`);
            }
          });

          if (errors.length > 0) {
            const allFailed = errors.length === spellsToCopy.length;
            setAlertDialog({
              isOpen: true,
              title: allFailed ? 'Copy Failed' : 'Partial Copy Warning',
              message: allFailed
                ? 'Failed to copy any spells. The spellbook was created but is empty.'
                : `Spellbook created, but some spells failed to copy: ${errors.length} errors.`,
              variant: allFailed ? 'error' : 'warning'
            });
          }
        }
      }

      setCreateModalOpen(false);
      setCopyData(undefined);
      setCopyProgress('');
    } catch (error) {
      throw error; // Let the modal handle the error
    } finally {
      // Ensure spellbooks list is refreshed after creation (and potential copying)
      // This is in the finally block to guarantee execution regardless of success or failure
      await onRefreshSpellbooks();
    }
  };

  const handleCopy = (id: string) => {
    const spellbook = spellbooks.find(sb => sb.id === id);
    if (!spellbook) return;

    setCopyData({
      name: `${spellbook.name} (Copy)`,
      spellcastingAbility: spellbook.spellcastingAbility,
      spellAttackModifier: spellbook.spellAttackModifier,
      spellSaveDC: spellbook.spellSaveDC,
      sourceSpellbookId: id,
    });
    setCreateModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmDialog({ isOpen: true, spellbookId: id, spellbookName: name });
  };

  const handleConfirmDelete = async () => {
    try {
      await onDeleteSpellbook(confirmDialog.spellbookId);
      setConfirmDialog({ isOpen: false, spellbookId: '', spellbookName: '' });
    } catch (error) {
      setConfirmDialog({ isOpen: false, spellbookId: '', spellbookName: '' });
      setAlertDialog({
        isOpen: true,
        title: MESSAGES.ERROR.DELETE_FAILED,
        message: MESSAGES.ERROR.FAILED_TO_DELETE_SPELLBOOK,
        variant: 'error',
      });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, spellbookId: '', spellbookName: '' });
  };

  const handleExport = async () => {
    try {
      await exportImportService.downloadSpellbooks();
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        title: MESSAGES.ERROR.EXPORT_FAILED,
        message: MESSAGES.ERROR.FAILED_TO_EXPORT_SPELLBOOKS,
        variant: 'error',
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const result = await exportImportService.importSpellbooks(text);

      // Show result
      if (result.errors.length > 0) {
        setAlertDialog({
          isOpen: true,
          title: MESSAGES.ERROR.IMPORT_WITH_ERRORS,
          message:
            `${MESSAGES.IMPORT.IMPORTED_LABEL} ${result.imported}\n` +
            `${MESSAGES.IMPORT.SKIPPED_LABEL} ${result.skipped}\n` +
            `${MESSAGES.IMPORT.ERRORS_LABEL} ${result.errors.length}\n\n` +
            result.errors.join('\n'),
          variant: 'warning',
        });
      } else {
        setAlertDialog({
          isOpen: true,
          title: MESSAGES.SUCCESS.IMPORT_SUCCESS,
          message: `${MESSAGES.IMPORT.IMPORTED_LABEL} ${result.imported}\n${MESSAGES.IMPORT.SKIPPED_LABEL} ${result.skipped}`,
          variant: 'success',
        });
      }

      // Refresh the spellbooks list
      onRefreshSpellbooks();
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        title: MESSAGES.ERROR.IMPORT_FAILED,
        message: `${MESSAGES.ERROR.FAILED_TO_IMPORT_SPELLBOOKS} ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'error',
      });
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Long-press handlers for mobile context menu
  const handleTouchStart = (e: React.TouchEvent, spellbook: Spellbook) => {
    const touch = e.touches[0];
    longPressStartPos.current = { x: touch.clientX, y: touch.clientY };

    longPressTimer.current = setTimeout(() => {
      setContextMenu({
        spellbookId: spellbook.id,
        spellbookName: spellbook.name,
        x: touch.clientX,
        y: touch.clientY,
      });
    }, 500); // 500ms long press
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!longPressStartPos.current) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - longPressStartPos.current.x);
    const deltaY = Math.abs(touch.clientY - longPressStartPos.current.y);

    // Cancel long press if user moves finger too much
    if (deltaX > 10 || deltaY > 10) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      longPressStartPos.current = null;
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    longPressStartPos.current = null;
  };

  const handleContextMenuAction = (action: 'copy' | 'delete', spellbookId: string, spellbookName: string) => {
    setContextMenu(null);
    if (action === 'copy') {
      handleCopy(spellbookId);
    } else {
      handleDelete(spellbookId, spellbookName);
    }
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
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        variant={alertDialog.variant}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
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
            onClick={() => handleContextMenuAction('copy', contextMenu.spellbookId, contextMenu.spellbookName)}
          >
            Copy Spellbook
          </button>
          <button
            className="context-menu-item context-menu-item-danger"
            onClick={() => handleContextMenuAction('delete', contextMenu.spellbookId, contextMenu.spellbookName)}
          >
            Delete Spellbook
          </button>
        </div>
      )}
    </div>
  );
}
