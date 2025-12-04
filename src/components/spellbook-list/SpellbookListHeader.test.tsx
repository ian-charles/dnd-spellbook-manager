import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpellbookListHeader } from './SpellbookListHeader';
import { MESSAGES } from '../../constants/messages';

describe('SpellbookListHeader', () => {
    const defaultProps = {
        spellbookCount: 5,
        importing: false,
        onExport: vi.fn(),
        onImportClick: vi.fn(),
        onCreateClick: vi.fn(),
    };

    it('should render header correctly', () => {
        render(<SpellbookListHeader {...defaultProps} />);

        expect(screen.getByText('My Spellbooks')).toBeInTheDocument();
        expect(screen.getByText(MESSAGES.BUTTONS.EXPORT)).toBeInTheDocument();
        expect(screen.getByText(MESSAGES.BUTTONS.IMPORT)).toBeInTheDocument();
        expect(screen.getByText('+ New Spellbook')).toBeInTheDocument();
    });

    it('should disable export button when no spellbooks', () => {
        render(<SpellbookListHeader {...defaultProps} spellbookCount={0} />);

        const exportButton = screen.getByText(MESSAGES.BUTTONS.EXPORT).closest('button');
        expect(exportButton).toBeDisabled();
        expect(exportButton).toHaveAttribute('title', MESSAGES.TOOLTIPS.NO_SPELLBOOKS_TO_EXPORT);
    });

    it('should enable export button when spellbooks exist', () => {
        render(<SpellbookListHeader {...defaultProps} />);

        const exportButton = screen.getByText(MESSAGES.BUTTONS.EXPORT).closest('button');
        expect(exportButton).not.toBeDisabled();
        expect(exportButton).toHaveAttribute('title', MESSAGES.TOOLTIPS.EXPORT_ALL_SPELLBOOKS);
    });

    it('should show loading state for import button', () => {
        render(<SpellbookListHeader {...defaultProps} importing={true} />);

        expect(screen.getByText('Importing...')).toBeInTheDocument();
        expect(screen.queryByText(MESSAGES.BUTTONS.IMPORT)).not.toBeInTheDocument();
    });

    it('should handle button clicks', () => {
        render(<SpellbookListHeader {...defaultProps} />);

        fireEvent.click(screen.getByText(MESSAGES.BUTTONS.EXPORT));
        expect(defaultProps.onExport).toHaveBeenCalled();

        fireEvent.click(screen.getByText(MESSAGES.BUTTONS.IMPORT));
        expect(defaultProps.onImportClick).toHaveBeenCalled();

        fireEvent.click(screen.getByText('+ New Spellbook'));
        expect(defaultProps.onCreateClick).toHaveBeenCalled();
    });
});
