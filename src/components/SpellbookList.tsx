import { useState, useRef } from 'react';
import { useSpellbooks } from '../hooks/useSpellbooks';
import { exportImportService } from '../services/exportImport.service';
import { ConfirmDialog } from './ConfirmDialog';
import { AlertDialog } from './AlertDialog';
import { CreateSpellbookModal } from './CreateSpellbookModal';
import LoadingSpinner from './LoadingSpinner';
import { LoadingButton } from './LoadingButton';
import { CreateSpellbookInput } from '../types/spellbook';
import { MESSAGES } from '../constants/messages';
import './SpellbookList.css';

interface SpellbookListProps {
  onSpellbookClick: (spellbookId: string) => void;
}

export function SpellbookList({ onSpellbookClick }: SpellbookListProps) {
  const { spellbooks, loading, createSpellbook, deleteSpellbook, refreshSpellbooks, addSpellToSpellbook } = useSpellbooks();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [copyData, setCopyData] = useState<{
    name: string;
    spellcastingAbility?: 'INT' | 'WIS' | 'CHA';
    spellAttackModifier?: number;
    spellSaveDC?: number;
    sourceSpellbookId?: string;
  } | undefined>(undefined);
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

  const handleCreateSpellbook = async (input: CreateSpellbookInput) => {
    try {
      const newSpellbook = await createSpellbook(input);

      // If this is a copy operation, copy all spells from the source spellbook
      if (copyData?.sourceSpellbookId) {
        const sourceSpellbook = spellbooks.find(sb => sb.id === copyData.sourceSpellbookId);
        if (sourceSpellbook) {
          // Copy all spells from the source spellbook to the new one
          for (const spell of sourceSpellbook.spells) {
            await addSpellToSpellbook(newSpellbook.id, spell.spellId);
          }
        }
      }

      // Ensure spellbooks list is refreshed to show the new/updated spellbook
      refreshSpellbooks();

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
        <table className="spellbooks-table" data-testid="spellbooks-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Spells</th>
              <th>Ability</th>
              <th>Attack</th>
              <th>Save DC</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {spellbooks.map((spellbook) => (
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
