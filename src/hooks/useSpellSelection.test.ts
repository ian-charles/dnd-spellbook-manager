import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSpellSelection } from './useSpellSelection';

describe('useSpellSelection', () => {
    it('should initialize with default state', () => {
        const { result } = renderHook(() => useSpellSelection());
        expect(result.current.selectedSpellIds).toEqual(new Set());
        expect(result.current.targetSpellbookId).toBe('');
    });

    it('should update selected spell IDs', () => {
        const { result } = renderHook(() => useSpellSelection());
        const newSelection = new Set(['spell1', 'spell2']);

        act(() => {
            result.current.setSelectedSpellIds(newSelection);
        });

        expect(result.current.selectedSpellIds).toEqual(newSelection);
    });

    it('should update target spellbook ID', () => {
        const { result } = renderHook(() => useSpellSelection());

        act(() => {
            result.current.setTargetSpellbookId('sb1');
        });

        expect(result.current.targetSpellbookId).toBe('sb1');
    });
});
