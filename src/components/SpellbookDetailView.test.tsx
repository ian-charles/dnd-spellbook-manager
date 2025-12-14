/**
 * SpellbookDetailView Component Tests
 *
 * Tests for the presentational component that renders spellbook details.
 * Focuses on rendering logic and prop-based behavior without data fetching.
 *
 * Testing Strategy:
 * - AAA Pattern (Arrange-Act-Assert) used for all tests
 * - Uses @testing-library/react for rendering and user interactions
 * - Mocks all callback props to verify interactions
 * - Tests loading, empty, and populated states
 * - Verifies accessibility attributes
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpellbookDetailContext } from '../contexts/SpellbookDetailContext';
import { SpellbookDetailContextType } from '../types/spellbookDetail';

import { SpellbookDetailView } from './SpellbookDetailView';
import { Spellbook, EnrichedSpell } from '../types/spellbook';
import { Spell } from '../types/spell';

// Mock spell data
const mockSpell1: Spell = {
  id: 'spell-1',
  name: 'Fireball',
  level: 3,
  school: 'Evocation',
  castingTime: '1 action',
  range: '150 feet',
  components: { verbal: true, somatic: true, material: true },
  materials: 'a tiny ball of bat guano and sulfur',
  duration: 'Instantaneous',
  description: 'A bright streak flashes from your pointing finger...',
  classes: ['Wizard', 'Sorcerer'],
  source: 'PHB',
  concentration: false,
  ritual: false,
  higherLevels: 'Damage increases by 1d6 for each slot level above 3rd.',
};

const mockSpell2: Spell = {
  id: 'spell-2',
  name: 'Shield',
  level: 1,
  school: 'Abjuration',
  castingTime: '1 reaction',
  range: 'Self',
  components: { verbal: true, somatic: true, material: false },
  materials: '',
  duration: '1 round',
  description: 'An invisible barrier of magical force appears...',
  classes: ['Wizard', 'Sorcerer'],
  source: 'PHB',
  concentration: false,
  ritual: false,
  higherLevels: '',
};

const mockSpell3: Spell = {
  id: 'spell-3',
  name: 'Detect Magic',
  level: 1,
  school: 'Divination',
  castingTime: '1 action',
  range: '30 feet',
  components: { verbal: true, somatic: true, material: false },
  materials: '',
  duration: 'Concentration, up to 10 minutes',
  description: 'For the duration, you sense the presence of magic...',
  classes: ['Wizard', 'Cleric', 'Bard'],
  source: 'PHB',
  concentration: true,
  ritual: true,
  higherLevels: '',
};

const mockEnrichedSpells: EnrichedSpell[] = [
  { spell: mockSpell1, prepared: true, notes: '' },
  { spell: mockSpell2, prepared: false, notes: '' },
  { spell: mockSpell3, prepared: true, notes: 'Cast before dungeon' },
];

const mockSpellbook: Spellbook = {
  id: 'sb-1',
  name: 'My Spellbook',
  spells: [
    { spellId: 'spell-1', prepared: true, notes: '' },
    { spellId: 'spell-2', prepared: false, notes: '' },
    { spellId: 'spell-3', prepared: true, notes: '' },
  ],
  created: '2025-01-01T00:00:00.000Z',
  updated: '2025-01-15T12:00:00.000Z',
  spellcastingAbility: 'INT',
  spellAttackModifier: 7,
  spellSaveDC: 15,
};



// Default props for testing
const defaultProps: SpellbookDetailContextType = {
  spellbook: mockSpellbook,
  enrichedSpells: mockEnrichedSpells,
  sortedSpells: mockEnrichedSpells,
  expandedSpellId: null,
  sortColumn: 'name' as const,
  sortDirection: 'asc' as const,
  selectedSpellIds: new Set<string>(),
  confirmDialog: { isOpen: false, spellIds: [], message: '' },
  editModalOpen: false,
  showPreparedOnly: false,
  allPrepared: false,
  onBack: vi.fn(),
  onSort: vi.fn(),
  onToggleSelected: vi.fn(),
  onSelectAll: vi.fn(),
  onDeselectAll: vi.fn(),
  onPrepSelected: vi.fn(),
  onRemoveSelected: vi.fn(),
  onConfirmRemove: vi.fn(),
  onCancelRemove: vi.fn(),
  onRowClick: vi.fn(),
  onEdit: vi.fn(),
  onEditClose: vi.fn(),
  onEditSave: vi.fn(),
  onToggleShowPreparedOnly: vi.fn(),
  onCopy: vi.fn(),
  existingNames: [],
};

const renderWithContext = (props: Partial<SpellbookDetailContextType> = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(
    <SpellbookDetailContext.Provider value={mergedProps}>
      <SpellbookDetailView />
    </SpellbookDetailContext.Provider>
  );
};

describe('SpellbookDetailView', () => {
  describe('Loading State', () => {
    it('should render loading state when spellbook is null', () => {
      renderWithContext({ spellbook: null });

      expect(screen.getByText('Loading spellbook...')).toBeTruthy();
    });

    it('should not render spellbook content when loading', () => {
      renderWithContext({ spellbook: null });

      expect(screen.queryByTestId('spellbook-detail-name')).toBeNull();
      expect(screen.queryByTestId('spellbook-spell-list')).toBeNull();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when spellbook has no spells', () => {
      renderWithContext({
        enrichedSpells: [],
        sortedSpells: [],
      });

      expect(screen.getByText('This spellbook is empty.')).toBeTruthy();
      expect(screen.getByText('Go to the Browse tab to add spells!')).toBeTruthy();
    });

    it('should not render spell table when empty', () => {
      renderWithContext({
        enrichedSpells: [],
        sortedSpells: [],
      });

      expect(screen.queryByTestId('spellbook-spell-list')).toBeNull();
    });

    it('should show spellbook name in empty state', () => {
      renderWithContext({
        enrichedSpells: [],
        sortedSpells: [],
      });

      expect(screen.getByTestId('spellbook-detail-name').textContent).toContain('My Spellbook');
    });
  });

  describe('Header Rendering', () => {
    it('should render spellbook name', () => {
      renderWithContext();

      expect(screen.getByTestId('spellbook-detail-name').textContent).toContain('My Spellbook');
    });


    it('should display spell count (plural)', () => {
      renderWithContext();

      expect(screen.getByText(/3 spells/)).toBeTruthy();
    });

    it('should display spell count (singular)', () => {
      renderWithContext({
        enrichedSpells: [mockEnrichedSpells[0]],
        sortedSpells: [mockEnrichedSpells[0]],
      });

      expect(screen.getByText(/1 spell(?!s)/)).toBeTruthy();
    });

    it('should display prepared count', () => {
      renderWithContext();

      expect(screen.getByText(/2 prepared/)).toBeTruthy();
    });
  });

  describe('Spell Table Rendering', () => {
    it('should render spell table when spells exist', () => {
      renderWithContext();

      expect(screen.getByTestId('spellbook-spell-list')).toBeTruthy();
    });

    it('should render all spells in sorted order', () => {
      renderWithContext();

      expect(screen.getByTestId('spellbook-spell-spell-1')).toBeTruthy();
      expect(screen.getByTestId('spellbook-spell-spell-2')).toBeTruthy();
      expect(screen.getByTestId('spellbook-spell-spell-3')).toBeTruthy();
    });

    it('should render spell names', () => {
      renderWithContext();

      expect(screen.getByText('Fireball')).toBeTruthy();
      expect(screen.getByText('Shield')).toBeTruthy();
      expect(screen.getByText('Detect Magic')).toBeTruthy();
    });

    it('should render spell levels', () => {
      renderWithContext();

      // Each spell level appears twice: once in mobile badge, once in desktop column
      expect(screen.getAllByText('3').length).toBe(2); // Fireball (mobile + desktop)
      expect(screen.getAllByText('1').length).toBe(4); // Shield and Detect Magic (mobile + desktop each)
    });

    it('should render spell schools', () => {
      renderWithContext();

      expect(screen.getByText('Evocation')).toBeTruthy();
      expect(screen.getByText('Abjuration')).toBeTruthy();
      expect(screen.getByText('Divination')).toBeTruthy();
    });

    it('should render concentration badge when applicable', () => {
      renderWithContext();

      // Detect Magic has concentration
      const detectMagicRow = screen.getByTestId('spellbook-spell-spell-3');
      expect(detectMagicRow.innerHTML).toContain('badge-concentration');
    });

    it('should render ritual badge when applicable', () => {
      renderWithContext();

      // Detect Magic is a ritual
      const detectMagicRow = screen.getByTestId('spellbook-spell-spell-3');
      expect(detectMagicRow.innerHTML).toContain('badge-ritual');
    });
  });

  describe('Prepared Checkbox', () => {
    it('should render checkboxes for all spells', () => {
      renderWithContext();

      const checkboxes = screen.getAllByTestId('toggle-selected');
      expect(checkboxes.length).toBe(3);
    });

    it('should check selected spells', () => {
      renderWithContext({ selectedSpellIds: new Set(['spell-1']) });

      const checkboxes = screen.getAllByTestId('toggle-selected') as HTMLInputElement[];
      expect(checkboxes[0].checked).toBe(true); // spell-1 selected
      expect(checkboxes[1].checked).toBe(false); // spell-2 not selected
      expect(checkboxes[2].checked).toBe(false); // spell-3 not selected
    });

    it('should call onToggleSelected when checkbox clicked', async () => {
      const user = userEvent.setup();
      const onToggleSelected = vi.fn();

      renderWithContext({ onToggleSelected });

      const checkboxes = screen.getAllByTestId('toggle-selected');
      await user.click(checkboxes[0]);

      expect(onToggleSelected).toHaveBeenCalledWith('spell-1');
    });
  });

  describe('Modal Display', () => {
    it('should not show modal by default', () => {
      renderWithContext();

      expect(screen.queryByText(/A bright streak flashes/)).toBeNull();
    });

    it('should show modal when modalSpellId is set', () => {
      renderWithContext({ modalSpellId: 'spell-1' });

      expect(screen.getByText(/A bright streak flashes/)).toBeTruthy();
    });

    it('should call onRowClick when row is clicked', async () => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();

      renderWithContext({ onRowClick });

      const row = screen.getByTestId('spellbook-spell-spell-1');
      await user.click(row);

      expect(onRowClick).toHaveBeenCalledWith('spell-1');
    });

    it('should show higher levels text in modal when available', () => {
      const spellWithHigherLevels: Spell = {
        ...mockSpell1,
        higherLevels: 'When you cast this spell using a spell slot of 4th level or higher...',
      };

      renderWithContext({
        enrichedSpells: [{ spell: spellWithHigherLevels, prepared: true, notes: '' }],
        sortedSpells: [{ spell: spellWithHigherLevels, prepared: true, notes: '' }],
        modalSpellId: 'spell-1',
      });

      expect(screen.getByText('At Higher Levels:')).toBeTruthy();
      expect(screen.getByText(/When you cast this spell/)).toBeTruthy();
    });
  });

  describe('Bulk Actions', () => {
    it('should render Select All button', () => {
      renderWithContext();

      expect(screen.getByTestId('btn-select-all')).toBeTruthy();
    });

    it('should render Prep button', () => {
      renderWithContext();

      expect(screen.getByTestId('btn-prep-selected')).toBeTruthy();
    });

    it('should render Remove button', () => {
      renderWithContext();

      expect(screen.getByTestId('btn-remove-selected')).toBeTruthy();
    });

    it('should call onSelectAll when Select All button clicked', async () => {
      const user = userEvent.setup();
      const onSelectAll = vi.fn();

      renderWithContext({ onSelectAll });

      const selectAllButton = screen.getByTestId('btn-select-all');
      await user.click(selectAllButton);

      expect(onSelectAll).toHaveBeenCalled();
    });

    it('should call onRemoveSelected when Remove button clicked', async () => {
      const user = userEvent.setup();
      const onRemoveSelected = vi.fn();

      renderWithContext({ onRemoveSelected, selectedSpellIds: new Set(['spell-1']) });

      const removeButton = screen.getByTestId('btn-remove-selected');
      await user.click(removeButton);

      expect(onRemoveSelected).toHaveBeenCalled();
    });
  });

  describe('Sorting', () => {
    it('should call onSort when name column clicked', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();

      renderWithContext({ onSort });

      const nameHeader = screen.getByText('Spell Name');
      await user.click(nameHeader);

      expect(onSort).toHaveBeenCalledWith('name');
    });

    it('should call onSort when level column clicked', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();

      renderWithContext({ onSort });

      const levelHeader = screen.getByText('Level');
      await user.click(levelHeader);

      expect(onSort).toHaveBeenCalledWith('level');
    });

    it('should call onSort when school column clicked', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();

      renderWithContext({ onSort });

      const schoolHeader = screen.getByText('School');
      await user.click(schoolHeader);

      expect(onSort).toHaveBeenCalledWith('school');
    });

    it('should render sort icons', () => {
      renderWithContext();

      // SortIcon components are rendered for sortable columns
      expect(screen.getByText('Spell Name').parentElement?.querySelector('.th-content')).toBeTruthy();
    });
  });

  describe('ConfirmDialog', () => {
    it('should not render dialog when not open', () => {
      renderWithContext();

      expect(screen.queryByText('Remove Spell')).toBeNull();
    });

    it('should render dialog when open', () => {
      renderWithContext({
        confirmDialog: { isOpen: true, spellIds: ['spell-1'], message: 'Are you sure you want to remove Fireball?' },
      });

      expect(screen.getByText('Remove Spell')).toBeTruthy();
      expect(screen.getByText('Are you sure you want to remove Fireball?')).toBeTruthy();
    });

    it('should call onConfirmRemove when confirm clicked', async () => {
      const user = userEvent.setup();
      const onConfirmRemove = vi.fn();

      renderWithContext({
        confirmDialog: { isOpen: true, spellIds: ['spell-1'], message: 'Are you sure you want to remove Fireball?' },
        onConfirmRemove,
      });

      const confirmButton = screen.getByTestId('confirm-dialog-confirm');
      await user.click(confirmButton);

      expect(onConfirmRemove).toHaveBeenCalledTimes(1);
    });

    it('should call onCancelRemove when cancel clicked', async () => {
      const user = userEvent.setup();
      const onCancelRemove = vi.fn();

      renderWithContext({
        confirmDialog: { isOpen: true, spellIds: ['spell-1'], message: 'Are you sure you want to remove Fireball?' },
        onCancelRemove,
      });

      const cancelButton = screen.getByTestId('confirm-dialog-cancel');
      await user.click(cancelButton);

      expect(onCancelRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('CSS Classes', () => {
    it('should apply prepared-row class to prepared spells', () => {
      renderWithContext();

      const fireballRow = screen.getByTestId('spellbook-spell-spell-1');
      expect(fireballRow.className).toContain('prepared-row');
    });

    it('should not apply prepared-row class to unprepared spells', () => {
      renderWithContext();

      const shieldRow = screen.getByTestId('spellbook-spell-spell-2');
      expect(shieldRow.className).not.toContain('prepared-row');
    });
  });

  describe('Accessibility', () => {
    it('should have testid on main container', () => {
      renderWithContext();

      expect(screen.getByTestId('spellbook-detail')).toBeTruthy();
    });

    it('should have aria-label on selection checkboxes for spell names', () => {
      renderWithContext();

      const checkbox = screen.getAllByTestId('toggle-selected')[0];
      expect(checkbox.getAttribute('aria-label')).toContain('Select');
    });

    it('should have aria-label on selection checkboxes', () => {
      renderWithContext();

      const checkboxes = screen.getAllByRole('checkbox', { name: /Select/i });
      expect(checkboxes.length).toBeGreaterThan(0);
      expect(checkboxes[0].getAttribute('aria-label')).toContain('Select');
    });
  });

  describe('Spellbook Attributes', () => {
    it('should display spellcasting ability', () => {
      renderWithContext();

      expect(screen.getByText(/INT/)).toBeTruthy();
    });

    it('should display spell attack modifier', () => {
      renderWithContext();

      expect(screen.getByText(/\+7/)).toBeTruthy();
    });

    it('should display spell save DC', () => {
      renderWithContext();

      expect(screen.getByText('15')).toBeTruthy();
    });

    it('should display last updated timestamp', () => {
      renderWithContext();

      expect(screen.getByText(/1\/15\/2025/)).toBeTruthy();
    });

    it('should display N/A when spellcasting ability is not set', () => {
      const spellbookWithoutAbility = { ...mockSpellbook, spellcastingAbility: undefined };
      renderWithContext({ spellbook: spellbookWithoutAbility });

      const label = screen.getByText('Ability');
      expect(label.parentElement?.textContent).toContain('N/A');
    });

    it('should display N/A when spell attack modifier is not set', () => {
      const spellbookWithoutModifier = { ...mockSpellbook, spellAttackModifier: undefined };
      renderWithContext({ spellbook: spellbookWithoutModifier });

      const label = screen.getByText('Attack');
      expect(label.parentElement?.textContent).toContain('N/A');
    });

    it('should display N/A when spell save DC is not set', () => {
      const spellbookWithoutDC = { ...mockSpellbook, spellSaveDC: undefined };
      renderWithContext({ spellbook: spellbookWithoutDC });

      const label = screen.getByText('Save DC');
      expect(label.parentElement?.textContent).toContain('N/A');
    });
  });

  describe('Edit Button', () => {
    it('should render edit button', () => {
      renderWithContext();

      expect(screen.getByTestId('btn-edit-spellbook')).toBeTruthy();
    });

    it('should call onEdit when edit button clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();

      renderWithContext({ onEdit });

      const editButton = screen.getByTestId('btn-edit-spellbook');
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('should render edit modal when editModalOpen is true', () => {
      renderWithContext({ editModalOpen: true });

      expect(screen.getByText('Edit Spellbook')).toBeTruthy();
    });

    it('should call onEditClose when modal close button clicked', async () => {
      const user = userEvent.setup();
      const onEditClose = vi.fn();

      renderWithContext({ editModalOpen: true, onEditClose });

      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      expect(onEditClose).toHaveBeenCalledTimes(1);
    });

    it('should call onEditSave with updated data when save button clicked', async () => {
      const user = userEvent.setup();
      const onEditSave = vi.fn();

      renderWithContext({ editModalOpen: true, onEditSave });

      const nameInput = screen.getByTestId('spellbook-name-input') as HTMLInputElement;
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Spellbook');

      const saveButton = screen.getByTestId('create-button');
      await user.click(saveButton);

      expect(onEditSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Spellbook',
        })
      );
    });
  });
});
