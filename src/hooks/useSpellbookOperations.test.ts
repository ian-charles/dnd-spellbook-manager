import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSpellbookOperations } from './useSpellbookOperations';
import { Spellbook } from '../types/spellbook';
import { exportImportService } from '../services/exportImport.service';

vi.mock('../services/exportImport.service', () => ({
    exportImportService: {
        downloadSpellbooks: vi.fn(),
        importSpellbooks: vi.fn(),
    },
}));

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
    it('should handle create spellbook failure', async () => {
        const error = new Error('Create failed');
        mockOnCreateSpellbook.mockRejectedValue(error);
        const { result } = renderHook(() => useSpellbookOperations(defaultProps));

        await expect(result.current.handleCreateSpellbook({ name: 'Fail' }))
            .rejects.toThrow('Create failed');
    });

    it('should handle delete spellbook failure', async () => {
        mockOnDeleteSpellbook.mockRejectedValue(new Error('Delete failed'));
        const { result } = renderHook(() => useSpellbookOperations(defaultProps));

        await act(async () => {
            await result.current.handleConfirmDelete('1');
        });

        expect(mockCloseConfirm).toHaveBeenCalled();
        expect(mockSetAlertDialog).toHaveBeenCalledWith(expect.objectContaining({
            isOpen: true,
            variant: 'error',
        }));
    });

    it('should handle export failure', async () => {
        (exportImportService.downloadSpellbooks as any).mockRejectedValue(new Error('Export failed'));
        const { result } = renderHook(() => useSpellbookOperations(defaultProps));

        await act(async () => {
            await result.current.handleExport();
        });

        expect(mockSetAlertDialog).toHaveBeenCalledWith(expect.objectContaining({
            isOpen: true,
            variant: 'error',
        }));
    });

    it('should handle import failure', async () => {
        const { result } = renderHook(() => useSpellbookOperations(defaultProps));
        const file = new File(['{}'], 'test.json', { type: 'application/json' });
        const event = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;

        (exportImportService.importSpellbooks as any).mockRejectedValue(new Error('Import failed'));

        await act(async () => {
            await result.current.handleImport(event);
        });

        expect(mockSetAlertDialog).toHaveBeenCalledWith(expect.objectContaining({
            isOpen: true,
            variant: 'error',
        }));
    });

    it('should handle partial failure when copying spells', async () => {
        // Create a source spellbook with multiple spells for this test
        const multiSpellBook = {
            ...mockSpellbooks[0],
            spells: [
                { spellId: 'fireball', prepared: true, notes: '' },
                { spellId: 'magic-missile', prepared: true, notes: '' }
            ]
        };

        const propsWithMultiSpell = {
            ...defaultProps,
            spellbooks: [multiSpellBook]
        };

        mockOnCreateSpellbook.mockResolvedValue({ id: '2', name: 'Copy', spells: [] });
        const { result } = renderHook(() => useSpellbookOperations(propsWithMultiSpell));

        // Setup copy data
        act(() => {
            result.current.handleCopy('1');
        });

        // Mock add spell to fail for the first spell, succeed for the second
        mockOnAddSpellToSpellbook
            .mockRejectedValueOnce(new Error('Failed to add spell'))
            .mockResolvedValueOnce(undefined);

        await act(async () => {
            await result.current.handleCreateSpellbook({ name: 'Copy' });
        });

        expect(mockSetAlertDialog).toHaveBeenCalledWith(expect.objectContaining({
            isOpen: true,
            title: 'Partial Copy Warning',
            variant: 'warning',
        }));
    });

    it('should handle complete failure when copying spells', async () => {
        mockOnCreateSpellbook.mockResolvedValue({ id: '2', name: 'Copy', spells: [] });
        const { result } = renderHook(() => useSpellbookOperations(defaultProps));

        // Setup copy data
        act(() => {
            result.current.handleCopy('1');
        });

        // Mock add spell to fail for all spells (only 1 in mock data)
        mockOnAddSpellToSpellbook.mockRejectedValue(new Error('Failed to add spell'));

        await act(async () => {
            await result.current.handleCreateSpellbook({ name: 'Copy' });
        });

        expect(mockSetAlertDialog).toHaveBeenCalledWith(expect.objectContaining({
            isOpen: true,
            title: 'Copy Failed',
            variant: 'error',
        }));
    });

    it('should handle import with validation errors', async () => {
        const { result } = renderHook(() => useSpellbookOperations(defaultProps));

        // Mock file with text method
        const file = {
            text: vi.fn().mockResolvedValue('{}'),
        };
        const event = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;

        // Mock import to return errors
        (exportImportService.importSpellbooks as any).mockResolvedValue({
            imported: 1,
            skipped: 0,
            errors: ['Invalid spellbook format'],
        });

        await act(async () => {
            await result.current.handleImport(event);
        });

        expect(mockSetAlertDialog).toHaveBeenCalledWith(expect.objectContaining({
            isOpen: true,
            title: expect.stringContaining('Import Completed with Errors'),
            variant: 'warning',
        }));
    });
});
