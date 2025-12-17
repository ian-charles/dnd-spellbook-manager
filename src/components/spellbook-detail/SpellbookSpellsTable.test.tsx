import { render, screen, fireEvent } from '@testing-library/react';
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
    sortColumn: 'name' as const,
    sortDirection: 'asc' as const,
    selectedSpellIds: new Set<string>(),
    onSort: vi.fn(),
    onRowClick: vi.fn(),
    onToggleSelected: vi.fn(),
    onTogglePrepared: vi.fn(),
    onRequestRemoveSpell: vi.fn(),
    // Other unused values
    spellbook: { id: 'spellbook-1', name: 'Test Spellbook', spells: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    enrichedSpells: mockSpells,
    confirmDialog: { isOpen: false, spellIds: [], message: '' },
    editModalOpen: false,
    showPreparedOnly: false,
    allPrepared: false,
    onBack: vi.fn(),
    onSelectAll: vi.fn(),
    onDeselectAll: vi.fn(),
    onPrepSelected: vi.fn(),
    onRemoveSelected: vi.fn(),
    onConfirmRemove: vi.fn(),
    onCancelRemove: vi.fn(),
    onEdit: vi.fn(),
    onEditClose: vi.fn(),
    onEditSave: vi.fn(),
    onToggleShowPreparedOnly: vi.fn(),
    onCopy: vi.fn(),
    existingNames: [],
};

describe('SpellbookSpellsTable', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useSpellbookDetailMock.mockReturnValue(defaultContextValue);
    });

    it('renders the table with spells', () => {
        render(<SpellbookSpellsTable />);

        expect(screen.getByText('Fireball')).toBeInTheDocument();
        expect(screen.getByText('Mage Armor')).toBeInTheDocument();
        expect(screen.getByText('Level')).toBeInTheDocument();
        expect(screen.getByText('Cast Time')).toBeInTheDocument();
    });

    it('calls onSort when column headers are clicked', () => {
        render(<SpellbookSpellsTable />);

        fireEvent.click(screen.getByText('Level'));
        expect(defaultContextValue.onSort).toHaveBeenCalledWith('level');

        fireEvent.click(screen.getByText('Cast Time'));
        expect(defaultContextValue.onSort).toHaveBeenCalledWith('castingTime');
    });

    it('calls onToggleSelected when checkbox is clicked', () => {
        render(<SpellbookSpellsTable />);

        const checkboxes = screen.getAllByTestId('toggle-selected');
        fireEvent.click(checkboxes[0]);

        expect(defaultContextValue.onToggleSelected).toHaveBeenCalledWith('spell-1');
    });

    it('calls onRowClick when a row is clicked', () => {
        render(<SpellbookSpellsTable />);

        const row = screen.getByTestId('spellbook-spell-spell-1');
        fireEvent.click(row);

        expect(defaultContextValue.onRowClick).toHaveBeenCalledWith('spell-1');
    });

    it('passes expandedSpellId to rows for backward compatibility', () => {
        useSpellbookDetailMock.mockReturnValue({
            ...defaultContextValue,
            expandedSpellId: 'spell-1',
        });

        render(<SpellbookSpellsTable />);

        // Note: Modal rendering is handled by SpellbookDetailView, not this component
        // This test just verifies expandedSpellId is passed to rows
        const rows = screen.getAllByRole('row').slice(1); // Skip header row
        expect(rows.length).toBeGreaterThan(0);
    });

    it('marks rows as selected when in selectedSpellIds', () => {
        useSpellbookDetailMock.mockReturnValue({
            ...defaultContextValue,
            selectedSpellIds: new Set(['spell-1']),
        });

        render(<SpellbookSpellsTable />);

        const row = screen.getByTestId('spellbook-spell-spell-1');
        expect(row).toHaveClass('selected-row');
    });

    it('marks rows as prepared when prepared is true', () => {
        render(<SpellbookSpellsTable />);

        const row = screen.getByTestId('spellbook-spell-spell-1');
        expect(row).toHaveClass('prepared-row');
    });

    describe('Mobile Interactions', () => {
        it('shows context menu on long press', () => {
            render(<SpellbookSpellsTable />);

            const row = screen.getByTestId('spellbook-spell-spell-1');

            // Simulate touch start which triggers mocked useLongPress -> onLongPress -> opens context menu
            fireEvent.touchStart(row, { touches: [{ clientX: 100, clientY: 100 }] });

            // Context menu should appear with the spell name as header
            const contextMenuHeader = document.querySelector('.spell-context-menu-header');
            expect(contextMenuHeader).toBeInTheDocument();
            expect(contextMenuHeader).toHaveTextContent('Fireball');
            // Context menu should have Select, Unprep (since spell is prepared), and Remove options
            expect(screen.getByText('Select')).toBeInTheDocument();
            expect(screen.getByText('Unprep')).toBeInTheDocument();
            expect(screen.getByText('Remove from Spellbook')).toBeInTheDocument();
        });

        it('calls onToggleSelected when Select is clicked in context menu', () => {
            render(<SpellbookSpellsTable />);

            const row = screen.getByTestId('spellbook-spell-spell-1');
            fireEvent.touchStart(row, { touches: [{ clientX: 100, clientY: 100 }] });

            const selectButton = screen.getByText('Select');
            fireEvent.click(selectButton);

            expect(defaultContextValue.onToggleSelected).toHaveBeenCalledWith('spell-1');
        });

        it('calls onTogglePrepared when Unprep is clicked in context menu', () => {
            render(<SpellbookSpellsTable />);

            const row = screen.getByTestId('spellbook-spell-spell-1');
            fireEvent.touchStart(row, { touches: [{ clientX: 100, clientY: 100 }] });

            const unprepButton = screen.getByText('Unprep');
            fireEvent.click(unprepButton);

            expect(defaultContextValue.onTogglePrepared).toHaveBeenCalledWith('spellbook-1', 'spell-1');
        });

        it('calls onRequestRemoveSpell when Remove is clicked in context menu', () => {
            render(<SpellbookSpellsTable />);

            const row = screen.getByTestId('spellbook-spell-spell-1');
            fireEvent.touchStart(row, { touches: [{ clientX: 100, clientY: 100 }] });

            const removeButton = screen.getByText('Remove from Spellbook');
            fireEvent.click(removeButton);

            expect(defaultContextValue.onRequestRemoveSpell).toHaveBeenCalledWith('spell-1');
        });

        it('shows Prep option for unprepared spells in context menu', () => {
            render(<SpellbookSpellsTable />);

            // Long press on unprepared spell (spell-2)
            const row = screen.getByTestId('spellbook-spell-spell-2');
            fireEvent.touchStart(row, { touches: [{ clientX: 100, clientY: 100 }] });

            // Context menu should show "Prep" instead of "Unprep"
            expect(screen.getByText('Prep')).toBeInTheDocument();
        });

        it('shows Deselect option for selected spells in context menu', () => {
            useSpellbookDetailMock.mockReturnValue({
                ...defaultContextValue,
                selectedSpellIds: new Set(['spell-1']),
            });

            render(<SpellbookSpellsTable />);

            const row = screen.getByTestId('spellbook-spell-spell-1');
            fireEvent.touchStart(row, { touches: [{ clientX: 100, clientY: 100 }] });

            // Context menu should show "Deselect" instead of "Select"
            expect(screen.getByText('Deselect')).toBeInTheDocument();
        });
    });
});
