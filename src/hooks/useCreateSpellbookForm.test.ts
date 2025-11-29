/**
 * useCreateSpellbookForm Hook Tests
 *
 * Testing Strategy:
 * - Uses React Testing Library's renderHook to test form state and validation logic.
 * - Verifies initial state and reset behavior.
 * - Tests validation for name, duplicate names, and numeric ranges.
 * - Verifies successful submission and error handling.
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useCreateSpellbookForm } from './useCreateSpellbookForm';
import { MIN_ATTACK_MODIFIER, MAX_ATTACK_MODIFIER } from '../constants/gameRules';

describe('useCreateSpellbookForm', () => {
    const mockOnSubmit = vi.fn();
    const defaultProps = {
        isOpen: true,
        onSubmit: mockOnSubmit,
        existingNames: ['Existing Book'],
    };

    it('should initialize with empty state', () => {
        const { result } = renderHook(() => useCreateSpellbookForm(defaultProps));

        expect(result.current.name).toBe('');
        expect(result.current.spellcastingAbility).toBe('');
        expect(result.current.spellAttackModifier).toBe('');
        expect(result.current.spellSaveDC).toBe('');
        expect(result.current.error).toBe('');
    });

    it('should initialize with provided data', () => {
        const initialData = {
            name: 'New Book',
            spellcastingAbility: 'INT' as const,
            spellAttackModifier: 5,
            spellSaveDC: 15,
        };
        const { result } = renderHook(() => useCreateSpellbookForm({ ...defaultProps, initialData }));

        expect(result.current.name).toBe('New Book');
        expect(result.current.spellcastingAbility).toBe('INT');
        expect(result.current.spellAttackModifier).toBe('5');
        expect(result.current.spellSaveDC).toBe('15');
    });

    it('should validate required name', async () => {
        const { result } = renderHook(() => useCreateSpellbookForm(defaultProps));
        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });

        expect(result.current.error).toBe('Spellbook name is required');
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate duplicate name', async () => {
        const { result } = renderHook(() => useCreateSpellbookForm(defaultProps));
        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

        act(() => {
            result.current.setName('Existing Book');
        });

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });

        expect(result.current.error).toBe('A spellbook with this name already exists');
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate attack modifier range', async () => {
        const { result } = renderHook(() => useCreateSpellbookForm(defaultProps));
        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

        act(() => {
            result.current.setName('Valid Name');
            result.current.setSpellAttackModifier(String(MAX_ATTACK_MODIFIER + 1));
        });

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });

        expect(result.current.error).toContain('Spell Attack Modifier must be an integer');
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should submit valid data', async () => {
        const { result } = renderHook(() => useCreateSpellbookForm(defaultProps));
        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

        act(() => {
            result.current.setName('Valid Name');
            result.current.setSpellcastingAbility('WIS');
        });

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });

        expect(result.current.error).toBe('');
        expect(mockOnSubmit).toHaveBeenCalledWith({
            name: 'Valid Name',
            spellcastingAbility: 'WIS',
            spellAttackModifier: undefined,
            spellSaveDC: undefined,
        });
    });

    it('should reset form when closed', () => {
        const { result, rerender } = renderHook((props) => useCreateSpellbookForm(props), {
            initialProps: defaultProps,
        });

        act(() => {
            result.current.setName('Some Name');
        });

        rerender({ ...defaultProps, isOpen: false });

        expect(result.current.name).toBe('');
    });
});
