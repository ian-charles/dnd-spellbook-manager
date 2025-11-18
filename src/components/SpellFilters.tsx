/**
 * SpellFilters Component
 *
 * Filter UI for spell browsing.
 * Uses useFilterReducer hook for centralized state management.
 *
 * Refactored to use useReducer instead of 9 separate useState calls.
 * This provides cleaner, more predictable state management.
 */

import { useEffect } from 'react';
import { SpellFilters as Filters } from '../types/spell';
import { useFilterReducer } from '../hooks/useFilterReducer';
import './SpellFilters.css';

interface SpellFiltersProps {
  onFiltersChange: (filters: Filters) => void;
  schools: string[];
  classes: string[];
}

export function SpellFilters({ onFiltersChange, schools, classes }: SpellFiltersProps) {
  const {
    state,
    setSearchText: setSearchTextAction,
    toggleLevel,
    toggleSchool,
    toggleClass,
    toggleConcentration,
    toggleRitual,
    toggleVerbal,
    toggleSomatic,
    toggleMaterial,
    clearFilters: clearFiltersAction,
  } = useFilterReducer();

  const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Update parent component whenever filter state changes
  useEffect(() => {
    const filters: Filters = {
      searchText: state.searchText,
      levels: state.selectedLevels.length > 0 ? state.selectedLevels : undefined,
      schools: state.selectedSchools.length > 0 ? state.selectedSchools : undefined,
      classes: state.selectedClasses.length > 0 ? state.selectedClasses : undefined,
      concentration: state.concentrationOnly || undefined,
      ritual: state.ritualOnly || undefined,
      componentVerbal: state.verbalOnly || undefined,
      componentSomatic: state.somaticOnly || undefined,
      componentMaterial: state.materialOnly || undefined,
    };
    onFiltersChange(filters);
  }, [state, onFiltersChange]);

  const handleSearchChange = (value: string) => {
    setSearchTextAction(value);
  };

  const handleClearFilters = () => {
    clearFiltersAction();
  };

  // Check if any filters are active
  const hasActiveFilters =
    state.searchText.length > 0 ||
    state.selectedLevels.length > 0 ||
    state.selectedSchools.length > 0 ||
    state.selectedClasses.length > 0 ||
    state.concentrationOnly ||
    state.ritualOnly ||
    state.verbalOnly ||
    state.somaticOnly ||
    state.materialOnly;

  return (
    <div className="spell-filters">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search spells..."
          value={state.searchText}
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
              className={`filter-btn ${state.selectedLevels.includes(level) ? 'active' : ''}`}
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
              className={`filter-btn ${state.selectedSchools.includes(school) ? 'active' : ''}`}
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
              className={`filter-btn ${state.selectedClasses.includes(className) ? 'active' : ''}`}
              onClick={() => toggleClass(className)}
            >
              {className}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Components</h3>
        <div className="filter-checkboxes">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={state.verbalOnly}
              onChange={toggleVerbal}
            />
            <span>Verbal (V)</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={state.somaticOnly}
              onChange={toggleSomatic}
            />
            <span>Somatic (S)</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={state.materialOnly}
              onChange={toggleMaterial}
            />
            <span>Material (M)</span>
          </label>
        </div>
      </div>

      <div className="filter-section">
        <h3>Properties</h3>
        <div className="filter-checkboxes">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={state.concentrationOnly}
              onChange={toggleConcentration}
            />
            <span>Concentration</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={state.ritualOnly}
              onChange={toggleRitual}
            />
            <span>Ritual</span>
          </label>
        </div>
      </div>

      {hasActiveFilters && (
        <button className="btn-clear-filters" onClick={handleClearFilters}>
          Clear All Filters
        </button>
      )}
    </div>
  );
}
