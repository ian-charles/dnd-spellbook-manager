/**
 * useFilterReducer Hook Tests
 *
 * Tests for the filter reducer hook that consolidates spell filter state.
 * Tests all reducer actions and state transitions.
 */

// Using vitest globals (describe, it, expect are globally available)
import { renderHook, act } from '@testing-library/react';
import { useFilterReducer } from './useFilterReducer';

describe('useFilterReducer', () => {
  describe('Initial State', () => {
    it('should initialize with empty/false values', () => {
      const { result } = renderHook(() => useFilterReducer());

      expect(result.current.state.searchText).toBe('');
      expect(result.current.state.levelRange).toEqual({ min: 0, max: 9 });
      expect(result.current.state.selectedSchools).toEqual([]);
      expect(result.current.state.selectedClasses).toEqual([]);
      expect(result.current.state.concentrationOnly).toBe(false);
      expect(result.current.state.ritualOnly).toBe(false);
      expect(result.current.state.verbalOnly).toBe(false);
      expect(result.current.state.somaticOnly).toBe(false);
      expect(result.current.state.materialOnly).toBe(false);
    });
  });

  describe('SET_SEARCH_TEXT Action', () => {
    it('should update search text', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.setSearchText('fireball');
      });

      expect(result.current.state.searchText).toBe('fireball');
    });

    it('should handle empty search text', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.setSearchText('test');
      });

      act(() => {
        result.current.setSearchText('');
      });

      expect(result.current.state.searchText).toBe('');
    });

    it('should not affect other state', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.setLevelRange({ min: 1, max: 1 });
        result.current.setSearchText('test');
      });

      expect(result.current.state.levelRange).toEqual({ min: 1, max: 1 });
    });
  });

  describe('SET_LEVEL_RANGE Action', () => {
    it('should set level range', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.setLevelRange({ min: 3, max: 5 });
      });

      expect(result.current.state.levelRange).toEqual({ min: 3, max: 5 });
    });

    it('should handle single level range', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.setLevelRange({ min: 3, max: 3 });
      });

      expect(result.current.state.levelRange).toEqual({ min: 3, max: 3 });
    });

    it('should handle full range', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.setLevelRange({ min: 1, max: 9 });
      });

      expect(result.current.state.levelRange).toEqual({ min: 1, max: 9 });
    });

    it('should handle cantrip to high level range', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.setLevelRange({ min: 0, max: 9 });
      });

      expect(result.current.state.levelRange).toEqual({ min: 0, max: 9 });
    });
  });

  describe('TOGGLE_SCHOOL Action', () => {
    it('should add school when not selected', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleSchool('Evocation');
      });

      expect(result.current.state.selectedSchools).toEqual(['Evocation']);
    });

    it('should remove school when already selected', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleSchool('Evocation');
      });

      act(() => {
        result.current.toggleSchool('Evocation');
      });

      expect(result.current.state.selectedSchools).toEqual([]);
    });

    it('should handle multiple schools', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleSchool('Evocation');
        result.current.toggleSchool('Abjuration');
        result.current.toggleSchool('Divination');
      });

      expect(result.current.state.selectedSchools).toEqual(['Evocation', 'Abjuration', 'Divination']);
    });
  });

  describe('TOGGLE_CLASS Action', () => {
    it('should add class when not selected', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleClass('Wizard');
      });

      expect(result.current.state.selectedClasses).toEqual(['Wizard']);
    });

    it('should remove class when already selected', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleClass('Wizard');
      });

      act(() => {
        result.current.toggleClass('Wizard');
      });

      expect(result.current.state.selectedClasses).toEqual([]);
    });

    it('should handle multiple classes', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleClass('Wizard');
        result.current.toggleClass('Sorcerer');
        result.current.toggleClass('Bard');
      });

      expect(result.current.state.selectedClasses).toEqual(['Wizard', 'Sorcerer', 'Bard']);
    });
  });

  describe('TOGGLE_CONCENTRATION Action', () => {
    it('should toggle concentration from false to true', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleConcentration();
      });

      expect(result.current.state.concentrationOnly).toBe(true);
    });

    it('should toggle concentration from true to false', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleConcentration();
      });

      act(() => {
        result.current.toggleConcentration();
      });

      expect(result.current.state.concentrationOnly).toBe(false);
    });
  });

  describe('TOGGLE_RITUAL Action', () => {
    it('should toggle ritual from false to true', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleRitual();
      });

      expect(result.current.state.ritualOnly).toBe(true);
    });

    it('should toggle ritual from true to false', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleRitual();
      });

      act(() => {
        result.current.toggleRitual();
      });

      expect(result.current.state.ritualOnly).toBe(false);
    });
  });

  describe('TOGGLE_VERBAL Action', () => {
    it('should toggle verbal from false to true', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleVerbal();
      });

      expect(result.current.state.verbalOnly).toBe(true);
    });

    it('should toggle verbal from true to false', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleVerbal();
      });

      act(() => {
        result.current.toggleVerbal();
      });

      expect(result.current.state.verbalOnly).toBe(false);
    });
  });

  describe('TOGGLE_SOMATIC Action', () => {
    it('should toggle somatic from false to true', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleSomatic();
      });

      expect(result.current.state.somaticOnly).toBe(true);
    });

    it('should toggle somatic from true to false', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleSomatic();
      });

      act(() => {
        result.current.toggleSomatic();
      });

      expect(result.current.state.somaticOnly).toBe(false);
    });
  });

  describe('TOGGLE_MATERIAL Action', () => {
    it('should toggle material from false to true', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleMaterial();
      });

      expect(result.current.state.materialOnly).toBe(true);
    });

    it('should toggle material from true to false', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleMaterial();
      });

      act(() => {
        result.current.toggleMaterial();
      });

      expect(result.current.state.materialOnly).toBe(false);
    });
  });

  describe('CLEAR_FILTERS Action', () => {
    it('should reset all filters to initial state', () => {
      const { result } = renderHook(() => useFilterReducer());

      // Set various filters
      act(() => {
        result.current.setSearchText('fireball');
        result.current.setLevelRange({ min: 3, max: 5 });
        result.current.toggleSchool('Evocation');
        result.current.toggleClass('Wizard');
        result.current.toggleConcentration();
        result.current.toggleRitual();
        result.current.toggleVerbal();
        result.current.toggleSomatic();
        result.current.toggleMaterial();
      });

      // Clear all filters
      act(() => {
        result.current.clearFilters();
      });

      // Verify all filters are cleared
      expect(result.current.state.searchText).toBe('');
      expect(result.current.state.levelRange).toEqual({ min: 0, max: 9 });
      expect(result.current.state.selectedSchools).toEqual([]);
      expect(result.current.state.selectedClasses).toEqual([]);
      expect(result.current.state.concentrationOnly).toBe(false);
      expect(result.current.state.ritualOnly).toBe(false);
      expect(result.current.state.verbalOnly).toBe(false);
      expect(result.current.state.somaticOnly).toBe(false);
      expect(result.current.state.materialOnly).toBe(false);
    });
  });

  describe('Complex State Transitions', () => {
    it('should handle multiple filter combinations', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.setSearchText('magic');
        result.current.setLevelRange({ min: 1, max: 2 });
        result.current.toggleSchool('Divination');
        result.current.toggleClass('Wizard');
        result.current.toggleClass('Cleric');
        result.current.toggleConcentration();
        result.current.toggleRitual();
      });

      expect(result.current.state.searchText).toBe('magic');
      expect(result.current.state.levelRange).toEqual({ min: 1, max: 2 });
      expect(result.current.state.selectedSchools).toEqual(['Divination']);
      expect(result.current.state.selectedClasses).toEqual(['Wizard', 'Cleric']);
      expect(result.current.state.concentrationOnly).toBe(true);
      expect(result.current.state.ritualOnly).toBe(true);
    });

    it('should handle changing level range multiple times', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.setLevelRange({ min: 5, max: 7 });
        result.current.setLevelRange({ min: 2, max: 4 });
        result.current.setLevelRange({ min: 5, max: 5 });
      });

      expect(result.current.state.levelRange).toEqual({ min: 5, max: 5 });
    });

    it('should maintain independence between different filter types', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.setLevelRange({ min: 3, max: 3 });
        result.current.toggleSchool('Evocation');
        result.current.toggleClass('Wizard');
      });

      // Remove school filter
      act(() => {
        result.current.toggleSchool('Evocation');
      });

      // Level range and class should remain
      expect(result.current.state.levelRange).toEqual({ min: 3, max: 3 });
      expect(result.current.state.selectedSchools).toEqual([]);
      expect(result.current.state.selectedClasses).toEqual(['Wizard']);
    });
  });
});
