import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSpellbookDetailLogic } from './useSpellbookDetailLogic';
import { useSpellbooks } from './useSpellbooks';
import { spellService } from '../services/spell.service';

// Mock dependencies
vi.mock('./useSpellbooks');
vi.mock('../services/spell.service');

describe('useSpellbookDetailLogic', () => {
    const mockSpellbook = {
        id: 'sb1',
        name: 'Test Spellbook',
        spells: [
            { spellId: 'spell1', prepared: true, notes: 'Note 1' },
            { spellId: 'spell2', prepared: false, notes: '' },
        ],
        lastModified: Date.now(), // Keeping as is if the hook uses it, but interface says updated. Let's check hook usage.
        updated: new Date().toISOString(),
        created: new Date().toISOString(),
    };

    const mockSpell1 = { id: 'spell1', name: 'Fireball', level: 3 };
    const mockSpell2 = { id: 'spell2', name: 'Magic Missile', level: 1 };

    const mockGetSpellbook = vi.fn();
    const mockUpdateSpellbook = vi.fn();
    const mockTogglePrepared = vi.fn();
    const mockRemoveSpellFromSpellbook = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        (useSpellbooks as any).mockReturnValue({
            spellbooks: [mockSpellbook],
            getSpellbook: mockGetSpellbook,
            updateSpellbook: mockUpdateSpellbook,
            togglePrepared: mockTogglePrepared,
            removeSpellFromSpellbook: mockRemoveSpellFromSpellbook,
        });

        (spellService.getSpellById as any).mockImplementation((id: string) => {
            if (id === 'spell1') return mockSpell1;
            if (id === 'spell2') return mockSpell2;
            return null;
        });

        mockGetSpellbook.mockResolvedValue(mockSpellbook);
    });

    it('should load spellbook data on mount', async () => {
        const { result } = renderHook(() => useSpellbookDetailLogic({
            spellbookId: 'sb1',
            onBack: vi.fn(),
        }));

        await waitFor(() => {
            expect(result.current.spellbook).toEqual(mockSpellbook);
        });

        expect(result.current.enrichedSpells).toHaveLength(2);
        expect(result.current.enrichedSpells[0].spell).toEqual(mockSpell1);
        expect(result.current.enrichedSpells[0].prepared).toBe(true);
    });

    it('should filter prepared spells', async () => {
        const { result } = renderHook(() => useSpellbookDetailLogic({
            spellbookId: 'sb1',
            onBack: vi.fn(),
        }));

        await waitFor(() => {
            expect(result.current.enrichedSpells).toHaveLength(2);
        });

        act(() => {
            result.current.onToggleShowPreparedOnly();
        });

        expect(result.current.showPreparedOnly).toBe(true);
        expect(result.current.sortedSpells).toHaveLength(1);
        expect(result.current.sortedSpells[0].spell.id).toBe('spell1');
    });

    it('should handle spell removal flow', async () => {
        const { result } = renderHook(() => useSpellbookDetailLogic({
            spellbookId: 'sb1',
            onBack: vi.fn(),
        }));

        act(() => {
            result.current.onRemoveSpell('spell1', 'Fireball');
        });

        expect(result.current.confirmDialog).toEqual({
            isOpen: true,
            spellId: 'spell1',
            spellName: 'Fireball',
        });

        await act(async () => {
            await result.current.onConfirmRemove();
        });

        expect(mockRemoveSpellFromSpellbook).toHaveBeenCalledWith('sb1', 'spell1');
        expect(result.current.confirmDialog.isOpen).toBe(false);
        expect(mockGetSpellbook).toHaveBeenCalledTimes(2); // Initial load + reload after remove
    });

    it('should handle toggle prepared', async () => {
        const { result } = renderHook(() => useSpellbookDetailLogic({
            spellbookId: 'sb1',
            onBack: vi.fn(),
        }));

        await act(async () => {
            await result.current.onTogglePrepared('spell1');
        });

        expect(mockTogglePrepared).toHaveBeenCalledWith('sb1', 'spell1');
        expect(mockGetSpellbook).toHaveBeenCalledTimes(2);
    });

    it('should handle select all prepared (when some unprepared)', async () => {
        const { result } = renderHook(() => useSpellbookDetailLogic({
            spellbookId: 'sb1',
            onBack: vi.fn(),
        }));

        await waitFor(() => {
            expect(result.current.enrichedSpells).toHaveLength(2);
        });

        await act(async () => {
            await result.current.onSelectAllPrepared();
        });

        // Should toggle the unprepared one (spell2)
        expect(mockTogglePrepared).toHaveBeenCalledWith('sb1', 'spell2');
        expect(mockTogglePrepared).toHaveBeenCalledTimes(1);
    });

    it('should handle deselect all prepared (when all prepared)', async () => {
        // Mock all prepared
        const allPreparedSpellbook = {
            ...mockSpellbook,
            spells: [
                { spellId: 'spell1', prepared: true, notes: '' },
                { spellId: 'spell2', prepared: true, notes: '' },
            ],
        };
        mockGetSpellbook.mockResolvedValue(allPreparedSpellbook);

        const { result } = renderHook(() => useSpellbookDetailLogic({
            spellbookId: 'sb1',
            onBack: vi.fn(),
        }));

        await waitFor(() => {
            expect(result.current.enrichedSpells).toHaveLength(2);
        });

        await act(async () => {
            await result.current.onSelectAllPrepared();
        });

        // Should toggle both to unprepared
        expect(mockTogglePrepared).toHaveBeenCalledWith('sb1', 'spell1');
        expect(mockTogglePrepared).toHaveBeenCalledWith('sb1', 'spell2');
        expect(mockTogglePrepared).toHaveBeenCalledTimes(2);
    });

    it('should handle edit spellbook', async () => {
        const { result } = renderHook(() => useSpellbookDetailLogic({
            spellbookId: 'sb1',
            onBack: vi.fn(),
        }));

        act(() => {
            result.current.onEdit();
        });

        expect(result.current.editModalOpen).toBe(true);

        const updateInput = {
            name: 'Updated Name',
            spellcastingAbility: 'INT' as const,
            spellAttackModifier: 5,
            spellSaveDC: 15,
        };

        await act(async () => {
            await result.current.onEditSave(updateInput);
        });

        expect(mockUpdateSpellbook).toHaveBeenCalledWith('sb1', updateInput);
        expect(result.current.editModalOpen).toBe(false);
        expect(mockGetSpellbook).toHaveBeenCalledTimes(2);
    });

    it('should handle row expansion', () => {
        const { result } = renderHook(() => useSpellbookDetailLogic({
            spellbookId: 'sb1',
            onBack: vi.fn(),
        }));

        act(() => {
            result.current.onRowClick('spell1');
        });
        expect(result.current.expandedSpellId).toBe('spell1');

        act(() => {
            result.current.onRowClick('spell1');
        });
        expect(result.current.expandedSpellId).toBe(null);
    });
});
