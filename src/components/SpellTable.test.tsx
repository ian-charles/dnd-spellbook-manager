import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SpellTable } from './SpellTable';
import { Spell } from '../types/spell';

const mockSpells: Spell[] = [
    {
        id: '1',
        name: 'Fireball',
        level: 3,
        school: 'Evocation',
        castingTime: '1 action',
        range: '150 feet',
        components: { verbal: true, somatic: true, material: true },
        materials: 'A tiny ball of bat guano and sulfur',
        duration: 'Instantaneous',
        classes: ['Sorcerer', 'Wizard'],
        description: 'A bright streak flashes from your pointing finger...',
        source: 'PHB',
        concentration: false,
        ritual: false,
        higherLevels: 'Damage increases by 1d6 for each slot level above 3rd.',
    },
    {
        id: '2',
        name: 'Magic Missile',
        level: 1,
        school: 'Evocation',
        castingTime: '1 action',
        range: '120 feet',
        components: { verbal: true, somatic: true, material: false },
        materials: '',
        duration: 'Instantaneous',
        classes: ['Sorcerer', 'Wizard'],
        description: 'You create three glowing darts of magical force...',
        source: 'PHB',
        concentration: false,
        ritual: false,
        higherLevels: 'You create one more dart for each slot level above 1st.',
    },
    {
        id: '3',
        name: 'Cure Wounds',
        level: 1,
        school: 'Evocation',
        castingTime: '1 action',
        range: 'Touch',
        components: { verbal: true, somatic: true, material: false },
        materials: '',
        duration: 'Instantaneous',
        classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger'],
        description: 'A creature you touch regains a number of hit points...',
        source: 'PHB',
        concentration: false,
        ritual: false,
        higherLevels: 'Healing increases by 1d8 for each slot level above 1st.',
    },
];

describe('SpellTable', () => {
    it('should render spells', () => {
        render(<SpellTable spells={mockSpells} />);
        expect(screen.getByText('Fireball'), 'Fireball spell should be rendered').toBeTruthy();
        expect(screen.getByText('Magic Missile'), 'Magic Missile spell should be rendered').toBeTruthy();
        expect(screen.getByText('Cure Wounds'), 'Cure Wounds spell should be rendered').toBeTruthy();
    });

    it('should sort spells by name', async () => {
        render(<SpellTable spells={mockSpells} />);

        // Initial order (default might be level or name, but let's check)
        // If default is name asc: Cure Wounds, Fireball, Magic Missile

        const nameHeader = screen.getByText('Name');

        // Click to sort desc
        fireEvent.click(nameHeader);

        await waitFor(() => {
            const rows = screen.getAllByRole('row');
            // Row 0 is header. Row 1 is first spell.
            // Desc order: Magic Missile, Fireball, Cure Wounds
            const rowTexts = rows.slice(1).map(r => r.textContent);
            expect(rowTexts[0], 'First row should be Magic Missile').toContain('Magic Missile');
            expect(rowTexts[1], 'Second row should be Fireball').toContain('Fireball');
            expect(rowTexts[2], 'Third row should be Cure Wounds').toContain('Cure Wounds');
        });

        // Click to sort asc
        fireEvent.click(nameHeader);

        await waitFor(() => {
            const rows = screen.getAllByRole('row');
            // Asc order: Cure Wounds, Fireball, Magic Missile
            const rowTexts = rows.slice(1).map(r => r.textContent);
            expect(rowTexts[0], 'First row should be Cure Wounds').toContain('Cure Wounds');
            expect(rowTexts[1], 'Second row should be Fireball').toContain('Fireball');
            expect(rowTexts[2], 'Third row should be Magic Missile').toContain('Magic Missile');
        });
    });

    it('should sort spells by level', async () => {
        render(<SpellTable spells={mockSpells} />);

        const levelHeader = screen.getByText('Level');

        // Click to sort (asc by default first click if not active)
        fireEvent.click(levelHeader);

        await waitFor(() => {
            const rows = screen.getAllByRole('row');
            // Level 1 spells first, then Level 3
            // Cure Wounds (1), Magic Missile (1), Fireball (3)
            // Secondary sort is usually name
            const rowTexts = rows.slice(1).map(r => r.textContent);
            expect(rowTexts[2], 'Last row should be Fireball (Level 3)').toContain('Fireball');
        });

        // Click to sort desc
        fireEvent.click(levelHeader);

        await waitFor(() => {
            const rows = screen.getAllByRole('row');
            // Fireball (3) first
            const rowTexts = rows.slice(1).map(r => r.textContent);
            expect(rowTexts[0], 'First row should be Fireball').toContain('Fireball');
        });
    });

    it('should expand spell details on row click', () => {
        render(<SpellTable spells={mockSpells} />);

        const fireballRow = screen.getByText('Fireball').closest('tr');
        if (!fireballRow) throw new Error('Row not found');

        fireEvent.click(fireballRow);

        // Verify content is visible
        const description = screen.getByText('A bright streak flashes from your pointing finger...');
        expect(description, 'Spell description should be visible').toBeTruthy();

        // Verify expansion row structure (colspan)
        const expansionRow = description.closest('tr');
        // Check for expansion behavior/structure rather than specific class name
        expect(expansionRow, 'Expansion row should be visible').toBeTruthy();
        const cell = expansionRow?.querySelector('td');
        // Colspan is 9 because checkbox column is not rendered (onSelectionChange not provided)
        // Columns: Name, Level, Time, Range, Duration, Comp., School, Classes, Source
        expect(cell?.getAttribute('colSpan'), 'Expansion row should span 9 columns').toBe('9');
    });

    it('should handle empty spell list', () => {
        render(<SpellTable spells={[]} />);
        expect(screen.queryByRole('row', { name: /Fireball/i }), 'No spell rows should be rendered for empty list').toBeNull();
        expect(screen.getByText('No spells found matching your search criteria.'), 'Empty state message should be present').toBeTruthy();
    });

    it('should handle single spell', () => {
        render(<SpellTable spells={[mockSpells[0]]} />);
        expect(screen.getByText('Fireball'), 'Fireball spell should be rendered').toBeTruthy();
        expect(screen.queryByText('Magic Missile'), 'Magic Missile spell should not be rendered').toBeNull();
    });

    it('should only expand one row at a time', () => {
        render(<SpellTable spells={mockSpells} />);

        const fireballRow = screen.getByText('Fireball').closest('tr');
        const missileRow = screen.getByText('Magic Missile').closest('tr');

        if (!fireballRow || !missileRow) throw new Error('Rows not found');

        // Click Fireball
        fireEvent.click(fireballRow);
        expect(screen.getByText('A bright streak flashes from your pointing finger...')).toBeTruthy();

        // Click Magic Missile
        fireEvent.click(missileRow);
        expect(screen.getByText('You create three glowing darts of magical force...')).toBeTruthy();
        expect(screen.queryByText('A bright streak flashes from your pointing finger...')).toBeNull();
    });
});
