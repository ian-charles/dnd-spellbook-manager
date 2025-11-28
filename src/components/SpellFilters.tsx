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
    setLevelRange,
    toggleSchool,
    toggleClass,
    toggleConcentration,
    toggleRitual,
    toggleVerbal,
    toggleSomatic,
    toggleMaterial,
    clearFilters: clearFiltersAction,
  } = useFilterReducer();

  // Update parent component whenever filter state changes
  useEffect(() => {
    const filters: Filters = {
      searchText: state.searchText,
      levelRange: state.levelRange,
      schools: state.selectedSchools.length > 0 ? state.selectedSchools : undefined,
      classes: state.selectedClasses.length > 0 ? state.selectedClasses : undefined,
      concentration: state.concentrationOnly || undefined,
      ritual: state.ritualOnly || undefined,
      componentVerbal: state.verbalOnly || undefined,
      componentSomatic: state.somaticOnly || undefined,
      componentMaterial: state.materialOnly || undefined,
    };
    onFiltersChange(filters);
  }, [
    state.searchText,
    state.levelRange.min,
    state.levelRange.max,
    state.selectedSchools,
    state.selectedClasses,
    state.concentrationOnly,
    state.ritualOnly,
    state.verbalOnly,
    state.somaticOnly,
    state.materialOnly,
    onFiltersChange,
  ]);

  const handleSearchChange = (value: string) => {
    setSearchTextAction(value);
  };

  const handleClearFilters = () => {
    clearFiltersAction();
  };

  const getLevelLabel = (level: number) => {
    return level === 0 ? 'Cantrip' : level.toString();
  };

  // Check if any filters are active
  const hasActiveFilters =
    state.searchText.length > 0 ||
    (state.levelRange.min !== 0 || state.levelRange.max !== 9) ||
    state.selectedSchools.length > 0 ||
    state.selectedClasses.length > 0 ||
    state.concentrationOnly ||
    state.ritualOnly ||
    state.verbalOnly ||
    state.somaticOnly ||
    state.materialOnly;

  return (
    <div className="spell-filters">
      <div className="filter-section">
        <h3>Class</h3>
        <div className="filter-buttons">
          {classes.map((className) => (
            <button
              key={className}
              className={`filter-btn ${state.selectedClasses.includes(className) ? 'active' : ''}`}
              onClick={() => toggleClass(className)}
              data-class={className}
            >
              {className}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Spell Level</h3>
        <div className="level-dropdown-container">
          <label>
            <span>Min</span>
            <select
              value={state.levelRange.min}
              onChange={(e) => {
                const newMin = parseInt(e.target.value);
                setLevelRange({
                  min: newMin,
                  max: Math.max(newMin, state.levelRange.max)
                });
              }}
              className={`level-select level-select-${state.levelRange.min}`}
              data-testid="level-range-min"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                <option key={level} value={level}>
                  {level === 0 ? 'Cantrip' : level}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Max</span>
            <select
              value={state.levelRange.max}
              onChange={(e) => {
                const newMax = parseInt(e.target.value);
                setLevelRange({
                  min: Math.min(state.levelRange.min, newMax),
                  max: newMax
                });
              }}
              className={`level-select level-select-${state.levelRange.max}`}
              data-testid="level-range-max"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                <option key={level} value={level}>
                  {level === 0 ? 'Cantrip' : level}
                </option>
              ))}
            </select>
          </label>
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
        <div className="filter-checkboxes-inline">
          <div>
            <h3>Components</h3>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={state.verbalOnly}
                  onChange={toggleVerbal}
                />
                <span className="checkbox-badge checkbox-badge-verbal">Verbal</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={state.somaticOnly}
                  onChange={toggleSomatic}
                />
                <span className="checkbox-badge checkbox-badge-somatic">Somatic</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={state.materialOnly}
                  onChange={toggleMaterial}
                />
                <span className="checkbox-badge checkbox-badge-material">Material</span>
              </label>
            </div>
          </div>
          <div>
            <h3>Properties</h3>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={state.concentrationOnly}
                  onChange={toggleConcentration}
                />
                <span className="checkbox-badge checkbox-badge-concentration">Concentration</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={state.ritualOnly}
                  onChange={toggleRitual}
                />
                <span className="checkbox-badge checkbox-badge-ritual">Ritual</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search spells..."
          value={state.searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      {hasActiveFilters && (
        <button className="btn-clear-filters" onClick={handleClearFilters}>
          Clear All Filters
        </button>
      )}
    </div>
  );
}
