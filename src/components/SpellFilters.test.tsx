import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpellFilters } from './SpellFilters';
import { FilterState } from '../hooks/useFilterReducer';

const defaultState: FilterState = {
    searchText: '',
    levelRange: { min: 0, max: 9 },
    selectedSchools: [],
    selectedClasses: [],
    concentrationOnly: false,
    ritualOnly: false,
    verbalOnly: false,
    somaticOnly: false,
    materialOnly: false,
};

describe('SpellFilters', () => {
    const mockSetSearchText = vi.fn();
    const mockSetLevelRange = vi.fn();
    const mockToggleSchool = vi.fn();
    const mockToggleClass = vi.fn();
    const mockToggleConcentration = vi.fn();
    const mockToggleRitual = vi.fn();
    const mockToggleVerbal = vi.fn();
    const mockToggleSomatic = vi.fn();
    const mockToggleMaterial = vi.fn();
    const mockClearFilters = vi.fn();

    const schools = ['Evocation', 'Necromancy', 'Divination'];
    const classes = ['Wizard', 'Sorcerer', 'Cleric'];

    const defaultProps = {
        state: defaultState,
        setSearchText: mockSetSearchText,
        setLevelRange: mockSetLevelRange,
        toggleSchool: mockToggleSchool,
        toggleClass: mockToggleClass,
        toggleConcentration: mockToggleConcentration,
        toggleRitual: mockToggleRitual,
        toggleVerbal: mockToggleVerbal,
        toggleSomatic: mockToggleSomatic,
        toggleMaterial: mockToggleMaterial,
        clearFilters: mockClearFilters,
        schools,
        classes,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all filter sections', () => {
        render(<SpellFilters {...defaultProps} />);

        expect(screen.getByText('Class')).toBeInTheDocument();
        expect(screen.getByText('Spell Level')).toBeInTheDocument();
        expect(screen.getByText('School')).toBeInTheDocument();
        expect(screen.getByText('Components')).toBeInTheDocument();
        expect(screen.getByText('Properties')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search spells...')).toBeInTheDocument();
    });

    it('renders class buttons correctly', () => {
        render(<SpellFilters {...defaultProps} />);

        classes.forEach((className) => {
            expect(screen.getByRole('button', { name: `Filter by class ${className}` })).toBeInTheDocument();
        });
    });

    it('renders school buttons correctly', () => {
        render(<SpellFilters {...defaultProps} />);

        schools.forEach((school) => {
            expect(screen.getByRole('button', { name: `Filter by school ${school}` })).toBeInTheDocument();
        });
    });

    it('updates search text on input change', () => {
        vi.useFakeTimers();
        render(<SpellFilters {...defaultProps} />);

        const searchInput = screen.getByPlaceholderText('Search spells...');
        fireEvent.change(searchInput, { target: { value: 'fireball' } });

        // Should not be called immediately
        expect(mockSetSearchText).not.toHaveBeenCalled();

        // Fast-forward time
        vi.advanceTimersByTime(300);

        expect(mockSetSearchText).toHaveBeenCalledWith('fireball');
        vi.useRealTimers();
    });

    it('toggles class filters on click', () => {
        render(<SpellFilters {...defaultProps} />);

        const wizardButton = screen.getByRole('button', { name: 'Filter by class Wizard' });
        fireEvent.click(wizardButton);

        expect(mockToggleClass).toHaveBeenCalledWith('Wizard');
    });

    it('toggles school filters on click', () => {
        render(<SpellFilters {...defaultProps} />);

        const evocationButton = screen.getByRole('button', { name: 'Filter by school Evocation' });
        fireEvent.click(evocationButton);

        expect(mockToggleSchool).toHaveBeenCalledWith('Evocation');
    });

    it('updates level range on selection change', () => {
        render(<SpellFilters {...defaultProps} />);

        const minSelect = screen.getByLabelText('Minimum spell level');
        fireEvent.change(minSelect, { target: { value: '2' } });

        expect(mockSetLevelRange).toHaveBeenCalledWith({ min: 2, max: 9 });

        const maxSelect = screen.getByLabelText('Maximum spell level');
        fireEvent.change(maxSelect, { target: { value: '5' } });

        expect(mockSetLevelRange).toHaveBeenCalledWith({ min: 0, max: 5 });
    });

    it('toggles component checkboxes', () => {
        render(<SpellFilters {...defaultProps} />);

        const verbalCheckbox = screen.getByLabelText('Filter by Verbal component');
        fireEvent.click(verbalCheckbox);
        expect(mockToggleVerbal).toHaveBeenCalled();

        const somaticCheckbox = screen.getByLabelText('Filter by Somatic component');
        fireEvent.click(somaticCheckbox);
        expect(mockToggleSomatic).toHaveBeenCalled();

        const materialCheckbox = screen.getByLabelText('Filter by Material component');
        fireEvent.click(materialCheckbox);
        expect(mockToggleMaterial).toHaveBeenCalled();
    });

    it('toggles property checkboxes', () => {
        render(<SpellFilters {...defaultProps} />);

        const concentrationCheckbox = screen.getByLabelText('Filter by Concentration');
        fireEvent.click(concentrationCheckbox);
        expect(mockToggleConcentration).toHaveBeenCalled();

        const ritualCheckbox = screen.getByLabelText('Filter by Ritual');
        fireEvent.click(ritualCheckbox);
        expect(mockToggleRitual).toHaveBeenCalled();
    });

    it('shows "Clear All Filters" button when filters are active', () => {
        const activeState = { ...defaultState, searchText: 'fire' };
        render(<SpellFilters {...defaultProps} state={activeState} />);

        expect(screen.getByRole('button', { name: 'Clear all active filters' })).toBeInTheDocument();
    });

    it('clears all filters when "Clear All Filters" is clicked', () => {
        const activeState = { ...defaultState, searchText: 'fire' };
        render(<SpellFilters {...defaultProps} state={activeState} />);

        const clearButton = screen.getByRole('button', { name: 'Clear all active filters' });
        fireEvent.click(clearButton);

        expect(mockClearFilters).toHaveBeenCalled();
    });
});
