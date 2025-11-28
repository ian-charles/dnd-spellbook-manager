import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SpellTable } from './components/SpellTable';
import { SpellFilters } from './components/SpellFilters';
import { SpellbookList } from './components/SpellbookList';
import { SpellbookDetail } from './components/SpellbookDetail';
import { AlertDialog } from './components/AlertDialog';
import { CreateSpellbookModal } from './components/CreateSpellbookModal';
import LoadingSpinner from './components/LoadingSpinner';
import { LoadingButton } from './components/LoadingButton';
import { useSpells } from './hooks/useSpells';
import { useSpellbooks } from './hooks/useSpellbooks';
import { useHashRouter } from './hooks/useHashRouter';
import { useModal } from './hooks/useModal';
import { useToast } from './hooks/useToast';
import { spellService } from './services/spell.service';
import { SpellFilters as Filters, Spell } from './types/spell';
import { CreateSpellbookInput } from './types/spellbook';
import { MESSAGES } from './constants/messages';
import './App.css';

function App() {
  // Data hooks
  const { spells, loading, error } = useSpells();
  const {
    spellbooks,
    loading: spellbooksLoading,
    addSpellToSpellbook,
    createSpellbook,
    deleteSpellbook,
    refreshSpellbooks,
  } = useSpellbooks();

  // Routing hook
  const {
    currentView,
    selectedSpellbookId,
    navigateToBrowse,
    navigateToSpellbooks,
    navigateToSpellbookDetail,
  } = useHashRouter();

  // Modal hook for spellbook selector
  const spellbookSelector = useModal<string>();

  // Toast hook for success messages
  const { isVisible: showToast, showToast: displayToast } = useToast();

  // Alert dialog state
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

  // Spell filtering state
  const [filters, setFilters] = useState<Filters>({});
  const [filteredSpells, setFilteredSpells] = useState<Spell[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);

  // Selected spells state (persists across filter changes)
  const [selectedSpellIds, setSelectedSpellIds] = useState<Set<string>>(new Set());
  const [targetSpellbookId, setTargetSpellbookId] = useState<string>('');

  // Create spellbook modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pendingSpellIds, setPendingSpellIds] = useState<Set<string>>(new Set());

  // Initialize schools and classes when spells load
  useEffect(() => {
    if (!loading && spells.length > 0) {
      setSchools(spellService.getSchools());
      setClasses(spellService.getClasses());
      setFilteredSpells(spells);
    }
  }, [spells, loading]);

  // Filter spells when filters change
  useEffect(() => {
    if (!loading && spells.length > 0) {
      const results = spellService.searchSpells(filters);
      setFilteredSpells(results);
    }
  }, [filters, spells, loading]);

  // Loading state for batch operations
  const [isAddingSpells, setIsAddingSpells] = useState(false);

  const handleAddToSpellbook = async () => {
    if (selectedSpellIds.size === 0) {
      setAlertDialog({
        isOpen: true,
        title: 'No Spells Selected',
        message: 'Please select at least one spell to add to a spellbook.',
        variant: 'info',
      });
      return;
    }

    if (!targetSpellbookId) {
      setAlertDialog({
        isOpen: true,
        title: 'No Spellbook Selected',
        message: 'Please select a spellbook from the dropdown menu.',
        variant: 'info',
      });
      return;
    }

    // If "new" is selected, open create spellbook modal with pending spells
    if (targetSpellbookId === 'new') {
      setPendingSpellIds(new Set(selectedSpellIds));
      setCreateModalOpen(true);
      return;
    }

    // Validate spellbook exists
    const targetExists = spellbooks.some(sb => sb.id === targetSpellbookId);
    if (!targetExists) {
      setAlertDialog({
        isOpen: true,
        title: 'Spellbook Not Found',
        message: 'The selected spellbook no longer exists. Please select another spellbook.',
        variant: 'error',
      });
      return;
    }

    setIsAddingSpells(true);
    try {
      // Add all selected spells to the spellbook in parallel
      const results = await Promise.allSettled(
        Array.from(selectedSpellIds).map(spellId => addSpellToSpellbook(targetSpellbookId, spellId))
      );

      // Check for failures
      const failed = results.filter(r => r.status === 'rejected');

      // Ensure spellbooks list is refreshed to show updated spell counts
      await refreshSpellbooks();

      if (failed.length > 0) {
        const successCount = selectedSpellIds.size - failed.length;
        if (successCount > 0) {
          displayToast(`Added ${successCount} spells. Failed to add ${failed.length} spells.`);
        } else {
          throw new Error(`Failed to add any spells to the spellbook.`);
        }
      } else {
        const count = selectedSpellIds.size; // Calculate count BEFORE clearing
        displayToast(count === 1 ? MESSAGES.SUCCESS.SPELL_ADDED : `${count} spells added to spellbook`);
      }

      setSelectedSpellIds(new Set()); // Clear selection after adding
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        title: MESSAGES.ERROR.FAILED_TO_ADD_SPELL,
        message: error instanceof Error ? error.message : MESSAGES.ERROR.FAILED_TO_ADD_SPELL_GENERIC,
        variant: 'error',
      });
    } finally {
      setIsAddingSpells(false);
    }
  };

  const handleCreateSpellbook = async (input: CreateSpellbookInput) => {
    try {
      const newSpellbook = await createSpellbook(input);

      // If there are pending spells, add them to the new spellbook
      if (pendingSpellIds.size > 0) {
        setIsAddingSpells(true);

        // Add spells in parallel
        const results = await Promise.allSettled(
          Array.from(pendingSpellIds).map(spellId => addSpellToSpellbook(newSpellbook.id, spellId))
        );

        const failed = results.filter(r => r.status === 'rejected');

        // Ensure spellbooks list is refreshed to show updated spell counts
        await refreshSpellbooks();

        if (failed.length > 0) {
          // If some failed, we still show success for the ones that worked, but warn about failures
          const successCount = pendingSpellIds.size - failed.length;
          if (successCount > 0) {
            displayToast(`Spellbook created with ${successCount} spells. Failed to add ${failed.length} spells.`);
          } else {
            throw new Error(`Failed to add any spells to the new spellbook.`);
          }
        } else {
          const count = pendingSpellIds.size;
          displayToast(`Spellbook created with ${count} ${count === 1 ? 'spell' : 'spells'}`);
        }

        setPendingSpellIds(new Set());
        setSelectedSpellIds(new Set());
      } else {
        displayToast('Spellbook created successfully');
        // Always refresh and close modal
        await refreshSpellbooks();
      }
    } catch (error) {
      throw error; // Let the modal handle the error
    } finally {
      setIsAddingSpells(false);
      setCreateModalOpen(false);
    }
  };

  const handleSelectSpellbook = async (spellbookId: string) => {
    if (selectedSpellIds.size === 0) return;

    try {
      // Add all selected spells to the spellbook in parallel
      const results = await Promise.allSettled(
        Array.from(selectedSpellIds).map(spellId => addSpellToSpellbook(spellbookId, spellId))
      );

      const failed = results.filter(r => r.status === 'rejected');

      spellbookSelector.closeModal();

      // Ensure spellbooks list is refreshed to show updated spell counts
      await refreshSpellbooks();

      if (failed.length > 0) {
        const successCount = selectedSpellIds.size - failed.length;
        if (successCount > 0) {
          displayToast(`Added ${successCount} spells. Failed to add ${failed.length} spells.`);
        } else {
          throw new Error(`Failed to add any spells to the spellbook.`);
        }
      } else {
        const count = selectedSpellIds.size; // Calculate count BEFORE clearing
        displayToast(count === 1 ? MESSAGES.SUCCESS.SPELL_ADDED : `${count} spells added to spellbook`);
      }

      setSelectedSpellIds(new Set()); // Clear selection after adding
    } catch (error) {
      spellbookSelector.closeModal();
      setAlertDialog({
        isOpen: true,
        title: MESSAGES.ERROR.FAILED_TO_ADD_SPELL,
        message: error instanceof Error ? error.message : MESSAGES.ERROR.FAILED_TO_ADD_SPELL_GENERIC,
        variant: 'error',
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="app">
        <LoadingSpinner size="large" message={MESSAGES.LOADING.SPELLS} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>{MESSAGES.ERROR.ERROR_LOADING_SPELLS}</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  // Main app render
  return (
    <Layout
      currentView={currentView}
      spellbookCount={spellbooks.length}
      onNavigateToBrowse={navigateToBrowse}
      onNavigateToSpellbooks={navigateToSpellbooks}
    >
      {/* Browse View */}
      {currentView === 'browse' && (
        <>
          <div className="browse-header">
            <p>
              Browse {spells.length} spells • {filteredSpells.length} results
              {selectedSpellIds.size > 0 && ` • ${selectedSpellIds.size} selected`}
            </p>
          </div>
          <SpellFilters
            onFiltersChange={setFilters}
            schools={schools}
            classes={classes}
          />
          <div className="batch-add-container">
            <button
              className="btn-secondary"
              onClick={() => setSelectedSpellIds(new Set())}
              data-testid="btn-unselect-all"
              disabled={selectedSpellIds.size === 0}
            >
              Unselect All
            </button>
            <select
              className="spellbook-dropdown"
              value={targetSpellbookId}
              onChange={(e) => setTargetSpellbookId(e.target.value)}
              data-testid="spellbook-dropdown"
            >
              <option value="">Select a spellbook...</option>
              <option value="new">+ Create New Spellbook</option>
              {spellbooks.map((spellbook) => (
                <option key={spellbook.id} value={spellbook.id}>
                  {spellbook.name} ({spellbook.spells.length} spells)
                </option>
              ))}
            </select>
            <LoadingButton
              className="btn-primary"
              onClick={handleAddToSpellbook}
              data-testid="btn-add-selected"
              disabled={selectedSpellIds.size === 0 || !targetSpellbookId}
              loading={isAddingSpells}
              loadingText="Adding..."
            >
              Add {selectedSpellIds.size} {selectedSpellIds.size === 1 ? 'Spell' : 'Spells'}
            </LoadingButton>
          </div>
          <SpellTable
            spells={filteredSpells}
            selectedSpellIds={selectedSpellIds}
            onSelectionChange={setSelectedSpellIds}
            onAddToSpellbook={handleAddToSpellbook}
          />
        </>
      )}

      {/* Spellbooks List View */}
      {currentView === 'spellbooks' && (
        <SpellbookList
          spellbooks={spellbooks}
          loading={spellbooksLoading}
          onSpellbookClick={navigateToSpellbookDetail}
          onCreateSpellbook={createSpellbook}
          onDeleteSpellbook={deleteSpellbook}
          onRefreshSpellbooks={refreshSpellbooks}
          onAddSpellToSpellbook={addSpellToSpellbook}
        />
      )}

      {/* Spellbook Detail View */}
      {currentView === 'spellbook-detail' && selectedSpellbookId && (
        <SpellbookDetail
          spellbookId={selectedSpellbookId}
          onBack={navigateToSpellbooks}
          onCopySpellbook={() => {
            window.location.hash = `#spellbooks?copy=${selectedSpellbookId}`;
          }}
        />
      )}

      {/* Spellbook Selector Modal */}
      {spellbookSelector.isOpen && (
        <div className="dialog-overlay" data-testid="spellbook-selector">
          <div className="dialog">
            <h3>{MESSAGES.DIALOG.ADD_TO_SPELLBOOK}</h3>
            <p>
              {selectedSpellIds.size === 1
                ? MESSAGES.DIALOG.SELECT_SPELLBOOK
                : `Select a spellbook to add ${selectedSpellIds.size} spells to:`}
            </p>
            <div className="spellbook-selector-list">
              {spellbooks.map((spellbook) => (
                <button
                  key={spellbook.id}
                  className="spellbook-selector-item"
                  onClick={() => handleSelectSpellbook(spellbook.id)}
                  data-testid={`select-spellbook-${spellbook.id}`}
                >
                  <strong>{spellbook.name}</strong>
                  <span>{spellbook.spells.length} spells</span>
                </button>
              ))}
            </div>
            <div className="dialog-actions">
              <button
                className="btn-secondary"
                onClick={spellbookSelector.closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Spellbook Modal */}
      <CreateSpellbookModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setPendingSpellIds(new Set());
        }}
        onSubmit={handleCreateSpellbook}
        existingNames={spellbooks.map(sb => sb.name)}
      />

      {/* Success Toast */}
      {showToast && (
        <div className="success-toast" data-testid="add-spell-success">
          {MESSAGES.SUCCESS.SPELL_ADDED}
        </div>
      )}

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        variant={alertDialog.variant}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
      />
    </Layout>
  );
}

export default App;
