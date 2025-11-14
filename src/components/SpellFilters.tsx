import { useState } from 'react';
import { SpellFilters as Filters } from '../types/spell';
import './SpellFilters.css';

interface SpellFiltersProps {
  onFiltersChange: (filters: Filters) => void;
  schools: string[];
  classes: string[];
  sources: string[];
}

export function SpellFilters({ onFiltersChange, schools, classes, sources }: SpellFiltersProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [concentrationOnly, setConcentrationOnly] = useState(false);
  const [ritualOnly, setRitualOnly] = useState(false);

  const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const updateFilters = (updates: Partial<Filters>) => {
    const filters: Filters = {
      searchText: updates.searchText ?? searchText,
      levels: updates.levels ?? (selectedLevels.length > 0 ? selectedLevels : undefined),
      schools: updates.schools ?? (selectedSchools.length > 0 ? selectedSchools : undefined),
      classes: updates.classes ?? (selectedClasses.length > 0 ? selectedClasses : undefined),
      sources: updates.sources ?? (selectedSources.length > 0 ? selectedSources : undefined),
      concentration: updates.concentration ?? (concentrationOnly || undefined),
      ritual: updates.ritual ?? (ritualOnly || undefined),
    };
    onFiltersChange(filters);
  };

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    updateFilters({ searchText: value });
  };

  const toggleLevel = (level: number) => {
    const newLevels = selectedLevels.includes(level)
      ? selectedLevels.filter((l) => l !== level)
      : [...selectedLevels, level];
    setSelectedLevels(newLevels);
    updateFilters({ levels: newLevels.length > 0 ? newLevels : undefined });
  };

  const toggleSchool = (school: string) => {
    const newSchools = selectedSchools.includes(school)
      ? selectedSchools.filter((s) => s !== school)
      : [...selectedSchools, school];
    setSelectedSchools(newSchools);
    updateFilters({ schools: newSchools.length > 0 ? newSchools : undefined });
  };

  const toggleClass = (className: string) => {
    const newClasses = selectedClasses.includes(className)
      ? selectedClasses.filter((c) => c !== className)
      : [...selectedClasses, className];
    setSelectedClasses(newClasses);
    updateFilters({ classes: newClasses.length > 0 ? newClasses : undefined });
  };

  const toggleSource = (source: string) => {
    const newSources = selectedSources.includes(source)
      ? selectedSources.filter((s) => s !== source)
      : [...selectedSources, source];
    setSelectedSources(newSources);
    updateFilters({ sources: newSources.length > 0 ? newSources : undefined });
  };

  const toggleConcentration = () => {
    const newValue = !concentrationOnly;
    setConcentrationOnly(newValue);
    updateFilters({ concentration: newValue || undefined });
  };

  const toggleRitual = () => {
    const newValue = !ritualOnly;
    setRitualOnly(newValue);
    updateFilters({ ritual: newValue || undefined });
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedLevels([]);
    setSelectedSchools([]);
    setSelectedClasses([]);
    setSelectedSources([]);
    setConcentrationOnly(false);
    setRitualOnly(false);
    onFiltersChange({});
  };

  return (
    <div className="spell-filters">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search spells..."
          value={searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-section">
        <h3>Spell Level</h3>
        <div className="filter-buttons">
          {levels.map((level) => (
            <button
              key={level}
              className={`filter-btn ${selectedLevels.includes(level) ? 'active' : ''}`}
              onClick={() => toggleLevel(level)}
            >
              {level === 0 ? 'Cantrip' : level}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>School</h3>
        <div className="filter-buttons">
          {schools.map((school) => (
            <button
              key={school}
              className={`filter-btn ${selectedSchools.includes(school) ? 'active' : ''}`}
              onClick={() => toggleSchool(school)}
            >
              {school}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Class</h3>
        <div className="filter-buttons">
          {classes.map((className) => (
            <button
              key={className}
              className={`filter-btn ${selectedClasses.includes(className) ? 'active' : ''}`}
              onClick={() => toggleClass(className)}
            >
              {className}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Source</h3>
        <div className="filter-buttons">
          {sources.map((source) => (
            <button
              key={source}
              className={`filter-btn ${selectedSources.includes(source) ? 'active' : ''}`}
              onClick={() => toggleSource(source)}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Properties</h3>
        <div className="filter-checkboxes">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={concentrationOnly}
              onChange={toggleConcentration}
            />
            <span>Concentration</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={ritualOnly}
              onChange={toggleRitual}
            />
            <span>Ritual</span>
          </label>
        </div>
      </div>

      <button className="btn-clear-filters" onClick={clearFilters}>
        Clear All Filters
      </button>
    </div>
  );
}
