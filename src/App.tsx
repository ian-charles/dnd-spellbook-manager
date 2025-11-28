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
import { useToast } from './hooks/useToast';
import { useSpellbookMutations } from './hooks/useSpellbookMutations';
import { spellService } from './services/spell.service';
import { SpellFilters as Filters, Spell } from './types/spell';
import { MESSAGES } from './constants/messages';
import './App.css';

/**
 * Main Application Component
 *
 * Orchestrates the D&D Spellbook Manager application.
 *
 * Responsibilities:
 * - Data Fetching: Manages spells and spellbooks data via custom hooks.
 * - Routing: Handles simple hash-based routing between views (Browse, Spellbooks, Detail).
 * - State Management: Manages UI state for filters, selection, and modals.
 * - Mutation Logic: Delegates complex spellbook operations to `useSpellbookMutations`.
 *
 * Key Features:
 * - Browse View: Filter and select spells to add to spellbooks.
 * - Spellbooks View: Manage existing spellbooks (create, delete, view).
 * - Batch Operations: Add multiple spells to spellbooks with progress feedback.
 */
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

  // Mutation hook
  const {
    isAddingSpells,
    handleAddToSpellbook,
    handleCreateSpellbook,
  } = useSpellbookMutations({
    spellbooks,
    addSpellToSpellbook,
    createSpellbook,
    refreshSpellbooks,
    displayToast,
    setAlertDialog,
    selectedSpellIds,
    setSelectedSpellIds,
    setCreateModalOpen,
    setPendingSpellIds,
    pendingSpellIds,
    targetSpellbookId,
  });


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
