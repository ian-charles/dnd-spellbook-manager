import { useState } from 'react';
import { Layout } from './components/Layout';
import { BrowseView } from './components/BrowseView';
import { SpellbookList } from './components/SpellbookList';
import { SpellbookDetail } from './components/SpellbookDetail';
import { AlertDialog } from './components/AlertDialog';
import { BackToTopButton } from './components/BackToTopButton';

import LoadingSpinner from './components/LoadingSpinner';
import { useSpells } from './hooks/useSpells';
import { useSpellbooks } from './hooks/useSpellbooks';
import { useHashRouter } from './hooks/useHashRouter';
import { useToast } from './hooks/useToast';
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
    addSpellsToSpellbook,
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
    navigateToCopySpellbook,
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
        <BrowseView
          spells={spells}
          spellbooks={spellbooks}
          loading={loading}
          addSpellsToSpellbook={addSpellsToSpellbook}
          createSpellbook={createSpellbook}
          refreshSpellbooks={refreshSpellbooks}
          onSuccess={displayToast}
          onError={(title, message) => setAlertDialog({ isOpen: true, title, message, variant: 'error' })}
          onInfo={(title, message) => setAlertDialog({ isOpen: true, title, message, variant: 'info' })}
        />
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
          onAddSpellsToSpellbook={addSpellsToSpellbook}
        />
      )}

      {/* Spellbook Detail View */}
      {currentView === 'spellbook-detail' && selectedSpellbookId && (
        <SpellbookDetail
          spellbookId={selectedSpellbookId}
          onBack={navigateToSpellbooks}
          onCopySpellbook={() => {
            navigateToCopySpellbook(selectedSpellbookId);
          }}
        />
      )}

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

      {/* Back to Top Button */}
      <BackToTopButton />
    </Layout>
  );
}

export default App;
