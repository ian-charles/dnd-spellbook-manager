import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSpellbookOperations } from './useSpellbookOperations';
import { Spellbook } from '../types/spellbook';

describe('useSpellbookOperations', () => {
    const mockSpellbooks: Spellbook[] = [
        { id: '1', name: 'Source Spellbook', spells: [{ spellId: 'fireball', prepared: true, notes: '' }], created: '', updated: '' },
    ];

    const mockOnCreateSpellbook = vi.fn();
    const mockOnDeleteSpellbook = vi.fn();
    const mockOnRefreshSpellbooks = vi.fn();
    const mockOnAddSpellToSpellbook = vi.fn();
    const mockSetAlertDialog = vi.fn();
    const mockCloseConfirm = vi.fn();

    const defaultProps = {
        spellbooks: mockSpellbooks,
        onCreateSpellbook: mockOnCreateSpellbook,
        onDeleteSpellbook: mockOnDeleteSpellbook,
        onRefreshSpellbooks: mockOnRefreshSpellbooks,
        onAddSpellToSpellbook: mockOnAddSpellToSpellbook,
        setAlertDialog: mockSetAlertDialog,
        closeConfirm: mockCloseConfirm,
    };

    it('should handle create spellbook', async () => {
        mockOnCreateSpellbook.mockResolvedValue({ id: '2', name: 'New Spellbook', spells: [] });
        const { result } = renderHook(() => useSpellbookOperations(defaultProps));

        await act(async () => {
            await result.current.handleCreateSpellbook({ name: 'New Spellbook' });
        });

        expect(mockOnCreateSpellbook).toHaveBeenCalledWith({ name: 'New Spellbook' });
        expect(mockOnRefreshSpellbooks).toHaveBeenCalled();
    });

    it('should handle copy spellbook', async () => {
        mockOnCreateSpellbook.mockResolvedValue({ id: '2', name: 'Copy', spells: [] });
        const { result } = renderHook(() => useSpellbookOperations(defaultProps));

        // Setup copy data
        act(() => {
            result.current.handleCopy('1');
        });

        expect(result.current.copyData).toEqual(expect.objectContaining({
            sourceSpellbookId: '1',
            name: 'Source Spellbook (Copy)',
        }));

        // Execute create (which triggers copy logic)
        await act(async () => {
            await result.current.handleCreateSpellbook({ name: 'Copy' });
        });

        expect(mockOnCreateSpellbook).toHaveBeenCalled();
        expect(mockOnAddSpellToSpellbook).toHaveBeenCalledWith('2', 'fireball');
        expect(mockOnRefreshSpellbooks).toHaveBeenCalled();
    });
});
