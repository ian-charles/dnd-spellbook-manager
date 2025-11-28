import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpellFilters } from './SpellFilters';
import * as useFilterReducerModule from '../hooks/useFilterReducer';
import { SpellFilters as FilterState } from '../types/spell';

// Mock the useFilterReducer hook
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

vi.mock('../hooks/useFilterReducer', () => ({
    useFilterReducer: vi.fn(),
}));

describe('SpellFilters', () => {
    const mockOnFiltersChange = vi.fn();
    const schools = ['Evocation', 'Necromancy', 'Divination'];
    const classes = ['Wizard', 'Sorcerer', 'Cleric'];

    beforeEach(() => {
        vi.clearAllMocks();
        (useFilterReducerModule.useFilterReducer as any).mockReturnValue({
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
        });
    });

    it('renders all filter sections', () => {
        render(
            <SpellFilters
                onFiltersChange={mockOnFiltersChange}
                schools={schools}
                classes={classes}
            />
        );

        expect(screen.getByText('Class')).toBeInTheDocument();
        expect(screen.getByText('Spell Level')).toBeInTheDocument();
        expect(screen.getByText('School')).toBeInTheDocument();
        expect(screen.getByText('Components')).toBeInTheDocument();
        expect(screen.getByText('Properties')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search spells...')).toBeInTheDocument();
    });

    it('renders class buttons correctly', () => {
        render(
            <SpellFilters
                onFiltersChange={mockOnFiltersChange}
                schools={schools}
                classes={classes}
            />
        );

        classes.forEach((className) => {
            expect(screen.getByRole('button', { name: `Filter by class ${className}` })).toBeInTheDocument();
        });
    });

    it('renders school buttons correctly', () => {
        render(
            <SpellFilters
                onFiltersChange={mockOnFiltersChange}
                schools={schools}
                classes={classes}
            />
        );

        schools.forEach((school) => {
            expect(screen.getByRole('button', { name: `Filter by school ${school}` })).toBeInTheDocument();
        });
    });

    it('updates search text on input change', () => {
        render(
            <SpellFilters
                onFiltersChange={mockOnFiltersChange}
                schools={schools}
                classes={classes}
            />
        );

        const searchInput = screen.getByPlaceholderText('Search spells...');
        fireEvent.change(searchInput, { target: { value: 'fireball' } });

        expect(mockSetSearchText).toHaveBeenCalledWith('fireball');
    });

    it('toggles class filters on click', () => {
        render(
            <SpellFilters
                onFiltersChange={mockOnFiltersChange}
                schools={schools}
                classes={classes}
            />
        );

        const wizardButton = screen.getByRole('button', { name: 'Filter by class Wizard' });
        fireEvent.click(wizardButton);

        expect(mockToggleClass).toHaveBeenCalledWith('Wizard');
    });

    it('toggles school filters on click', () => {
        render(
            <SpellFilters
                onFiltersChange={mockOnFiltersChange}
                schools={schools}
                classes={classes}
            />
        );

        const evocationButton = screen.getByRole('button', { name: 'Filter by school Evocation' });
        fireEvent.click(evocationButton);

        expect(mockToggleSchool).toHaveBeenCalledWith('Evocation');
    });

    it('updates level range on selection change', () => {
        render(
            <SpellFilters
                onFiltersChange={mockOnFiltersChange}
                schools={schools}
                classes={classes}
            />
        );

        const minSelect = screen.getByLabelText('Minimum spell level');
        fireEvent.change(minSelect, { target: { value: '2' } });

        expect(mockSetLevelRange).toHaveBeenCalledWith({ min: 2, max: 9 });

        const maxSelect = screen.getByLabelText('Maximum spell level');
        fireEvent.change(maxSelect, { target: { value: '5' } });

        expect(mockSetLevelRange).toHaveBeenCalledWith({ min: 0, max: 5 });
    });

    it('toggles component checkboxes', () => {
        render(
            <SpellFilters
                onFiltersChange={mockOnFiltersChange}
                schools={schools}
                classes={classes}
            />
        );

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
        render(
            <SpellFilters
                onFiltersChange={mockOnFiltersChange}
                schools={schools}
                classes={classes}
            />
        );

        const concentrationCheckbox = screen.getByLabelText('Filter by Concentration');
        fireEvent.click(concentrationCheckbox);
        expect(mockToggleConcentration).toHaveBeenCalled();

        const ritualCheckbox = screen.getByLabelText('Filter by Ritual');
        fireEvent.click(ritualCheckbox);
        expect(mockToggleRitual).toHaveBeenCalled();
    });

    it('shows "Clear All Filters" button when filters are active', () => {
        (useFilterReducerModule.useFilterReducer as any).mockReturnValue({
            state: { ...defaultState, searchText: 'fire' },
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
        });

        render(
            <SpellFilters
                onFiltersChange={mockOnFiltersChange}
                schools={schools}
                classes={classes}
            />
        );

        expect(screen.getByRole('button', { name: 'Clear all active filters' })).toBeInTheDocument();
    });

    it('clears all filters when "Clear All Filters" is clicked', () => {
        (useFilterReducerModule.useFilterReducer as any).mockReturnValue({
            state: { ...defaultState, searchText: 'fire' },
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
        });

        render(
            <SpellFilters
                onFiltersChange={mockOnFiltersChange}
                schools={schools}
                classes={classes}
            />
        );

        const clearButton = screen.getByRole('button', { name: 'Clear all active filters' });
        fireEvent.click(clearButton);

        expect(mockClearFilters).toHaveBeenCalled();
    });

    it('calls onFiltersChange when state changes', () => {
        render(
            <SpellFilters
                onFiltersChange={mockOnFiltersChange}
                schools={schools}
                classes={classes}
            />
        );

        // Initial call
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
            searchText: '',
            levelRange: { min: 0, max: 9 },
            schools: undefined,
            classes: undefined,
            concentration: undefined,
            ritual: undefined,
            componentVerbal: undefined,
            componentSomatic: undefined,
            componentMaterial: undefined,
        });
    });
});
