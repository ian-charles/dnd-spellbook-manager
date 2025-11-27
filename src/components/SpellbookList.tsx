import { useState, useRef, useMemo } from 'react';
import { exportImportService } from '../services/exportImport.service';
import { ConfirmDialog } from './ConfirmDialog';
import { AlertDialog } from './AlertDialog';
import { CreateSpellbookModal } from './CreateSpellbookModal';
import { SortIcon } from './SortIcon';
import LoadingSpinner from './LoadingSpinner';
import { LoadingButton } from './LoadingButton';
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

type SortColumn = 'name' | 'spells' | 'ability' | 'attack' | 'saveDC' | 'updated';
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
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          aVal = a.spellAttackModifier ?? -999;
          bVal = b.spellAttackModifier ?? -999;
          break;
        case 'saveDC':
          aVal = a.spellSaveDC ?? -999;
          bVal = b.spellSaveDC ?? -999;
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
        if (sourceSpellbook) {
          // Copy all spells from the source spellbook to the new one
          const errors: string[] = [];
          for (const spell of sourceSpellbook.spells) {
            try {
              await onAddSpellToSpellbook(newSpellbook.id, spell.spellId);
            } catch (err) {
              errors.push(`Failed to copy spell ${spell.spellId}`);
              console.error(`Failed to copy spell ${spell.spellId}:`, err);
            }
          }

          if (errors.length > 0) {
            setAlertDialog({
              isOpen: true,
              title: 'Partial Copy Warning',
              message: `Spellbook created, but some spells failed to copy: ${errors.length} errors.`,
              variant: 'warning'
            });
          }
        }
        // Ensure spellbooks list is refreshed after copying all spells
        await onRefreshSpellbooks();
      } else {
        // Ensure spellbooks list is refreshed for new spellbook
        await onRefreshSpellbooks();
      }

      setCreateModalOpen(false);
      setCopyData(undefined);
    } catch (error) {
      throw error; // Let the modal handle the error
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
      <div className="spellbook-list-header">
        <h2 data-testid="spellbooks-header">My Spellbooks</h2>
        <div className="header-actions">
          <button
            className="btn-secondary"
            data-testid="btn-export-spellbooks"
            onClick={handleExport}
            disabled={spellbooks.length === 0}
            title={spellbooks.length === 0 ? MESSAGES.TOOLTIPS.NO_SPELLBOOKS_TO_EXPORT : MESSAGES.TOOLTIPS.EXPORT_ALL_SPELLBOOKS}
          >
            {MESSAGES.BUTTONS.EXPORT}
          </button>
          <LoadingButton
            className="btn-secondary"
            data-testid="btn-import-spellbooks"
            onClick={handleImportClick}
            loading={importing}
            loadingText="Importing..."
          >
            {MESSAGES.BUTTONS.IMPORT}
          </LoadingButton>
          <button
            className="btn-primary"
            data-testid="btn-create-spellbook"
            onClick={() => setCreateModalOpen(true)}
          >
            + New Spellbook
          </button>
        </div>
      </div>

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

          <table className="spellbooks-table" data-testid="spellbooks-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable">
                  <div className="th-content">
                    Spellbook Name
                    <SortIcon column="name" currentColumn={sortColumn} currentDirection={sortDirection} />
                  </div>
                </th>
                <th onClick={() => handleSort('spells')} className="sortable">
                  <div className="th-content">
                    Spells
                    <SortIcon column="spells" currentColumn={sortColumn} currentDirection={sortDirection} />
                  </div>
                </th>
                <th onClick={() => handleSort('ability')} className="sortable">
                  <div className="th-content">
                    Ability
                    <SortIcon column="ability" currentColumn={sortColumn} currentDirection={sortDirection} />
                  </div>
                </th>
                <th onClick={() => handleSort('attack')} className="sortable">
                  <div className="th-content">
                    Attack
                    <SortIcon column="attack" currentColumn={sortColumn} currentDirection={sortDirection} />
                  </div>
                </th>
                <th onClick={() => handleSort('saveDC')} className="sortable">
                  <div className="th-content">
                    Save DC
                    <SortIcon column="saveDC" currentColumn={sortColumn} currentDirection={sortDirection} />
                  </div>
                </th>
                <th onClick={() => handleSort('updated')} className="sortable">
                  <div className="th-content">
                    Last Updated
                    <SortIcon column="updated" currentColumn={sortColumn} currentDirection={sortDirection} />
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedSpellbooks.map((spellbook) => (
                <tr
                  key={spellbook.id}
                  className="spellbook-row"
                  data-testid={`spellbook-row-${spellbook.id}`}
                  onClick={() => onSpellbookClick(spellbook.id)}
                >
                  <td className="spellbook-name" data-testid="spellbook-name" data-label="Name">
                    {spellbook.name}
                  </td>
                  <td className="spellbook-spell-count" data-label="Spells">
                    {spellbook.spells.length}
                  </td>
                  <td className="spellbook-ability" data-label="Ability">
                    {spellbook.spellcastingAbility || 'N/A'}
                  </td>
                  <td className="spellbook-attack" data-label="Attack">
                    {spellbook.spellAttackModifier !== undefined
                      ? `+${spellbook.spellAttackModifier}`
                      : 'N/A'}
                  </td>
                  <td className="spellbook-save-dc" data-label="Save DC">
                    {spellbook.spellSaveDC ?? 'N/A'}
                  </td>
                  <td className="spellbook-updated" data-label="Last Updated">
                    {new Date(spellbook.updated).toLocaleDateString()}
                  </td>
                  <td className="spellbook-actions" data-label="Actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-secondary-small"
                      onClick={() => handleCopy(spellbook.id)}
                      data-testid={`btn-copy-spellbook-${spellbook.id}`}
                    >
                      Copy
                    </button>
                    <button
                      className="btn-danger-small"
                      onClick={() => handleDelete(spellbook.id, spellbook.name)}
                      data-testid={`btn-delete-spellbook-${spellbook.id}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Create Spellbook Modal */}
      <CreateSpellbookModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setCopyData(undefined);
        }}
        onCreate={handleCreateSpellbook}
        existingNames={spellbooks.map(sb => sb.name)}
        initialData={copyData}
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
    </div>
  );
}
