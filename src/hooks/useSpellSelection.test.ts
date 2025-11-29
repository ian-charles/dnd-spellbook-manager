/**
 * useSpellSelection Hook Tests
 *
 * Testing Strategy:
 * - Uses React Testing Library's renderHook to test hook state updates.
 * - Verifies initialization of selected spells (Set) and target spellbook ID.
 * - Tests state update functions (setSelectedSpellIds, setTargetSpellbookId).
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSpellSelection } from './useSpellSelection';

describe('useSpellSelection', () => {
    it('should initialize with default state', () => {
        const { result } = renderHook(() => useSpellSelection());
        expect(result.current.selectedSpellIds, 'Initial selection should be empty').toEqual(new Set());
        expect(result.current.targetSpellbookId, 'Initial target spellbook ID should be empty').toBe('');
    });

    it('should update selected spell IDs', () => {
        const { result } = renderHook(() => useSpellSelection());
        const newSelection = new Set(['spell1', 'spell2']);

        act(() => {
            result.current.setSelectedSpellIds(newSelection);
        });

        expect(result.current.selectedSpellIds, 'Selection should match updated set').toEqual(newSelection);
    });

    it('should update target spellbook ID', () => {
        const { result } = renderHook(() => useSpellSelection());

        act(() => {
            result.current.setTargetSpellbookId('sb1');
        });

        expect(result.current.targetSpellbookId, 'Target spellbook ID should match updated value').toBe('sb1');
    });

    it('should clear selection', () => {
        const { result } = renderHook(() => useSpellSelection());
        const newSelection = new Set(['spell1']);

        act(() => {
            result.current.setSelectedSpellIds(newSelection);
        });
        expect(result.current.selectedSpellIds.size).toBe(1);

        act(() => {
            result.current.setSelectedSpellIds(new Set());
        });
        expect(result.current.selectedSpellIds.size, 'Selection should be empty after clearing').toBe(0);
    });

    it('should handle redundant updates', () => {
        const { result } = renderHook(() => useSpellSelection());
        const selection = new Set(['spell1']);

        act(() => {
            result.current.setSelectedSpellIds(selection);
        });

        const firstState = result.current.selectedSpellIds;

        act(() => {
            result.current.setSelectedSpellIds(selection);
        });

        const secondState = result.current.selectedSpellIds;

        // Note: Set equality by reference might not be preserved if hook creates new Set on every update,
        // but content should be same.
        expect(secondState, 'Selection should remain same').toEqual(selection);
    });
});
