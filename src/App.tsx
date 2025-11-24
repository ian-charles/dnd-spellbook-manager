import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SpellTable } from './components/SpellTable';
import { SpellFilters } from './components/SpellFilters';
import { SpellbookList } from './components/SpellbookList';
import { SpellbookDetail } from './components/SpellbookDetail';
import { AlertDialog } from './components/AlertDialog';
import { CreateSpellbookModal } from './components/CreateSpellbookModal';
import LoadingSpinner from './components/LoadingSpinner';
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
  const { spellbooks, addSpellToSpellbook, createSpellbook, refreshSpellbooks } = useSpellbooks();

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

    try {
      // Add all selected spells to the spellbook
      for (const spellId of selectedSpellIds) {
        await addSpellToSpellbook(targetSpellbookId, spellId);
      }

      // Ensure spellbooks list is refreshed to show updated spell counts
      refreshSpellbooks();

      setSelectedSpellIds(new Set()); // Clear selection after adding
      const count = selectedSpellIds.size;
      displayToast(count === 1 ? MESSAGES.SUCCESS.SPELL_ADDED : `${count} spells added to spellbook`);
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        title: MESSAGES.ERROR.FAILED_TO_ADD_SPELL,
        message: error instanceof Error ? error.message : MESSAGES.ERROR.FAILED_TO_ADD_SPELL_GENERIC,
        variant: 'error',
      });
    }
  };

  const handleCreateSpellbook = async (input: CreateSpellbookInput) => {
    try {
      const newSpellbook = await createSpellbook(input);

      // If there are pending spells, add them to the new spellbook
      if (pendingSpellIds.size > 0) {
        for (const spellId of pendingSpellIds) {
          await addSpellToSpellbook(newSpellbook.id, spellId);
        }
        const count = pendingSpellIds.size;
        displayToast(`Spellbook created with ${count} ${count === 1 ? 'spell' : 'spells'}`);
        setPendingSpellIds(new Set());
        setSelectedSpellIds(new Set());
      } else {
        displayToast('Spellbook created successfully');
      }

      // Ensure spellbooks list is refreshed to show the new spellbook with all spells
      refreshSpellbooks();

      setCreateModalOpen(false);
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  };

  const handleSelectSpellbook = async (spellbookId: string) => {
    if (selectedSpellIds.size === 0) return;

    try {
      // Add all selected spells to the spellbook
      for (const spellId of selectedSpellIds) {
        await addSpellToSpellbook(spellbookId, spellId);
      }
      spellbookSelector.closeModal();
      setSelectedSpellIds(new Set()); // Clear selection after adding
      const count = selectedSpellIds.size;
      displayToast(count === 1 ? MESSAGES.SUCCESS.SPELL_ADDED : `${count} spells added to spellbook`);
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
            <button
              className="btn-primary"
              onClick={handleAddToSpellbook}
              data-testid="btn-add-selected"
              disabled={selectedSpellIds.size === 0 || !targetSpellbookId}
            >
              Add {selectedSpellIds.size} {selectedSpellIds.size === 1 ? 'Spell' : 'Spells'}
            </button>
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
        <SpellbookList onSpellbookClick={navigateToSpellbookDetail} />
      )}

      {/* Spellbook Detail View */}
      {currentView === 'spellbook-detail' && selectedSpellbookId && (
        <SpellbookDetail
          spellbookId={selectedSpellbookId}
          onBack={navigateToSpellbooks}
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
        onCreate={handleCreateSpellbook}
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
