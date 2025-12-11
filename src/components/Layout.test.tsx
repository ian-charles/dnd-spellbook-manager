/**
 * @file Layout.test.tsx
 * @description Unit tests for the Layout component.
 *
 * Testing Strategy:
 * - Verify rendering of children content.
 * - Verify rendering of header elements (title, subtitle).
 * - Verify navigation buttons and their active states.
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Layout } from './Layout';
import '@testing-library/jest-dom';

describe('Layout', () => {
    const defaultProps = {
        currentView: 'spellbooks' as const,
        spellbookCount: 0,
        onNavigateToBrowse: vi.fn(),
        onNavigateToSpellbooks: vi.fn(),
        onAboutClick: vi.fn(),
    };

    it('renders children correctly', () => {
        render(
            <Layout {...defaultProps}>
                <div data-testid="test-child">Child Content</div>
            </Layout>
        );

        expect(screen.getByTestId('test-child')).toBeInTheDocument();
        expect(screen.getByText('Child Content'), 'Child content should be visible').toBeInTheDocument();
    });

    it('renders title and subtitle', () => {
        render(
            <Layout {...defaultProps}>
                <div>Content</div>
            </Layout>
        );

        expect(screen.getByText('The Spellbookery'), 'Title should be visible').toBeInTheDocument();
        expect(screen.getByText('A D&D Magic Manager'), 'Subtitle should be visible').toBeInTheDocument();
    });

    it('renders navigation buttons', () => {
        render(
            <Layout {...defaultProps}>
                <div>Content</div>
            </Layout>
        );

        expect(screen.getByRole('button', { name: /My Spellbooks/i }), 'Spellbooks button should be visible').toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Browse Spells/i }), 'Browse button should be visible').toBeInTheDocument();
    });

    it('highlights active view correctly', () => {
        const { rerender } = render(
            <Layout {...defaultProps} currentView="spellbooks">
                <div>Content</div>
            </Layout>
        );

        const spellbooksButton = screen.getByRole('button', { name: /My Spellbooks/i });
        const browseButton = screen.getByRole('button', { name: /Browse Spells/i });

        expect(spellbooksButton, 'Spellbooks button should be active').toHaveAttribute('aria-current', 'page');
        expect(browseButton, 'Browse button should not be active').not.toHaveAttribute('aria-current');

        rerender(
            <Layout {...defaultProps} currentView="browse">
                <div>Content</div>
            </Layout>
        );

        expect(spellbooksButton, 'Spellbooks button should not be active').not.toHaveAttribute('aria-current');
        expect(browseButton, 'Browse button should be active').toHaveAttribute('aria-current', 'page');
    });
});
