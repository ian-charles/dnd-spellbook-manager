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
    // Other unused values
    spellbook: null,
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

    it('renders expanded content when expandedSpellId matches', () => {
        useSpellbookDetailMock.mockReturnValue({
            ...defaultContextValue,
            expandedSpellId: 'spell-1',
        });

        render(<SpellbookSpellsTable />);

        expect(screen.getByText(/A bright streak flashes/)).toBeInTheDocument();
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
        it('triggers onToggleSelected on long press', () => {
            render(<SpellbookSpellsTable />);

            const row = screen.getByTestId('spellbook-spell-spell-1');

            // Simulate touch start which triggers mocked useLongPress -> onLongPress -> onToggleSelected
            fireEvent.touchStart(row, { touches: [{ clientX: 100, clientY: 100 }] });

            expect(defaultContextValue.onToggleSelected).toHaveBeenCalledWith('spell-1');
        });
    });
});
