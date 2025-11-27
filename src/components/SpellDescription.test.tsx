import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpellDescription } from './SpellDescription';

describe('SpellDescription', () => {
    it('should render plain text correctly', () => {
        render(<SpellDescription text="This is a normal spell description." />);
        expect(screen.getByText('This is a normal spell description.')).toBeTruthy();
    });

    it('should highlight simple dice notation', () => {
        const { container } = render(<SpellDescription text="Deals 1d6 damage." />);
        const dice = container.querySelector('.dice-notation');
        expect(dice).toBeTruthy();
        expect(dice?.textContent).toBe('1d6');
        expect(screen.getByText(/Deals/)).toBeTruthy();
        expect(screen.getByText(/damage/)).toBeTruthy();
    });

    it('should highlight multiple dice notations', () => {
        const { container } = render(<SpellDescription text="Deals 1d6 fire damage and 2d8 radiant damage." />);
        const diceElements = container.querySelectorAll('.dice-notation');
        expect(diceElements.length).toBe(2);
        expect(diceElements[0].textContent).toBe('1d6');
        expect(diceElements[1].textContent).toBe('2d8');
    });

    it('should highlight d20', () => {
        const { container } = render(<SpellDescription text="Roll a d20." />);
        const dice = container.querySelector('.dice-notation');
        expect(dice?.textContent).toBe('d20');
    });

    it('should highlight d100', () => {
        const { container } = render(<SpellDescription text="Roll a d100." />);
        const dice = container.querySelector('.dice-notation');
        expect(dice?.textContent).toBe('d100');
    });

    it('should not highlight invalid dice notation', () => {
        const { container } = render(<SpellDescription text="This is a d5 and a 1d3." />);
        const dice = container.querySelector('.dice-notation');
        expect(dice).toBeNull();
    });

    it('should handle empty string', () => {
        const { container } = render(<SpellDescription text="" />);
        expect(container.firstChild).toBeNull();
    });

    it('should handle string with only dice notation', () => {
        const { container } = render(<SpellDescription text="1d6" />);
        const dice = container.querySelector('.dice-notation');
        expect(dice).toBeTruthy();
        expect(dice?.textContent).toBe('1d6');
    });

    it('should handle dice notation at start and end', () => {
        const { container } = render(<SpellDescription text="1d6 damage 1d8" />);
        const diceElements = container.querySelectorAll('.dice-notation');
        expect(diceElements.length).toBe(2);
        expect(diceElements[0].textContent).toBe('1d6');
        expect(diceElements[1].textContent).toBe('1d8');
    });

    it('should be case insensitive', () => {
        const { container } = render(<SpellDescription text="1D6 damage" />);
        const dice = container.querySelector('.dice-notation');
        expect(dice).toBeTruthy();
        expect(dice?.textContent).toBe('1D6');
    });

    it('should not highlight partial matches', () => {
        const { container } = render(<SpellDescription text="d 1d 100" />);
        const dice = container.querySelector('.dice-notation');
        expect(dice).toBeNull();
    });
});
