import { useState, useRef } from 'react';
import { useSpellbooks } from '../hooks/useSpellbooks';
import { exportImportService } from '../services/exportImport.service';
import { ConfirmDialog } from './ConfirmDialog';
import { AlertDialog } from './AlertDialog';
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
      console.error('Failed to create spellbook:', error);
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
      console.error('Failed to delete spellbook:', error);
      setConfirmDialog({ isOpen: false, spellbookId: '', spellbookName: '' });
      setAlertDialog({
        isOpen: true,
        title: 'Delete Failed',
        message: 'Failed to delete spellbook. Please try again.',
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
      console.error('Failed to export spellbooks:', error);
      setAlertDialog({
        isOpen: true,
        title: 'Export Failed',
        message: 'Failed to export spellbooks. Please try again.',
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
          title: 'Import Completed with Errors',
          message:
            `Imported: ${result.imported}\n` +
            `Skipped: ${result.skipped}\n` +
            `Errors: ${result.errors.length}\n\n` +
            result.errors.join('\n'),
          variant: 'warning',
        });
      } else {
        setAlertDialog({
          isOpen: true,
          title: 'Import Successful',
          message: `Imported: ${result.imported}\nSkipped: ${result.skipped}`,
          variant: 'success',
        });
      }

      // Refresh the spellbooks list
      refreshSpellbooks();
    } catch (error) {
      console.error('Failed to import spellbooks:', error);
      setAlertDialog({
        isOpen: true,
        title: 'Import Failed',
        message: `Failed to import spellbooks: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        <p>Loading spellbooks...</p>
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
            title={spellbooks.length === 0 ? 'No spellbooks to export' : 'Export all spellbooks'}
          >
            Export
          </button>
          <button
            className="btn-secondary"
            data-testid="btn-import-spellbooks"
            onClick={handleImportClick}
            disabled={importing}
          >
            {importing ? 'Importing...' : 'Import'}
          </button>
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
          <p>You don't have any spellbooks yet.</p>
          <p>Click "New Spellbook" to create your first one!</p>
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
            <h3>Create New Spellbook</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label htmlFor="spellbook-name">Spellbook Name</label>
                <input
                  type="text"
                  id="spellbook-name"
                  data-testid="input-spellbook-name"
                  value={newSpellbookName}
                  onChange={(e) => setNewSpellbookName(e.target.value)}
                  placeholder="e.g., My Wizard Spells"
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
                <button
                  type="submit"
                  className="btn-primary"
                  data-testid="btn-save-spellbook"
                  disabled={creating || !newSpellbookName.trim()}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
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
