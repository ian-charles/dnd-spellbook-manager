import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSpellbookMutations } from './useSpellbookMutations';
import { MESSAGES } from '../constants/messages';
import { Spellbook } from '../types/spellbook';

describe('useSpellbookMutations', () => {
    const mockSpellbooks: Spellbook[] = [
        { id: 'sb1', name: 'Spellbook 1', spells: [], updated: new Date().toISOString(), created: new Date().toISOString() },
        { id: 'sb2', name: 'Spellbook 2', spells: [], updated: new Date().toISOString(), created: new Date().toISOString() },
    ];

    const mockAddSpellToSpellbook = vi.fn();
    const mockCreateSpellbook = vi.fn();
    const mockRefreshSpellbooks = vi.fn();
    const mockDisplayToast = vi.fn();
    const mockSetAlertDialog = vi.fn();
    const mockSetSelectedSpellIds = vi.fn();
    const mockSetCreateModalOpen = vi.fn();
    const mockSetPendingSpellIds = vi.fn();

    const defaultProps = {
        spellbooks: mockSpellbooks,
        addSpellToSpellbook: mockAddSpellToSpellbook,
        createSpellbook: mockCreateSpellbook,
        refreshSpellbooks: mockRefreshSpellbooks,
        displayToast: mockDisplayToast,
        setAlertDialog: mockSetAlertDialog,
        selectedSpellIds: new Set<string>(),
        setSelectedSpellIds: mockSetSelectedSpellIds,
        setCreateModalOpen: mockSetCreateModalOpen,
        setPendingSpellIds: mockSetPendingSpellIds,
        pendingSpellIds: new Set<string>(),
        targetSpellbookId: '',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useSpellbookMutations(defaultProps));
        expect(result.current.isAddingSpells).toBe(false);
    });

    describe('handleAddToSpellbook', () => {
        it('should show alert if no spells are selected', async () => {
            const { result } = renderHook(() => useSpellbookMutations(defaultProps));

            await act(async () => {
                await result.current.handleAddToSpellbook();
            });

            expect(mockSetAlertDialog).toHaveBeenCalledWith({
                isOpen: true,
                title: 'No Spells Selected',
                message: 'Please select at least one spell to add to a spellbook.',
                variant: 'info',
            });
        });

        it('should show alert if no spellbook is selected', async () => {
            const { result } = renderHook(() => useSpellbookMutations({
                ...defaultProps,
                selectedSpellIds: new Set(['spell1']),
            }));

            await act(async () => {
                await result.current.handleAddToSpellbook();
            });

            expect(mockSetAlertDialog).toHaveBeenCalledWith({
                isOpen: true,
                title: 'No Spellbook Selected',
                message: 'Please select a spellbook from the dropdown menu.',
                variant: 'info',
            });
        });

        it('should open create modal if "new" is selected', async () => {
            const selectedSpells = new Set(['spell1']);
            const { result } = renderHook(() => useSpellbookMutations({
                ...defaultProps,
                selectedSpellIds: selectedSpells,
                targetSpellbookId: 'new',
            }));

            await act(async () => {
                await result.current.handleAddToSpellbook();
            });

            expect(mockSetPendingSpellIds).toHaveBeenCalledWith(selectedSpells);
            expect(mockSetCreateModalOpen).toHaveBeenCalledWith(true);
        });

        it('should show alert if target spellbook does not exist', async () => {
            const { result } = renderHook(() => useSpellbookMutations({
                ...defaultProps,
                selectedSpellIds: new Set(['spell1']),
                targetSpellbookId: 'non-existent',
            }));

            await act(async () => {
                await result.current.handleAddToSpellbook();
            });

            expect(mockSetAlertDialog).toHaveBeenCalledWith({
                isOpen: true,
                title: 'Spellbook Not Found',
                message: 'The selected spellbook no longer exists. Please select another spellbook.',
                variant: 'error',
            });
        });

        it('should successfully add spells to existing spellbook', async () => {
            mockAddSpellToSpellbook.mockResolvedValue(undefined);
            const selectedSpells = new Set(['spell1', 'spell2']);

            const { result } = renderHook(() => useSpellbookMutations({
                ...defaultProps,
                selectedSpellIds: selectedSpells,
                targetSpellbookId: 'sb1',
            }));

            await act(async () => {
                await result.current.handleAddToSpellbook();
            });

            expect(mockAddSpellToSpellbook).toHaveBeenCalledTimes(2);
            expect(mockAddSpellToSpellbook).toHaveBeenCalledWith('sb1', 'spell1');
            expect(mockAddSpellToSpellbook).toHaveBeenCalledWith('sb1', 'spell2');
            expect(mockRefreshSpellbooks).toHaveBeenCalled();
            expect(mockDisplayToast).toHaveBeenCalledWith('2 spells added to spellbook');
            expect(mockSetSelectedSpellIds).toHaveBeenCalledWith(new Set());
        });

        it('should handle partial failures when adding spells', async () => {
            mockAddSpellToSpellbook
                .mockResolvedValueOnce(undefined) // spell1 succeeds
                .mockRejectedValueOnce(new Error('Failed')); // spell2 fails

            const selectedSpells = new Set(['spell1', 'spell2']);

            const { result } = renderHook(() => useSpellbookMutations({
                ...defaultProps,
                selectedSpellIds: selectedSpells,
                targetSpellbookId: 'sb1',
            }));

            await act(async () => {
                await result.current.handleAddToSpellbook();
            });

            expect(mockRefreshSpellbooks).toHaveBeenCalled();
            expect(mockDisplayToast).toHaveBeenCalledWith('Added 1 spells. Failed to add 1 spells.');
            expect(mockSetSelectedSpellIds).toHaveBeenCalledWith(new Set());
        });

        it('should handle total failure when adding spells', async () => {
            mockAddSpellToSpellbook.mockRejectedValue(new Error('Failed'));

            const selectedSpells = new Set(['spell1']);

            const { result } = renderHook(() => useSpellbookMutations({
                ...defaultProps,
                selectedSpellIds: selectedSpells,
                targetSpellbookId: 'sb1',
            }));

            await act(async () => {
                await result.current.handleAddToSpellbook();
            });

            expect(mockSetAlertDialog).toHaveBeenCalledWith(expect.objectContaining({
                isOpen: true,
                title: MESSAGES.ERROR.FAILED_TO_ADD_SPELL,
                variant: 'error',
            }));
        });
    });

    describe('handleCreateSpellbook', () => {
        it('should successfully create spellbook without pending spells', async () => {
            const newSpellbook = { id: 'new-sb', name: 'New Book' };
            mockCreateSpellbook.mockResolvedValue(newSpellbook);

            const { result } = renderHook(() => useSpellbookMutations(defaultProps));

            await act(async () => {
                await result.current.handleCreateSpellbook({ name: 'New Book' });
            });

            expect(mockCreateSpellbook).toHaveBeenCalledWith({ name: 'New Book' });
            expect(mockDisplayToast).toHaveBeenCalledWith('Spellbook created successfully');
            expect(mockRefreshSpellbooks).toHaveBeenCalled();
            expect(mockSetCreateModalOpen).toHaveBeenCalledWith(false);
        });

        it('should create spellbook and add pending spells', async () => {
            const newSpellbook = { id: 'new-sb', name: 'New Book' };
            mockCreateSpellbook.mockResolvedValue(newSpellbook);
            mockAddSpellToSpellbook.mockResolvedValue(undefined);

            const pendingSpells = new Set(['spell1']);
            const { result } = renderHook(() => useSpellbookMutations({
                ...defaultProps,
                pendingSpellIds: pendingSpells,
            }));

            await act(async () => {
                await result.current.handleCreateSpellbook({ name: 'New Book' });
            });

            expect(mockAddSpellToSpellbook).toHaveBeenCalledWith('new-sb', 'spell1');
            expect(mockDisplayToast).toHaveBeenCalledWith('Spellbook created with 1 spell');
            expect(mockSetPendingSpellIds).toHaveBeenCalledWith(new Set());
            expect(mockSetSelectedSpellIds).toHaveBeenCalledWith(new Set());
            expect(mockSetCreateModalOpen).toHaveBeenCalledWith(false);
        });

        it('should handle errors during creation', async () => {
            const error = new Error('Creation failed');
            mockCreateSpellbook.mockRejectedValue(error);

            const { result } = renderHook(() => useSpellbookMutations(defaultProps));

            await expect(result.current.handleCreateSpellbook({ name: 'New Book' }))
                .rejects.toThrow('Creation failed');

            expect(mockSetCreateModalOpen).toHaveBeenCalledWith(false);
        });
    });
});
