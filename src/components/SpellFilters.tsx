/**
 * SpellFilters Component
 *
 * Filter UI for spell browsing.
 * Uses useFilterReducer hook for centralized state management.
 *
 * Refactored to use useReducer instead of 9 separate useState calls.
 * This provides cleaner, more predictable state management.
 */

import { useState, useEffect, useCallback } from 'react';
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

  /**
   * Number of filtered spells (results count)
   */
  filteredCount?: number;

  /**
   * Total number of spells
   */
  totalCount?: number;

  /**
   * Number of selected spells
   */
  selectedCount?: number;
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
  classes,
  filteredCount,
  totalCount,
  selectedCount
}: SpellFiltersProps) {
  const [localSearchText, setLocalSearchText] = useState(state.searchText);

  // Collapsed state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('spellFiltersCollapsed');
    if (saved !== null) {
      return saved === 'true';
    }
    // Default: collapsed on mobile, expanded on desktop
    return window.innerWidth < 768;
  });

  // Persist collapse state to localStorage
  useEffect(() => {
    localStorage.setItem('spellFiltersCollapsed', String(isCollapsed));
  }, [isCollapsed]);

  // Toggle collapse state
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

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

  // Count active filters (excluding search text)
  const activeFilterCount = [
    state.levelRange.min !== 0 || state.levelRange.max !== 9,
    state.selectedSchools.length > 0,
    state.selectedClasses.length > 0,
    state.concentrationOnly,
    state.ritualOnly,
    state.verbalOnly,
    state.somaticOnly,
    state.materialOnly,
  ].filter(Boolean).length;

  return (
    <div className="spell-filters">
      {/* Search Box - Always Visible */}
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

      {/* Collapse/Expand Button */}
      <button
        className="filters-toggle-btn"
        onClick={toggleCollapse}
        aria-expanded={!isCollapsed}
        aria-label={isCollapsed ? 'Show filters' : 'Hide filters'}
      >
        <span className="filters-toggle-icon">
          {isCollapsed ? '▼' : '▲'}
        </span>
        <span className="filters-toggle-text">
          {isCollapsed ? 'Show Filters' : 'Hide Filters'}
        </span>
        {isCollapsed && activeFilterCount > 0 && (
          <span className="filters-active-badge">{activeFilterCount}</span>
        )}
      </button>

      {/* Collapsible Content */}
      <div className={`spell-filters-content ${isCollapsed ? 'collapsed' : 'expanded'}`}>
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
              data-school={school}
            >
              {school}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-badges-inline">
          <div>
            <h3>Components</h3>
            <div className="badge-group">
              <button
                className={`checkbox-badge checkbox-badge-verbal ${state.verbalOnly ? 'active' : ''}`}
                onClick={toggleVerbal}
                aria-pressed={state.verbalOnly}
                aria-label="Filter by Verbal component"
              >
                Verbal
              </button>
              <button
                className={`checkbox-badge checkbox-badge-somatic ${state.somaticOnly ? 'active' : ''}`}
                onClick={toggleSomatic}
                aria-pressed={state.somaticOnly}
                aria-label="Filter by Somatic component"
              >
                Somatic
              </button>
              <button
                className={`checkbox-badge checkbox-badge-material ${state.materialOnly ? 'active' : ''}`}
                onClick={toggleMaterial}
                aria-pressed={state.materialOnly}
                aria-label="Filter by Material component"
              >
                Material
              </button>
            </div>
          </div>
          <div>
            <h3>Properties</h3>
            <div className="badge-group">
              <button
                className={`checkbox-badge checkbox-badge-concentration ${state.concentrationOnly ? 'active' : ''}`}
                onClick={toggleConcentration}
                aria-pressed={state.concentrationOnly}
                aria-label="Filter by Concentration"
              >
                Concentration
              </button>
              <button
                className={`checkbox-badge checkbox-badge-ritual ${state.ritualOnly ? 'active' : ''}`}
                onClick={toggleRitual}
                aria-pressed={state.ritualOnly}
                aria-label="Filter by Ritual"
              >
                Ritual
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Filter Results and Clear Button - Always Visible */}
      <div className={`filter-footer ${hasActiveFilters ? 'has-clear-button' : ''}`}>
        {filteredCount !== undefined && totalCount !== undefined && (
          <p className="filter-results">
            <i>
              Showing {filteredCount} of {totalCount} spells
              {selectedCount !== undefined && selectedCount > 0 && ` • ${selectedCount} selected`}
            </i>
          </p>
        )}
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
    </div>
  );
}
