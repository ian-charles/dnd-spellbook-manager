import { useState, useEffect } from 'react';
import { SpellTable } from './components/SpellTable';
import { SpellFilters } from './components/SpellFilters';
import { SpellbookList } from './components/SpellbookList';
import { SpellbookDetail } from './components/SpellbookDetail';
import { useSpells } from './hooks/useSpells';
import { useSpellbooks } from './hooks/useSpellbooks';
import { spellService } from './services/spell.service';
import { SpellFilters as Filters, Spell } from './types/spell';
import './App.css';

type View = 'browse' | 'spellbooks' | 'spellbook-detail';

function App() {
  const { spells, loading, error } = useSpells();
  const { spellbooks, addSpellToSpellbook } = useSpellbooks();
  const [filters, setFilters] = useState<Filters>({});
  const [filteredSpells, setFilteredSpells] = useState<Spell[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<View>('browse');
  const [selectedSpellbookId, setSelectedSpellbookId] = useState<string | null>(null);
  const [showSpellbookSelector, setShowSpellbookSelector] = useState(false);
  const [spellToAdd, setSpellToAdd] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('/spellbooks/')) {
        const id = hash.split('/')[2];
        setSelectedSpellbookId(id);
        setCurrentView('spellbook-detail');
      } else if (hash === '/spellbooks') {
        setCurrentView('spellbooks');
      } else {
        setCurrentView('browse');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!loading && spells.length > 0) {
      setSchools(spellService.getSchools());
      setClasses(spellService.getClasses());
      setFilteredSpells(spells);
    }
  }, [spells, loading]);

  useEffect(() => {
    if (!loading && spells.length > 0) {
      const results = spellService.searchSpells(filters);
      setFilteredSpells(results);
    }
  }, [filters, spells, loading]);

  const handleSpellClick = (spell: Spell) => {
    console.log('Spell clicked:', spell.name);
    // TODO: Open spell detail modal
  };

  const handleAddToSpellbook = (spellId: string) => {
    if (spellbooks.length === 0) {
      alert('Create a spellbook first!');
      window.location.hash = '/spellbooks';
      return;
    }
    setSpellToAdd(spellId);
    setShowSpellbookSelector(true);
  };

  const handleSelectSpellbook = async (spellbookId: string) => {
    if (spellToAdd) {
      try {
        await addSpellToSpellbook(spellbookId, spellToAdd);
        setShowSpellbookSelector(false);
        setSpellToAdd(null);
        setAddSuccess(true);
        setTimeout(() => setAddSuccess(false), 2000);
      } catch (error) {
        console.error('Failed to add spell:', error);
        alert('Failed to add spell. It might already be in this spellbook.');
      }
    }
  };

  const navigateToSpellbooks = () => {
    window.location.hash = '/spellbooks';
  };

  const navigateToBrowse = () => {
    window.location.hash = '';
  };

  const navigateToSpellbookDetail = (spellbookId: string) => {
    window.location.hash = `/spellbooks/${spellbookId}`;
  };

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>D&D Spellbook Manager</h1>
        <nav className="app-nav">
          <button
            className={`nav-link ${currentView === 'browse' ? 'active' : ''}`}
            onClick={navigateToBrowse}
          >
            Browse Spells
          </button>
          <button
            className={`nav-link ${currentView === 'spellbooks' || currentView === 'spellbook-detail' ? 'active' : ''}`}
            onClick={navigateToSpellbooks}
            data-testid="nav-spellbooks"
          >
            My Spellbooks ({spellbooks.length})
          </button>
        </nav>
      </header>

      <main className="app-main">
        {currentView === 'browse' && (
          <>
            <div className="browse-header">
              <p>Browse {spells.length} spells • {filteredSpells.length} results</p>
            </div>
            <SpellFilters
              onFiltersChange={setFilters}
              schools={schools}
              classes={classes}
            />
            <SpellTable
              spells={filteredSpells}
              onSpellClick={handleSpellClick}
              onAddToSpellbook={spellbooks.length > 0 ? handleAddToSpellbook : undefined}
            />
          </>
        )}

        {currentView === 'spellbooks' && (
          <SpellbookList onSpellbookClick={navigateToSpellbookDetail} />
        )}

        {currentView === 'spellbook-detail' && selectedSpellbookId && (
          <SpellbookDetail
            spellbookId={selectedSpellbookId}
            onBack={navigateToSpellbooks}
          />
        )}
      </main>

      {showSpellbookSelector && (
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
                onClick={() => {
                  setShowSpellbookSelector(false);
                  setSpellToAdd(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {addSuccess && (
        <div className="success-toast" data-testid="add-spell-success">
          ✓ Spell added to spellbook!
        </div>
      )}
    </div>
  );
}

export default App;
