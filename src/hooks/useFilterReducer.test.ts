/**
 * useFilterReducer Hook Tests
 *
 * Tests for the filter reducer hook that consolidates spell filter state.
 * Tests all reducer actions and state transitions.
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilterReducer } from './useFilterReducer';

describe('useFilterReducer', () => {
  describe('Initial State', () => {
    it('should initialize with empty/false values', () => {
      const { result } = renderHook(() => useFilterReducer());

      expect(result.current.state.searchText).toBe('');
      expect(result.current.state.selectedLevels).toEqual([]);
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
        result.current.toggleLevel(1);
        result.current.setSearchText('test');
      });

      expect(result.current.state.selectedLevels).toEqual([1]);
    });
  });

  describe('TOGGLE_LEVEL Action', () => {
    it('should add level when not selected', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleLevel(3);
      });

      expect(result.current.state.selectedLevels).toEqual([3]);
    });

    it('should remove level when already selected', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleLevel(3);
      });

      act(() => {
        result.current.toggleLevel(3);
      });

      expect(result.current.state.selectedLevels).toEqual([]);
    });

    it('should handle multiple levels', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleLevel(1);
        result.current.toggleLevel(3);
        result.current.toggleLevel(5);
      });

      expect(result.current.state.selectedLevels).toEqual([1, 3, 5]);
    });

    it('should handle cantrip (level 0)', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleLevel(0);
      });

      expect(result.current.state.selectedLevels).toEqual([0]);
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
        result.current.toggleLevel(3);
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
      expect(result.current.state.selectedLevels).toEqual([]);
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
        result.current.toggleLevel(1);
        result.current.toggleLevel(2);
        result.current.toggleSchool('Divination');
        result.current.toggleClass('Wizard');
        result.current.toggleClass('Cleric');
        result.current.toggleConcentration();
        result.current.toggleRitual();
      });

      expect(result.current.state.searchText).toBe('magic');
      expect(result.current.state.selectedLevels).toEqual([1, 2]);
      expect(result.current.state.selectedSchools).toEqual(['Divination']);
      expect(result.current.state.selectedClasses).toEqual(['Wizard', 'Cleric']);
      expect(result.current.state.concentrationOnly).toBe(true);
      expect(result.current.state.ritualOnly).toBe(true);
    });

    it('should handle adding and removing same value multiple times', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleLevel(5);
        result.current.toggleLevel(5);
        result.current.toggleLevel(5);
      });

      expect(result.current.state.selectedLevels).toEqual([5]);
    });

    it('should maintain independence between different filter types', () => {
      const { result } = renderHook(() => useFilterReducer());

      act(() => {
        result.current.toggleLevel(3);
        result.current.toggleSchool('Evocation');
        result.current.toggleClass('Wizard');
      });

      // Remove school filter
      act(() => {
        result.current.toggleSchool('Evocation');
      });

      // Level and class should remain
      expect(result.current.state.selectedLevels).toEqual([3]);
      expect(result.current.state.selectedSchools).toEqual([]);
      expect(result.current.state.selectedClasses).toEqual(['Wizard']);
    });
  });
});
