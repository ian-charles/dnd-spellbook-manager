/**
 * useFilterReducer Hook
 *
 * Consolidates spell filter state management using useReducer.
 * Replaces 9 separate useState calls with a single, predictable reducer.
 *
 * Benefits:
 * - Centralized state logic
 * - Predictable state transitions via actions
 * - Easier testing (reducer is a pure function)
 * - Better debugging (all state changes logged via actions)
 */

import { useReducer } from 'react';

export interface FilterState {
  searchText: string;
  levelRange: { min: number; max: number };
  selectedSchools: string[];
  selectedClasses: string[];
  selectedSources: string[];
  concentrationOnly: boolean;
  ritualOnly: boolean;
  verbalOnly: boolean;
  somaticOnly: boolean;
  materialOnly: boolean;
}

type FilterAction =
  | { type: 'SET_SEARCH_TEXT'; payload: string }
  | { type: 'SET_LEVEL_RANGE'; payload: { min: number; max: number } }
  | { type: 'TOGGLE_SCHOOL'; payload: string }
  | { type: 'TOGGLE_CLASS'; payload: string }
  | { type: 'TOGGLE_SOURCE'; payload: string }
  | { type: 'TOGGLE_CONCENTRATION' }
  | { type: 'TOGGLE_RITUAL' }
  | { type: 'TOGGLE_VERBAL' }
  | { type: 'TOGGLE_SOMATIC' }
  | { type: 'TOGGLE_MATERIAL' }
  | { type: 'CLEAR_FILTERS' };

const initialState: FilterState = {
  searchText: '',
  levelRange: { min: 0, max: 9 },
  selectedSchools: [],
  selectedClasses: [],
  selectedSources: [],
  concentrationOnly: false,
  ritualOnly: false,
  verbalOnly: false,
  somaticOnly: false,
  materialOnly: false,
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_SEARCH_TEXT':
      return {
        ...state,
        searchText: action.payload,
      };

    case 'SET_LEVEL_RANGE':
      return {
        ...state,
        levelRange: action.payload,
      };

    case 'TOGGLE_SCHOOL':
      return {
        ...state,
        selectedSchools: state.selectedSchools.includes(action.payload)
          ? state.selectedSchools.filter((s) => s !== action.payload)
          : [...state.selectedSchools, action.payload],
      };

    case 'TOGGLE_CLASS':
      return {
        ...state,
        selectedClasses: state.selectedClasses.includes(action.payload)
          ? state.selectedClasses.filter((c) => c !== action.payload)
          : [...state.selectedClasses, action.payload],
      };

    case 'TOGGLE_SOURCE':
      return {
        ...state,
        selectedSources: state.selectedSources.includes(action.payload)
          ? state.selectedSources.filter((s) => s !== action.payload)
          : [...state.selectedSources, action.payload],
      };

    case 'TOGGLE_CONCENTRATION':
      return {
        ...state,
        concentrationOnly: !state.concentrationOnly,
      };

    case 'TOGGLE_RITUAL':
      return {
        ...state,
        ritualOnly: !state.ritualOnly,
      };

    case 'TOGGLE_VERBAL':
      return {
        ...state,
        verbalOnly: !state.verbalOnly,
      };

    case 'TOGGLE_SOMATIC':
      return {
        ...state,
        somaticOnly: !state.somaticOnly,
      };

    case 'TOGGLE_MATERIAL':
      return {
        ...state,
        materialOnly: !state.materialOnly,
      };

    case 'CLEAR_FILTERS':
      return initialState;

    default:
      return state;
  }
}

export interface UseFilterReducerReturn {
  state: FilterState;
  setSearchText: (text: string) => void;
  setLevelRange: (range: { min: number; max: number }) => void;
  toggleSchool: (school: string) => void;
  toggleClass: (className: string) => void;
  toggleSource: (source: string) => void;
  toggleConcentration: () => void;
  toggleRitual: () => void;
  toggleVerbal: () => void;
  toggleSomatic: () => void;
  toggleMaterial: () => void;
  clearFilters: () => void;
}

export function useFilterReducer(): UseFilterReducerReturn {
  const [state, dispatch] = useReducer(filterReducer, initialState);

  return {
    state,
    setSearchText: (text: string) => dispatch({ type: 'SET_SEARCH_TEXT', payload: text }),
    setLevelRange: (range: { min: number; max: number }) => dispatch({ type: 'SET_LEVEL_RANGE', payload: range }),
    toggleSchool: (school: string) => dispatch({ type: 'TOGGLE_SCHOOL', payload: school }),
    toggleClass: (className: string) => dispatch({ type: 'TOGGLE_CLASS', payload: className }),
    toggleSource: (source: string) => dispatch({ type: 'TOGGLE_SOURCE', payload: source }),
    toggleConcentration: () => dispatch({ type: 'TOGGLE_CONCENTRATION' }),
    toggleRitual: () => dispatch({ type: 'TOGGLE_RITUAL' }),
    toggleVerbal: () => dispatch({ type: 'TOGGLE_VERBAL' }),
    toggleSomatic: () => dispatch({ type: 'TOGGLE_SOMATIC' }),
    toggleMaterial: () => dispatch({ type: 'TOGGLE_MATERIAL' }),
    clearFilters: () => dispatch({ type: 'CLEAR_FILTERS' }),
  };
}
