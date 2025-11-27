import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpellDescription } from './SpellDescription';

describe('SpellDescription', () => {
    it('should render plain text correctly', () => {
        render(<SpellDescription text="This is a normal spell description." />);
        expect(screen.getByText('This is a normal spell description.'), 'Plain text should be rendered').toBeTruthy();
    });

    it('should highlight simple dice notation', () => {
        render(<SpellDescription text="Deals 1d6 damage." />);
        const dice = screen.getByTestId('dice-notation');
        expect(dice, 'Dice notation element should exist').toBeTruthy();
        expect(dice.textContent, 'Dice notation text should match').toBe('1d6');
        expect(screen.getByText(/Deals/), 'Surrounding text "Deals" should exist').toBeTruthy();
        expect(screen.getByText(/damage/), 'Surrounding text "damage" should exist').toBeTruthy();
    });

    it('should highlight multiple dice notations', () => {
        render(<SpellDescription text="Deals 1d6 fire damage and 2d8 radiant damage." />);
        const diceElements = screen.getAllByTestId('dice-notation');
        expect(diceElements.length, 'Should find 2 dice notations').toBe(2);
        expect(diceElements[0].textContent, 'First dice should be 1d6').toBe('1d6');
        expect(diceElements[1].textContent, 'Second dice should be 2d8').toBe('2d8');
    });

    it('should highlight d20', () => {
        render(<SpellDescription text="Roll a d20." />);
        const dice = screen.getByTestId('dice-notation');
        expect(dice.textContent, 'Should highlight d20').toBe('d20');
    });

    it('should highlight d100', () => {
        render(<SpellDescription text="Roll a d100." />);
        const dice = screen.getByTestId('dice-notation');
        expect(dice.textContent, 'Should highlight d100').toBe('d100');
    });

    it('should not highlight invalid dice notation', () => {
        render(<SpellDescription text="This is a d5 and a 1d3." />);
        const dice = screen.queryByTestId('dice-notation');
        expect(dice, 'Invalid dice should not be highlighted').toBeNull();
    });

    it('should handle empty string', () => {
        const { container } = render(<SpellDescription text="" />);
        expect(container.firstChild, 'Empty string should render nothing').toBeNull();
    });

    it('should handle string with only dice notation', () => {
        render(<SpellDescription text="1d6" />);
        const dice = screen.getByTestId('dice-notation');
        expect(dice, 'Dice notation element should exist').toBeTruthy();
        expect(dice.textContent, 'Dice notation text should match').toBe('1d6');
    });

    it('should handle dice notation at start and end', () => {
        render(<SpellDescription text="1d6 damage 1d8" />);
        const diceElements = screen.getAllByTestId('dice-notation');
        expect(diceElements.length, 'Should find 2 dice notations').toBe(2);
        expect(diceElements[0].textContent, 'First dice should be 1d6').toBe('1d6');
        expect(diceElements[1].textContent, 'Second dice should be 1d8').toBe('1d8');
    });

    it('should be case insensitive', () => {
        render(<SpellDescription text="1D6 damage" />);
        const dice = screen.getByTestId('dice-notation');
        expect(dice, 'Dice notation element should exist').toBeTruthy();
        expect(dice.textContent, 'Dice notation should match case').toBe('1D6');
    });

    it('should not highlight partial matches', () => {
        render(<SpellDescription text="d 1d 100" />);
        const dice = screen.queryByTestId('dice-notation');
        expect(dice, 'Partial matches should not be highlighted').toBeNull();
    });
    it('should render markdown tables', () => {
        const text = `
Here is a table:
| Header 1 | Header 2 |
|---|---|
| Cell 1 | Cell 2 |
| Cell 3 | Cell 4 |
`;
        const { container } = render(<SpellDescription text={text} />);
        const table = container.querySelector('table');
        expect(table, 'Table element should exist').toBeTruthy();
        expect(table?.querySelectorAll('th').length, 'Should have 2 headers').toBe(2);
        expect(table?.querySelectorAll('tr').length, 'Should have 3 rows').toBe(3); // 1 header + 2 body
        expect(screen.getByText('Header 1'), 'Header 1 text should exist').toBeTruthy();
        expect(screen.getByText('Cell 1'), 'Cell 1 text should exist').toBeTruthy();
    });

    it('should highlight dice notation inside tables', () => {
        const text = `
| Damage | Type |
|---|---|
| 1d6 | Fire |
`;
        render(<SpellDescription text={text} />);
        const dice = screen.getByTestId('dice-notation');
        expect(dice, 'Dice notation inside table should exist').toBeTruthy();
        expect(dice.textContent, 'Dice text should match').toBe('1d6');
    });

    it('should handle mixed content', () => {
        const text = `
Start text.
| Col 1 |
|---|
| Val 1 |
End text.
`;
        const { container } = render(<SpellDescription text={text} />);
        expect(screen.getByText('Start text.'), 'Start text should exist').toBeTruthy();
        expect(container.querySelector('table'), 'Table should exist').toBeTruthy();
        expect(screen.getByText('End text.'), 'End text should exist').toBeTruthy();
    });

    it('should handle malformed tables (uneven columns)', () => {
        const text = `
| Col 1 | Col 2 |
|---|---|
| Val 1 |
| Val 2 | Val 3 | Val 4 |
`;
        const { container } = render(<SpellDescription text={text} />);
        const rows = container.querySelectorAll('tbody tr');
        expect(rows.length, 'Should render 2 body rows').toBe(2);
        expect(rows[0].querySelectorAll('td').length, 'First row should have 1 cell').toBe(1);
        expect(rows[1].querySelectorAll('td').length, 'Second row should have 3 cells').toBe(3);
    });

    it('should handle tables with empty cells', () => {
        const text = `
| Col 1 | Col 2 |
|---|---|
| | Val 2 |
`;
        const { container } = render(<SpellDescription text={text} />);
        const cells = container.querySelectorAll('td');
        expect(cells.length, 'Should render 2 cells').toBe(2);
        expect(cells[0].textContent, 'First cell should be empty').toBe('');
        expect(cells[1].textContent, 'Second cell should have content').toBe('Val 2');
    });

    it('should escape HTML in table cells (XSS protection)', () => {
        const text = `
| Header |
|---|
| <script>alert("xss")</script> |
`;
        render(<SpellDescription text={text} />);
        expect(screen.queryByText('<script>alert("xss")</script>'), 'Should render escaped HTML text').toBeTruthy();
        // Ensure it's not executed/rendered as HTML
        const cell = screen.getByText('<script>alert("xss")</script>');
        expect(cell.innerHTML).not.toContain('<script>');
    });

    it('should handle large dice numbers without overflow/crash', () => {
        const text = "Deals 999999999d100 damage.";
        render(<SpellDescription text={text} />);
        const dice = screen.getByTestId('dice-notation');
        expect(dice.textContent, 'Should handle large numbers').toBe('999999999d100');
    });

    it('should handle multiple tables', () => {
        const text = `
| Table 1 |
|---|
| Val 1 |

Text in between.

| Table 2 |
|---|
| Val 2 |
`;
        const { container } = render(<SpellDescription text={text} />);
        const tables = container.querySelectorAll('table');
        expect(tables.length, 'Should render 2 tables').toBe(2);
        expect(screen.getByText('Table 1'), 'First table header should exist').toBeTruthy();
        expect(screen.getByText('Table 2'), 'Second table header should exist').toBeTruthy();
    });

    it('should handle Unicode characters near dice notation', () => {
        const text = "Deals 1d6🔥 damage.";
        render(<SpellDescription text={text} />);
        const dice = screen.getByTestId('dice-notation');
        expect(dice.textContent, 'Should highlight dice with Unicode neighbor').toBe('1d6');
        expect(screen.getByText(/🔥/), 'Unicode character should be rendered').toBeTruthy();
    });
});
