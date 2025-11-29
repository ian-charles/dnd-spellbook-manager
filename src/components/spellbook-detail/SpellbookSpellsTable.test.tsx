import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpellbookSpellsTable } from './SpellbookSpellsTable';
import * as SpellbookDetailContext from '../../contexts/SpellbookDetailContext';
import { EnrichedSpell } from '../../types/spellbook';

// Mock the context hook
const useSpellbookDetailMock = vi.fn();
vi.spyOn(SpellbookDetailContext, 'useSpellbookDetail').mockImplementation(useSpellbookDetailMock);

// Mock useLongPress to trigger immediately
vi.mock('../../hooks/useLongPress', () => ({
    useLongPress: ({ onLongPress }: any) => ({
        onTouchStart: (e: any) => onLongPress(e),
        onTouchMove: vi.fn(),
        onTouchEnd: vi.fn(),
    }),
}));

// Mock useContextMenu
const useContextMenuMock = vi.fn();
vi.mock('../../hooks/useContextMenu', () => ({
    useContextMenu: () => useContextMenuMock(),
}));

// Mock EnrichedSpell data
const mockSpells: EnrichedSpell[] = [
    {
        spell: {
            id: 'spell-1',
            name: 'Fireball',
            level: 3,
            school: 'Evocation',
            castingTime: '1 action',
            range: '150 feet',
            duration: 'Instantaneous',
            components: { verbal: true, somatic: true, material: true },
            materials: 'A tiny ball of bat guano and sulfur',
            description: 'A bright streak flashes from your pointing finger...',
            classes: ['Sorcerer', 'Wizard'],
            source: 'PHB',
            concentration: false,
            ritual: false,
            higherLevels: '',
        },
        prepared: true,
        notes: '',
    },
    {
        spell: {
            id: 'spell-2',
            name: 'Mage Armor',
            level: 1,
            school: 'Abjuration',
            castingTime: '1 action',
            range: 'Touch',
            duration: '8 hours',
            components: { verbal: true, somatic: true, material: true },
            materials: 'A piece of cured leather',
            description: 'You touch a willing creature who isn\'t wearing armor...',
            classes: ['Sorcerer', 'Wizard'],
            source: 'PHB',
            concentration: false,
            ritual: false,
            higherLevels: '',
        },
        prepared: false,
        notes: '',
    },
];

const defaultContextValue = {
    sortedSpells: mockSpells,
    expandedSpellId: null,
    sortColumn: 'name',
    sortDirection: 'asc',
    onSort: vi.fn(),
    onRowClick: vi.fn(),
    onTogglePrepared: vi.fn(),
    onRemoveSpell: vi.fn(),
    // Other unused values
    spellbook: null,
    enrichedSpells: mockSpells,
    confirmDialog: { isOpen: false, spellId: '', spellName: '' },
    editModalOpen: false,
    showPreparedOnly: false,
    onBack: vi.fn(),
    onConfirmRemove: vi.fn(),
    onCancelRemove: vi.fn(),
    onEdit: vi.fn(),
    onEditClose: vi.fn(),
    onEditSave: vi.fn(),
    onToggleShowPreparedOnly: vi.fn(),
    onSelectAllPrepared: vi.fn(),
    onCopy: vi.fn(),
    existingNames: [],
};

describe('SpellbookSpellsTable', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useSpellbookDetailMock.mockReturnValue(defaultContextValue);
        useContextMenuMock.mockReturnValue({
            contextMenu: null,
            openContextMenu: vi.fn(),
            closeContextMenu: vi.fn(),
        });
    });

    it('renders the table with spells', () => {
        render(<SpellbookSpellsTable />);

        expect(screen.getByText('Fireball')).toBeInTheDocument();
        expect(screen.getByText('Mage Armor')).toBeInTheDocument();
        expect(screen.getByText('Level')).toBeInTheDocument();
        expect(screen.getByText('Time')).toBeInTheDocument();
    });

    it('calls onSort when column headers are clicked', () => {
        render(<SpellbookSpellsTable />);

        fireEvent.click(screen.getByText('Level'));
        expect(defaultContextValue.onSort).toHaveBeenCalledWith('level');

        fireEvent.click(screen.getByText('Time'));
        expect(defaultContextValue.onSort).toHaveBeenCalledWith('castingTime');
    });

    it('calls onTogglePrepared when checkbox is clicked', () => {
        render(<SpellbookSpellsTable />);

        const checkboxes = screen.getAllByTestId('toggle-prepared');
        fireEvent.click(checkboxes[0]);

        expect(defaultContextValue.onTogglePrepared).toHaveBeenCalledWith('spell-1');
    });

    it('calls onRowClick when a row is clicked', () => {
        render(<SpellbookSpellsTable />);

        const row = screen.getByTestId('spellbook-spell-spell-1');
        fireEvent.click(row);

        expect(defaultContextValue.onRowClick).toHaveBeenCalledWith('spell-1');
    });

    it('renders expanded content when expandedSpellId matches', () => {
        useSpellbookDetailMock.mockReturnValue({
            ...defaultContextValue,
            expandedSpellId: 'spell-1',
        });

        render(<SpellbookSpellsTable />);

        expect(screen.getByText(/A bright streak flashes/)).toBeInTheDocument();
    });

    it('calls onRemoveSpell when remove button is clicked', () => {
        render(<SpellbookSpellsTable />);

        const removeBtn = screen.getByTestId('btn-remove-spell-spell-1');
        fireEvent.click(removeBtn);

        expect(defaultContextValue.onRemoveSpell).toHaveBeenCalledWith('spell-1', 'Fireball');
    });

    describe('Mobile Interactions', () => {
        it('triggers openContextMenu on long press', () => {
            const openContextMenu = vi.fn();
            useContextMenuMock.mockReturnValue({
                contextMenu: null,
                openContextMenu,
                closeContextMenu: vi.fn(),
            });

            render(<SpellbookSpellsTable />);

            const row = screen.getByTestId('spellbook-spell-spell-1');

            // Simulate touch start which triggers mocked useLongPress -> onLongPress -> openContextMenu
            fireEvent.touchStart(row, { touches: [{ clientX: 100, clientY: 100 }] });

            expect(openContextMenu).toHaveBeenCalled();
        });

        it('renders context menu when state is active', () => {
            useContextMenuMock.mockReturnValue({
                contextMenu: {
                    data: { spellId: 'spell-1', spellName: 'Fireball', prepared: true },
                    x: 100,
                    y: 100
                },
                openContextMenu: vi.fn(),
                closeContextMenu: vi.fn(),
            });

            render(<SpellbookSpellsTable />);

            expect(screen.getByText('Unprep')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
        });

        it('calls onTogglePrepared from context menu', () => {
            const closeContextMenu = vi.fn();
            useContextMenuMock.mockReturnValue({
                contextMenu: {
                    data: { spellId: 'spell-1', spellName: 'Fireball', prepared: true },
                    x: 100,
                    y: 100
                },
                openContextMenu: vi.fn(),
                closeContextMenu,
            });

            render(<SpellbookSpellsTable />);

            const prepBtn = screen.getByText('Unprep');
            fireEvent.click(prepBtn);

            expect(closeContextMenu).toHaveBeenCalled();
            expect(defaultContextValue.onTogglePrepared).toHaveBeenCalledWith('spell-1');
        });

        it('calls onRemoveSpell from context menu', () => {
            const closeContextMenu = vi.fn();
            useContextMenuMock.mockReturnValue({
                contextMenu: {
                    data: { spellId: 'spell-1', spellName: 'Fireball', prepared: true },
                    x: 100,
                    y: 100
                },
                openContextMenu: vi.fn(),
                closeContextMenu,
            });

            render(<SpellbookSpellsTable />);

            const removeBtn = screen.getByRole('button', { name: 'Remove' });
            fireEvent.click(removeBtn);

            expect(closeContextMenu).toHaveBeenCalled();
            expect(defaultContextValue.onRemoveSpell).toHaveBeenCalledWith('spell-1', 'Fireball');
        });
    });
});
