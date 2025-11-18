import { useState, useRef } from 'react';
import { useSpellbooks } from '../hooks/useSpellbooks';
import { exportImportService } from '../services/exportImport.service';
import { ConfirmDialog } from './ConfirmDialog';
import { AlertDialog } from './AlertDialog';
import LoadingSpinner from './LoadingSpinner';
import { LoadingButton } from './LoadingButton';
import { MESSAGES } from '../constants/messages';
import './SpellbookList.css';

interface SpellbookListProps {
  onSpellbookClick: (spellbookId: string) => void;
}

export function SpellbookList({ onSpellbookClick }: SpellbookListProps) {
  const { spellbooks, loading, createSpellbook, deleteSpellbook, refreshSpellbooks } = useSpellbooks();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSpellbookName, setNewSpellbookName] = useState('');
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpellbookName.trim()) return;

    setCreating(true);
    try {
      await createSpellbook({ name: newSpellbookName.trim() });
      setNewSpellbookName('');
      setShowCreateDialog(false);
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        title: MESSAGES.ERROR.CREATION_FAILED,
        message: error instanceof Error ? error.message : MESSAGES.ERROR.FAILED_TO_CREATE_SPELLBOOK,
        variant: 'error',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmDialog({ isOpen: true, spellbookId: id, spellbookName: name });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteSpellbook(confirmDialog.spellbookId);
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
      refreshSpellbooks();
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
            onClick={() => setShowCreateDialog(true)}
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
        <div className="spellbooks-grid">
          {spellbooks.map((spellbook) => (
            <div
              key={spellbook.id}
              className="spellbook-card"
              data-testid={`spellbook-item-${spellbook.id}`}
            >
              <div onClick={() => onSpellbookClick(spellbook.id)} className="spellbook-card-content">
                <h3 data-testid="spellbook-name">{spellbook.name}</h3>
                <p className="spellbook-count">
                  {spellbook.spells.length} spell{spellbook.spells.length !== 1 ? 's' : ''}
                </p>
                <p className="spellbook-prepared">
                  {spellbook.spells.filter(s => s.prepared).length} prepared
                </p>
              </div>
              <div className="spellbook-card-actions">
                <button
                  className="btn-danger-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(spellbook.id, spellbook.name);
                  }}
                  data-testid={`btn-delete-spellbook-${spellbook.id}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateDialog && (
        <div className="dialog-overlay" data-testid="create-spellbook-dialog">
          <div className="dialog">
            <h3>{MESSAGES.BUTTONS.CREATE_NEW_SPELLBOOK}</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label htmlFor="spellbook-name">{MESSAGES.FORMS.SPELLBOOK_NAME_LABEL}</label>
                <input
                  type="text"
                  id="spellbook-name"
                  data-testid="input-spellbook-name"
                  value={newSpellbookName}
                  onChange={(e) => setNewSpellbookName(e.target.value)}
                  placeholder={MESSAGES.FORMS.SPELLBOOK_NAME_PLACEHOLDER}
                  autoFocus
                  required
                />
              </div>
              <div className="dialog-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setNewSpellbookName('');
                  }}
                  disabled={creating}
                >
                  Cancel
                </button>
                <LoadingButton
                  type="submit"
                  className="btn-primary"
                  data-testid="btn-save-spellbook"
                  loading={creating}
                  loadingText="Creating..."
                  disabled={!newSpellbookName.trim()}
                >
                  Create
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}

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
