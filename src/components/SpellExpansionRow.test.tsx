import { render, screen } from '@testing-library/react';
import { SpellExpansionRow } from './SpellExpansionRow';
import { Spell } from '../types/spell';
import { describe, it, expect } from 'vitest';

const mockSpell: Spell = {
    id: 'fireball',
    name: 'Fireball',
    level: 3,
    school: 'Evocation',
    castingTime: '1 action',
    range: '150 feet',
    components: {
        verbal: true,
        somatic: true,
        material: true
    },
    materials: 'A tiny ball of bat guano and sulfur',
    duration: 'Instantaneous',
    classes: ['Sorcerer', 'Wizard'],
    description: 'A bright streak flashes from your pointing finger...',
    higherLevels: 'When you cast this spell using a spell slot of 4th level or higher...',
    source: 'PHB',
    ritual: false,
    concentration: false
};

describe('SpellExpansionRow', () => {
    it('renders full variant correctly', () => {
        render(
            <table>
                <tbody>
                    <SpellExpansionRow spell={mockSpell} colSpan={5} variant="full" />
                </tbody>
            </table>
        );

        // Check for meta info (now displayed as separate badges)
        expect(screen.getByText('Level 3')).toBeInTheDocument();
        expect(screen.getByText('•')).toBeInTheDocument();
        expect(screen.getByText('Evocation')).toBeInTheDocument();

        // Check for details
        expect(screen.getByText(/Casting Time:/)).toBeInTheDocument();
        expect(screen.getByText('1 action')).toBeInTheDocument();

        // Check for description
        expect(screen.getByText(/A bright streak flashes/)).toBeInTheDocument();

        // Check for higher levels
        expect(screen.getByText(/At Higher Levels:/)).toBeInTheDocument();

        // Check for source
        expect(screen.getByText('PHB')).toBeInTheDocument();
    });

    it('renders compact variant correctly', () => {
        render(
            <table>
                <tbody>
                    <SpellExpansionRow spell={mockSpell} colSpan={5} variant="compact" />
                </tbody>
            </table>
        );

        // Meta info should NOT be present
        expect(screen.queryByText(/3rd-level Evocation/)).not.toBeInTheDocument();

        // Details should NOT be present
        expect(screen.queryByText(/Casting Time:/)).not.toBeInTheDocument();

        // Description SHOULD be present
        expect(screen.getByText(/A bright streak flashes/)).toBeInTheDocument();

        // Higher levels SHOULD be present
        expect(screen.getByText(/At Higher Levels:/)).toBeInTheDocument();

        // Source should NOT be present
        expect(screen.queryByText('PHB')).not.toBeInTheDocument();
    });

    it('renders with correct colSpan', () => {
        render(
            <table>
                <tbody>
                    <SpellExpansionRow spell={mockSpell} colSpan={7} />
                </tbody>
            </table>
        );

        const cell = screen.getByRole('cell');
        expect(cell).toHaveAttribute('colspan', '7');
    });
});
