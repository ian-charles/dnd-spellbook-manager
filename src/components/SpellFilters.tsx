/**
 * SpellFilters Component
 *
 * Filter UI for spell browsing.
 * Uses useFilterReducer hook for centralized state management.
 *
 * Refactored to use useReducer instead of 9 separate useState calls.
 * This provides cleaner, more predictable state management.
 */

import { useState, useEffect } from 'react';
import { MIN_SPELL_LEVEL, MAX_SPELL_LEVEL } from '../constants/gameRules';
import { UseFilterReducerReturn } from '../hooks/useFilterReducer';
import './SpellFilters.css';

// ... (interface remains same)

/**
 * Props for the SpellFilters component.
 * Extends the return type of useFilterReducer to include schools and classes.
 */
interface SpellFiltersProps extends UseFilterReducerReturn {
  /**
   * List of available spell schools to filter by.
   */
  schools: string[];

  /**
   * List of available spell classes to filter by.
   */
  classes: string[];
}

export function SpellFilters({
  state,
  setSearchText,
  setLevelRange,
  toggleSchool,
  toggleClass,
  toggleConcentration,
  toggleRitual,
  toggleVerbal,
  toggleSomatic,
  toggleMaterial,
  clearFilters,
  schools,
  classes
}: SpellFiltersProps) {
  const [localSearchText, setLocalSearchText] = useState(state.searchText);

  // Sync local state with prop when prop changes (e.g. clear filters)
  useEffect(() => {
    setLocalSearchText(state.searchText);
  }, [state.searchText]);

  // Debounce search updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchText !== state.searchText) {
        setSearchText(localSearchText);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchText, setSearchText, state.searchText]);

  const handleSearchChange = (value: string) => {
    setLocalSearchText(value);
  };

  const handleClearFilters = () => {
    clearFilters();
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
              aria-pressed={state.selectedClasses.includes(className)}
              aria-label={`Filter by class ${className}`}
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
              aria-label="Minimum spell level"
            >
              {Array.from({ length: MAX_SPELL_LEVEL - MIN_SPELL_LEVEL + 1 }, (_, i) => i + MIN_SPELL_LEVEL).map((level) => (
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
              aria-label="Maximum spell level"
            >
              {Array.from({ length: MAX_SPELL_LEVEL - MIN_SPELL_LEVEL + 1 }, (_, i) => i + MIN_SPELL_LEVEL).map((level) => (
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
              aria-pressed={state.selectedSchools.includes(school)}
              aria-label={`Filter by school ${school}`}
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
                  aria-label="Filter by Verbal component"
                />
                <span className="checkbox-badge checkbox-badge-verbal">Verbal</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={state.somaticOnly}
                  onChange={toggleSomatic}
                  aria-label="Filter by Somatic component"
                />
                <span className="checkbox-badge checkbox-badge-somatic">Somatic</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={state.materialOnly}
                  onChange={toggleMaterial}
                  aria-label="Filter by Material component"
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
                  aria-label="Filter by Concentration"
                />
                <span className="checkbox-badge checkbox-badge-concentration">Concentration</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={state.ritualOnly}
                  onChange={toggleRitual}
                  aria-label="Filter by Ritual"
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
          value={localSearchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="search-input"
          aria-label="Search spells"
        />
      </div>

      {hasActiveFilters && (
        <button
          className="btn-clear-filters"
          onClick={handleClearFilters}
          aria-label="Clear all active filters"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
