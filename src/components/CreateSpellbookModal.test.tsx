/**
 * CreateSpellbookModal Component Tests
 *
 * Testing Strategy:
 * - Uses React Testing Library for rendering and interactions
 * - Tests validation, submission, and prop handling
 * - Follows AAA pattern (Arrange-Act-Assert)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateSpellbookModal } from './CreateSpellbookModal';
import {
    MIN_ATTACK_MODIFIER,
    MAX_ATTACK_MODIFIER,
    MIN_SAVE_DC,
    MAX_SAVE_DC
} from '../constants/gameRules';

describe('CreateSpellbookModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onSubmit: vi.fn(),
        existingNames: [],
    };

    it('should render correctly', () => {
        render(<CreateSpellbookModal {...defaultProps} />);
        expect(screen.getByText('Create New Spellbook')).toBeTruthy();
        expect(screen.getByTestId('spellbook-name-input')).toBeTruthy();
    });

    it('should use default title when title prop is empty string', () => {
        render(<CreateSpellbookModal {...defaultProps} title="" />);
        expect(screen.getByText(/Create New Spellbook/i)).toBeTruthy();
    });

    it('should use provided title', () => {
        render(<CreateSpellbookModal {...defaultProps} title="Edit Spellbook" />);
        expect(screen.getByText('Edit Spellbook')).toBeTruthy();
    });

    it('should validate empty name', async () => {
        const user = userEvent.setup();
        render(<CreateSpellbookModal {...defaultProps} />);
        const createButton = screen.getByTestId('create-button');
        await user.click(createButton);

        await waitFor(() => {
            expect(screen.getByText('Spellbook name is required')).toBeTruthy();
        });
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('should validate duplicate name', async () => {
        const user = userEvent.setup();
        render(<CreateSpellbookModal {...defaultProps} existingNames={['Existing Book']} />);
        const nameInput = screen.getByTestId('spellbook-name-input');
        await user.clear(nameInput);
        await user.type(nameInput, 'Existing Book');

        const createButton = screen.getByTestId('create-button');
        await user.click(createButton);

        await waitFor(() => {
            expect(screen.getByText('A spellbook with this name already exists')).toBeTruthy();
        });
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('should validate attack modifier range', async () => {
        const user = userEvent.setup();
        render(<CreateSpellbookModal {...defaultProps} />);
        const nameInput = screen.getByTestId('spellbook-name-input');
        await user.clear(nameInput);
        await user.type(nameInput, 'New Book');

        const attackInput = screen.getByTestId('attack-modifier-input');
        await user.type(attackInput, '20'); // Out of range (0-18)

        const form = screen.getByTestId('create-spellbook-form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(`Spell Attack Modifier must be an integer between ${MIN_ATTACK_MODIFIER} and ${MAX_ATTACK_MODIFIER}`)).toBeTruthy();
        });
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('should validate save DC range', async () => {
        const user = userEvent.setup();
        render(<CreateSpellbookModal {...defaultProps} />);
        const nameInput = screen.getByTestId('spellbook-name-input');
        await user.clear(nameInput);
        await user.type(nameInput, 'New Book');

        const dcInput = screen.getByTestId('save-dc-input');
        await user.type(dcInput, '30'); // Out of range (8-26)

        const form = screen.getByTestId('create-spellbook-form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(`Spell Save DC must be an integer between ${MIN_SAVE_DC} and ${MAX_SAVE_DC}`)).toBeTruthy();
        });
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('should handle submission error', async () => {
        const mockOnSubmit = vi.fn().mockRejectedValue(new Error('Submission failed'));
        render(<CreateSpellbookModal {...defaultProps} onSubmit={mockOnSubmit} />);
        const input = screen.getByTestId('spellbook-name-input');
        fireEvent.change(input, { target: { value: 'New Spellbook' } });
        const createButton = screen.getByTestId('create-button');
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(screen.getByText('Submission failed')).toBeTruthy();
        });
    });

    it('should call onSubmit with correct data', async () => {
        render(<CreateSpellbookModal {...defaultProps} />);
        const input = screen.getByTestId('spellbook-name-input');
        fireEvent.change(input, { target: { value: 'New Spellbook' } });
        const createButton = screen.getByTestId('create-button');
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(defaultProps.onSubmit).toHaveBeenCalledWith(expect.objectContaining({
                name: 'New Spellbook',
            }));
        });
    });
});
