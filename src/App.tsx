import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SpellTable } from './components/SpellTable';
import { SpellFilters } from './components/SpellFilters';
import { SpellbookList } from './components/SpellbookList';
import { SpellbookDetail } from './components/SpellbookDetail';
import { useSpells } from './hooks/useSpells';
import { useSpellbooks } from './hooks/useSpellbooks';
import { useHashRouter } from './hooks/useHashRouter';
import { useModal } from './hooks/useModal';
import { useToast } from './hooks/useToast';
import { spellService } from './services/spell.service';
import { SpellFilters as Filters, Spell } from './types/spell';
import './App.css';

function App() {
  // Data hooks
  const { spells, loading, error } = useSpells();
  const { spellbooks, addSpellToSpellbook } = useSpellbooks();

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

  // Spell filtering state
  const [filters, setFilters] = useState<Filters>({});
  const [filteredSpells, setFilteredSpells] = useState<Spell[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);

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

  const handleAddToSpellbook = (spellId: string) => {
    if (spellbooks.length === 0) {
      alert('Create a spellbook first!');
      navigateToSpellbooks();
      return;
    }
    spellbookSelector.openModal(spellId);
  };

  const handleSelectSpellbook = async (spellbookId: string) => {
    const spellId = spellbookSelector.data;
    if (spellId) {
      try {
        await addSpellToSpellbook(spellbookId, spellId);
        spellbookSelector.closeModal();
        displayToast('✓ Spell added to spellbook!');
      } catch (error) {
        console.error('Failed to add spell:', error);
        alert('Failed to add spell. It might already be in this spellbook.');
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <h2>Loading spells...</h2>
          <p>Fetching spell data from the archive...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>Error loading spells</h2>
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
            </p>
          </div>
          <SpellFilters
            onFiltersChange={setFilters}
            schools={schools}
            classes={classes}
          />
          <SpellTable
            spells={filteredSpells}
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
            <h3>Add to Spellbook</h3>
            <p>Select a spellbook:</p>
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

      {/* Success Toast */}
      {showToast && (
        <div className="success-toast" data-testid="add-spell-success">
          ✓ Spell added to spellbook!
        </div>
      )}
    </Layout>
  );
}

export default App;
