import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { BrowseView } from './components/BrowseView';
import { SpellbookList } from './components/SpellbookList';
import { SpellbookDetail } from './components/SpellbookDetail';
import { SpellDetailPage } from './components/SpellDetailPage';
import { AlertDialog } from './components/AlertDialog';
import { AboutModal } from './components/AboutModal';
import { Footer } from './components/Footer';
import { TutorialProvider, TutorialOverlay, TutorialMenu, useTutorial } from './components/tutorial';

import LoadingSpinner from './components/LoadingSpinner';
import { useSpells } from './hooks/useSpells';
import { useSpellbooks } from './hooks/useSpellbooks';
import { useHashRouter } from './hooks/useHashRouter';
import { useToast } from './hooks/useToast';
import { MESSAGES } from './constants/messages';
import './App.css';
import './components/tutorial/Tutorial.css';

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
function AppContent() {
  const { state, openMenu, activeTour, startTour, markPageTourSeen } = useTutorial();

  // Data hooks
  const { spells, loading, error } = useSpells();
  const {
    spellbooks,
    loading: spellbooksLoading,
    addSpellsToSpellbook,
    createSpellbook,
    updateSpellbook,
    deleteSpellbook,
    refreshSpellbooks,
  } = useSpellbooks();

  // Routing hook
  const {
    currentView,
    selectedSpellbookId,
    selectedSpellId,
    queryParams,
    navigateToBrowse,
    navigateToSpellbooks,
    navigateToSpellbookDetail,
  } = useHashRouter();

  // Toast hook for success messages
  const { isVisible: showToast, message: toastMessage, variant: toastVariant, showToast: displayToast } = useToast();

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

  // About modal state
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Show welcome tutorial menu on first visit after app loads
  useEffect(() => {
    if (!loading && !error && !state.hasSeenWelcome) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        openMenu();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, error, state.hasSeenWelcome, openMenu]);

  // Auto-trigger page-specific tours for users who opted into touring
  useEffect(() => {
    // Only auto-trigger if user accepted the tour
    if (!state.wantsTour) return;
    // Don't interrupt an active tour
    if (activeTour) return;
    // Don't auto-trigger while loading
    if (loading) return;

    // Map views to their corresponding tour IDs
    const tourForView: Record<string, 'spellbooks-list' | 'spellbook-detail' | null> = {
      'browse': null, // Already shown via welcome flow
      'spellbooks': 'spellbooks-list',
      'spellbook-detail': 'spellbook-detail',
      'spell-detail': null,
    };

    const tourId = tourForView[currentView];
    if (tourId && !state.seenPageTours.includes(tourId)) {
      // Small delay to ensure the view has rendered
      const timer = setTimeout(() => {
        markPageTourSeen(tourId);
        startTour(tourId);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentView, state.wantsTour, state.seenPageTours, activeTour, loading, startTour, markPageTourSeen]);

  // Handler for navigating back after spellbook deletion
  // Refreshes the spellbooks list to ensure deleted book is removed from UI
  const handleSpellbookDeleted = async (spellbookName?: string) => {
    await refreshSpellbooks();
    navigateToSpellbooks();

    // Show delete toast after navigation (when deleting from detail page)
    if (spellbookName) {
      displayToast(MESSAGES.SUCCESS.SPELLBOOK_DELETED(spellbookName), 'error');
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
      onAboutClick={() => setIsAboutModalOpen(true)}
      onHelpClick={openMenu}
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
          onUpdateSpellbook={updateSpellbook}
          onDeleteSpellbook={deleteSpellbook}
          onRefreshSpellbooks={refreshSpellbooks}
          onAddSpellsToSpellbook={addSpellsToSpellbook}
          onSuccess={displayToast}
        />
      )}

      {/* Spellbook Detail View */}
      {currentView === 'spellbook-detail' && selectedSpellbookId && (
        <SpellbookDetail
          spellbookId={selectedSpellbookId}
          openEditModal={queryParams?.get('edit') === 'true'}
          onBack={navigateToSpellbooks}
          onCopySpellbook={navigateToSpellbookDetail}
          onDeleteSpellbook={handleSpellbookDeleted}
          onSuccess={displayToast}
        />
      )}

      {/* Spell Detail View */}
      {currentView === 'spell-detail' && selectedSpellId && (
        <SpellDetailPage spellId={selectedSpellId} />
      )}

      {/* Toast */}
      {showToast && (
        <div className={`toast toast-${toastVariant}`} data-testid="toast">
          {toastMessage}
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

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Footer (visible on mobile/tablet only) */}
      <Footer onAboutClick={() => setIsAboutModalOpen(true)} />

      {/* Tutorial System */}
      <TutorialOverlay />
      <TutorialMenu />
    </Layout>
  );
}

function App() {
  return (
    <TutorialProvider>
      <AppContent />
    </TutorialProvider>
  );
}

export default App;
