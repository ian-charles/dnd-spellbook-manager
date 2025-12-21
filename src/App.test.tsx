import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { MESSAGES } from './constants/messages';

// Mock child components to simplify testing App logic
vi.mock('./components/Layout', () => ({
    Layout: ({ children, currentView }: any) => (
        <div data-testid="layout" data-view={currentView}>
            {children}
        </div>
    ),
}));

vi.mock('./components/SpellTable', () => ({
    SpellTable: ({ onSelectionChange, onAddToSpellbook }: any) => (
        <div data-testid="spell-table">
            <button onClick={() => onSelectionChange(new Set(['spell-1']))} data-testid="select-spell">
                Select Spell
            </button>
            <button onClick={onAddToSpellbook} data-testid="add-to-spellbook-table-btn">
                Add to Spellbook
            </button>
        </div>
    ),
}));

vi.mock('./components/SpellFilters', () => ({
    SpellFilters: () => <div data-testid="spell-filters" />,
}));

vi.mock('./components/SpellbookList', () => ({
    SpellbookList: () => <div data-testid="spellbook-list" />,
}));

vi.mock('./components/SpellbookDetail', () => ({
    SpellbookDetail: () => <div data-testid="spellbook-detail" />,
}));

vi.mock('./components/CreateSpellbookModal', () => ({
    CreateSpellbookModal: ({ isOpen, onClose, onSubmit }: any) =>
        isOpen ? (
            <div data-testid="create-modal">
                <button onClick={onClose} data-testid="close-modal">Close</button>
                <button onClick={() => onSubmit({ name: 'New Book' }).catch(() => { })} data-testid="submit-modal">Create</button>
            </div>
        ) : null,
}));

vi.mock('./components/LoadingButton', () => ({
    LoadingButton: ({ onClick, children, loading, loadingText, disabled, ...props }: any) => (
        <button onClick={onClick} disabled={disabled || loading} {...props}>
            {loading ? loadingText : children}
        </button>
    ),
}));

// Mock hooks
const mockUseSpells = vi.fn();
const mockUseSpellbooks = vi.fn();
const mockUseHashRouter = vi.fn();
const mockUseModal = vi.fn();
const mockUseToast = vi.fn();

vi.mock('./hooks/useSpells', () => ({ useSpells: () => mockUseSpells() }));
vi.mock('./hooks/useSpellbooks', () => ({ useSpellbooks: () => mockUseSpellbooks() }));
vi.mock('./hooks/useHashRouter', () => ({ useHashRouter: () => mockUseHashRouter() }));
vi.mock('./hooks/useModal', () => ({ useModal: () => mockUseModal() }));
vi.mock('./hooks/useToast', () => ({ useToast: () => mockUseToast() }));

describe('App Component', () => {
    const defaultSpells = [
        { id: 'spell-1', name: 'Fireball', level: 3, school: 'Evocation', classes: ['Wizard'] },
        { id: 'spell-2', name: 'Magic Missile', level: 1, school: 'Evocation', classes: ['Wizard'] },
    ];

    const defaultSpellbooks = [
        { id: 'sb-1', name: 'My Spells', spells: [] },
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        // Default hook implementations
        mockUseSpells.mockReturnValue({
            spells: defaultSpells,
            loading: false,
            error: null,
        });

        mockUseSpellbooks.mockReturnValue({
            spellbooks: defaultSpellbooks,
            loading: false,
            addSpellsToSpellbook: vi.fn().mockResolvedValue(undefined),
            createSpellbook: vi.fn().mockResolvedValue({ id: 'sb-new', name: 'New Book', spells: [] }),
            deleteSpellbook: vi.fn(),
            refreshSpellbooks: vi.fn().mockResolvedValue(undefined),
        });

        mockUseHashRouter.mockReturnValue({
            currentView: 'browse',
            selectedSpellbookId: null,
            navigateToBrowse: vi.fn(),
            navigateToSpellbooks: vi.fn(),
            navigateToSpellbookDetail: vi.fn(),
        });

        mockUseModal.mockReturnValue({
            isOpen: false,
            data: null,
            openModal: vi.fn(),
            closeModal: vi.fn(),
        });

        mockUseToast.mockReturnValue({
            isVisible: false,
            message: '',
            type: 'success',
            showToast: vi.fn(),
            hideToast: vi.fn(),
        });
    });

    it('renders loading state initially', () => {
        mockUseSpells.mockReturnValue({ spells: [], loading: true, error: null });
        render(<App />);
        expect(screen.getByText(MESSAGES.LOADING.SPELLS)).toBeInTheDocument();
    });

    it('renders error state', () => {
        mockUseSpells.mockReturnValue({ spells: [], loading: false, error: new Error('Failed to load') });
        render(<App />);
        expect(screen.getByText(MESSAGES.ERROR.ERROR_LOADING_SPELLS)).toBeInTheDocument();
        expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });

    it('renders browse view by default', () => {
        render(<App />);
        expect(screen.getByTestId('layout')).toHaveAttribute('data-view', 'browse');
        expect(screen.getByTestId('spell-filters')).toBeInTheDocument();
        expect(screen.getByTestId('spell-table')).toBeInTheDocument();
    });

    it('renders spellbooks list view', () => {
        mockUseHashRouter.mockReturnValue({
            currentView: 'spellbooks',
            selectedSpellbookId: null,
            navigateToBrowse: vi.fn(),
            navigateToSpellbooks: vi.fn(),
            navigateToSpellbookDetail: vi.fn(),
        });
        render(<App />);
        expect(screen.getByTestId('layout')).toHaveAttribute('data-view', 'spellbooks');
        expect(screen.getByTestId('spellbook-list')).toBeInTheDocument();
    });

    it('renders spellbook detail view', () => {
        mockUseHashRouter.mockReturnValue({
            currentView: 'spellbook-detail',
            selectedSpellbookId: 'sb-1',
            navigateToBrowse: vi.fn(),
            navigateToSpellbooks: vi.fn(),
            navigateToSpellbookDetail: vi.fn(),
        });
        render(<App />);
        expect(screen.getByTestId('layout')).toHaveAttribute('data-view', 'spellbook-detail');
        expect(screen.getByTestId('spellbook-detail')).toBeInTheDocument();
    });

    it('handles spell selection and batch add flow', async () => {
        const { addSpellsToSpellbook, refreshSpellbooks } = mockUseSpellbooks();
        const { showToast } = mockUseToast();

        render(<App />);

        // Select a spell
        fireEvent.click(screen.getByTestId('select-spell'));

        // Click Add button to open modal
        const addButton = screen.getByTestId('btn-add-selected');
        expect(addButton).not.toBeDisabled();
        fireEvent.click(addButton);

        // Modal should open - select a spellbook
        await waitFor(() => {
            expect(screen.getByTestId('select-spellbook-dialog')).toBeInTheDocument();
        });

        // Click on a spellbook option
        fireEvent.click(screen.getByTestId('spellbook-option-sb-1'));

        // Click Add button in modal
        fireEvent.click(screen.getByTestId('add-button'));

        await waitFor(() => {
            expect(addSpellsToSpellbook).toHaveBeenCalledWith('sb-1', ['spell-1']);
            expect(refreshSpellbooks).toHaveBeenCalled();
            expect(showToast).toHaveBeenCalledWith(expect.stringContaining('Spell added'));
        });
    });

    it('shows error alert when adding spell fails', async () => {
        const { addSpellsToSpellbook } = mockUseSpellbooks();
        addSpellsToSpellbook.mockRejectedValue(new Error('Network error'));

        render(<App />);

        fireEvent.click(screen.getByTestId('select-spell'));
        fireEvent.click(screen.getByTestId('btn-add-selected'));

        // Wait for modal and select spellbook
        await waitFor(() => {
            expect(screen.getByTestId('select-spellbook-dialog')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('spellbook-option-sb-1'));
        fireEvent.click(screen.getByTestId('add-button'));

        await waitFor(() => {
            expect(screen.getByText(MESSAGES.ERROR.FAILED_TO_ADD_SPELL)).toBeInTheDocument();
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });

    it('opens create modal when "Create New Spellbook" is clicked in select modal', async () => {
        render(<App />);

        fireEvent.click(screen.getByTestId('select-spell'));
        fireEvent.click(screen.getByTestId('btn-add-selected'));

        // Wait for select modal
        await waitFor(() => {
            expect(screen.getByTestId('select-spellbook-dialog')).toBeInTheDocument();
        });

        // Click "Create New Spellbook" button
        fireEvent.click(screen.getByTestId('create-new-spellbook-button'));

        expect(screen.getByTestId('create-modal')).toBeInTheDocument();
    });

    it('handles creating new spellbook with selected spells', async () => {
        const { createSpellbook, addSpellsToSpellbook, refreshSpellbooks } = mockUseSpellbooks();
        const { showToast } = mockUseToast();

        render(<App />);

        // Select spell
        fireEvent.click(screen.getByTestId('select-spell'));
        fireEvent.click(screen.getByTestId('btn-add-selected'));

        // Wait for select modal and click "Create New"
        await waitFor(() => {
            expect(screen.getByTestId('select-spellbook-dialog')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTestId('create-new-spellbook-button'));

        // Submit create modal
        fireEvent.click(screen.getByTestId('submit-modal'));

        await waitFor(() => {
            expect(createSpellbook).toHaveBeenCalled();
            expect(addSpellsToSpellbook).toHaveBeenCalledWith('sb-new', ['spell-1']);
            expect(refreshSpellbooks).toHaveBeenCalled();
            expect(showToast).toHaveBeenCalledWith(expect.stringContaining('created with 1 spell'));
        });
    });

    it('handles failure when creating new spellbook', async () => {
        const { createSpellbook } = mockUseSpellbooks();
        createSpellbook.mockRejectedValue(new Error('Creation failed'));

        render(<App />);

        // Select spell
        fireEvent.click(screen.getByTestId('select-spell'));
        fireEvent.click(screen.getByTestId('btn-add-selected'));

        // Wait for select modal and click "Create New"
        await waitFor(() => {
            expect(screen.getByTestId('select-spellbook-dialog')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTestId('create-new-spellbook-button'));

        // Submit create modal
        fireEvent.click(screen.getByTestId('submit-modal'));

        // Should show error in modal (which means it doesn't close)
        // Since we mock CreateSpellbookModal to just render a div, we can't easily check for internal state
        // But we can check that createSpellbook was called and rejected
        await waitFor(() => {
            expect(createSpellbook).toHaveBeenCalled();
        });
        // In a real integration test, we'd check for the error message in the modal
    });



});
