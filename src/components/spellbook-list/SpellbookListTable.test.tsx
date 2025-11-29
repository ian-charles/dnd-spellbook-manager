import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpellbookListTable } from './SpellbookListTable';
import { Spellbook } from '../../types/spellbook';

describe('SpellbookListTable', () => {
    const mockSpellbooks: Spellbook[] = [
        {
            id: '1',
            name: 'Spellbook 1',
            spells: ['spell1', 'spell2'] as any, // Cast to any to avoid complex mocking of SpellbookSpell
            updated: new Date('2023-01-01').toISOString(),
            spellcastingAbility: 'INT',
            spellAttackModifier: 5,
            spellSaveDC: 15,
            created: new Date('2023-01-01').toISOString(),
        },
        {
            id: '2',
            name: 'Spellbook 2',
            spells: [],
            updated: new Date('2023-01-02').toISOString(),
            created: new Date('2023-01-02').toISOString(),
        },
    ];

    const defaultProps = {
        spellbooks: mockSpellbooks,
        sortColumn: 'name' as const,
        sortDirection: 'asc' as const,
        onSort: vi.fn(),
        onSpellbookClick: vi.fn(),
        onCopy: vi.fn(),
        onDelete: vi.fn(),
        onTouchStart: vi.fn(),
        onTouchMove: vi.fn(),
        onTouchEnd: vi.fn(),
    };

    it('should render spellbooks correctly', () => {
        render(<SpellbookListTable {...defaultProps} />);

        expect(screen.getByText('Spellbook 1')).toBeInTheDocument();
        expect(screen.getByText('Spellbook 2')).toBeInTheDocument();
        expect(screen.getByText('INT')).toBeInTheDocument();
        expect(screen.getByText('+5')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('should render N/A for missing values', () => {
        render(<SpellbookListTable {...defaultProps} />);

        // Spellbook 2 has missing ability, attack, and save DC
        const rows = screen.getAllByRole('row');
        // Row 0 is header, Row 2 is Spellbook 2
        const cells = rows[2].querySelectorAll('td');

        expect(cells[2]).toHaveTextContent('N/A'); // Ability
        expect(cells[3]).toHaveTextContent('N/A'); // Attack
        expect(cells[4]).toHaveTextContent('N/A'); // Save DC
    });

    it('should handle sorting clicks', () => {
        render(<SpellbookListTable {...defaultProps} />);

        fireEvent.click(screen.getByText('Spellbook Name'));
        expect(defaultProps.onSort).toHaveBeenCalledWith('name');

        fireEvent.click(screen.getByText('Spells'));
        expect(defaultProps.onSort).toHaveBeenCalledWith('spells');
    });

    it('should handle row clicks', () => {
        render(<SpellbookListTable {...defaultProps} />);

        fireEvent.click(screen.getByText('Spellbook 1'));
        expect(defaultProps.onSpellbookClick).toHaveBeenCalledWith('1');
    });

    it('should handle action buttons', () => {
        render(<SpellbookListTable {...defaultProps} />);

        const copyButtons = screen.getAllByTitle('Copy Spellbook');
        fireEvent.click(copyButtons[0]);
        expect(defaultProps.onCopy).toHaveBeenCalledWith('1');

        const deleteButtons = screen.getAllByTitle('Delete Spellbook');
        fireEvent.click(deleteButtons[0]);
        expect(defaultProps.onDelete).toHaveBeenCalledWith('1', 'Spellbook 1');
    });

    it('should handle touch events', () => {
        render(<SpellbookListTable {...defaultProps} />);

        const row = screen.getByTestId('spellbook-row-1');

        fireEvent.touchStart(row);
        expect(defaultProps.onTouchStart).toHaveBeenCalled();

        fireEvent.touchMove(row);
        expect(defaultProps.onTouchMove).toHaveBeenCalled();

        fireEvent.touchEnd(row);
        expect(defaultProps.onTouchEnd).toHaveBeenCalled();
    });
});
