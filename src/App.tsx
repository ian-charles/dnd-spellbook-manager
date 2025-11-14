import { useState, useEffect } from 'react';
import { SpellTable } from './components/SpellTable';
import { SpellFilters } from './components/SpellFilters';
import { useSpells } from './hooks/useSpells';
import { spellService } from './services/spell.service';
import { SpellFilters as Filters, Spell } from './types/spell';
import './App.css';

function App() {
  const { spells, loading, error } = useSpells();
  const [filters, setFilters] = useState<Filters>({});
  const [filteredSpells, setFilteredSpells] = useState<Spell[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && spells.length > 0) {
      setSchools(spellService.getSchools());
      setClasses(spellService.getClasses());
      setSources(spellService.getSources());
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
        <p>Browse {spells.length} spells • {filteredSpells.length} results</p>
      </header>

      <main className="app-main">
        <SpellFilters
          onFiltersChange={setFilters}
          schools={schools}
          classes={classes}
          sources={sources}
        />

        <SpellTable
          spells={filteredSpells}
          onSpellClick={handleSpellClick}
        />
      </main>
    </div>
  );
}

export default App;
