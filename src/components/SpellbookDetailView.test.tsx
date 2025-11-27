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
import { SpellbookDetailView, EnrichedSpell } from './SpellbookDetailView';
import { Spellbook } from '../types/spellbook';
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
const defaultProps = {
  spellbook: mockSpellbook,
  enrichedSpells: mockEnrichedSpells,
  sortedSpells: mockEnrichedSpells,
  expandedSpellId: null,
  sortColumn: 'name' as const,
  sortDirection: 'asc' as const,
  confirmDialog: { isOpen: false, spellId: '', spellName: '' },
  editModalOpen: false,
  showPreparedOnly: false,
  onBack: vi.fn(),
  onSort: vi.fn(),
  onTogglePrepared: vi.fn(),
  onRemoveSpell: vi.fn(),
  onConfirmRemove: vi.fn(),
  onCancelRemove: vi.fn(),
  onRowClick: vi.fn(),
  onEdit: vi.fn(),
  onEditClose: vi.fn(),
  onEditSave: vi.fn(),
  onToggleShowPreparedOnly: vi.fn(),
  onSelectAllPrepared: vi.fn(),
  existingNames: [],
};

describe('SpellbookDetailView', () => {
  describe('Loading State', () => {
    it('should render loading state when spellbook is null', () => {
      render(<SpellbookDetailView {...defaultProps} spellbook={null} />);

      expect(screen.getByText('Loading spellbook...')).toBeTruthy();
    });

    it('should not render spellbook content when loading', () => {
      render(<SpellbookDetailView {...defaultProps} spellbook={null} />);

      expect(screen.queryByTestId('spellbook-detail-name')).toBeNull();
      expect(screen.queryByTestId('spellbook-spell-list')).toBeNull();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when spellbook has no spells', () => {
      render(
        <SpellbookDetailView
          {...defaultProps}
          enrichedSpells={[]}
          sortedSpells={[]}
        />
      );

      expect(screen.getByText('This spellbook is empty.')).toBeTruthy();
      expect(screen.getByText('Go to the Browse tab to add spells!')).toBeTruthy();
    });

    it('should not render spell table when empty', () => {
      render(
        <SpellbookDetailView
          {...defaultProps}
          enrichedSpells={[]}
          sortedSpells={[]}
        />
      );

      expect(screen.queryByTestId('spellbook-spell-list')).toBeNull();
    });

    it('should show spellbook name in empty state', () => {
      render(
        <SpellbookDetailView
          {...defaultProps}
          enrichedSpells={[]}
          sortedSpells={[]}
        />
      );

      expect(screen.getByTestId('spellbook-detail-name').textContent).toContain('My Spellbook');
    });
  });

  describe('Header Rendering', () => {
    it('should render spellbook name', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      expect(screen.getByTestId('spellbook-detail-name').textContent).toContain('My Spellbook');
    });

    it('should render back button', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      expect(screen.getByText('← Back to Spellbooks')).toBeTruthy();
    });

    it('should call onBack when back button clicked', async () => {
      const user = userEvent.setup();
      const onBack = vi.fn();

      render(<SpellbookDetailView {...defaultProps} onBack={onBack} />);

      const backButton = screen.getByText('← Back to Spellbooks');
      await user.click(backButton);

      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('should display spell count (plural)', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      expect(screen.getByText(/3 spells/)).toBeTruthy();
    });

    it('should display spell count (singular)', () => {
      render(
        <SpellbookDetailView
          {...defaultProps}
          enrichedSpells={[mockEnrichedSpells[0]]}
          sortedSpells={[mockEnrichedSpells[0]]}
        />
      );

      expect(screen.getByText(/1 spell(?!s)/)).toBeTruthy();
    });

    it('should display prepared count', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      expect(screen.getByText(/2 prepared/)).toBeTruthy();
    });
  });

  describe('Spell Table Rendering', () => {
    it('should render spell table when spells exist', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      expect(screen.getByTestId('spellbook-spell-list')).toBeTruthy();
    });

    it('should render all spells in sorted order', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      expect(screen.getByTestId('spellbook-spell-spell-1')).toBeTruthy();
      expect(screen.getByTestId('spellbook-spell-spell-2')).toBeTruthy();
      expect(screen.getByTestId('spellbook-spell-spell-3')).toBeTruthy();
    });

    it('should render spell names', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      expect(screen.getByText('Fireball')).toBeTruthy();
      expect(screen.getByText('Shield')).toBeTruthy();
      expect(screen.getByText('Detect Magic')).toBeTruthy();
    });

    it('should render spell levels', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      expect(screen.getByText('3')).toBeTruthy(); // Fireball
      expect(screen.getAllByText('1').length).toBe(2); // Shield and Detect Magic
    });

    it('should render spell schools', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      expect(screen.getByText('Evocation')).toBeTruthy();
      expect(screen.getByText('Abjuration')).toBeTruthy();
      expect(screen.getByText('Divination')).toBeTruthy();
    });

    it('should render concentration badge when applicable', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      // Detect Magic has concentration
      const detectMagicRow = screen.getByTestId('spellbook-spell-spell-3');
      expect(detectMagicRow.innerHTML).toContain('badge-concentration');
    });

    it('should render ritual badge when applicable', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      // Detect Magic is a ritual
      const detectMagicRow = screen.getByTestId('spellbook-spell-spell-3');
      expect(detectMagicRow.innerHTML).toContain('badge-ritual');
    });
  });

  describe('Prepared Checkbox', () => {
    it('should render checkboxes for all spells', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      const checkboxes = screen.getAllByTestId('toggle-prepared');
      expect(checkboxes.length).toBe(3);
    });

    it('should check prepared spells', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      const checkboxes = screen.getAllByTestId('toggle-prepared') as HTMLInputElement[];
      expect(checkboxes[0].checked).toBe(true); // Fireball prepared
      expect(checkboxes[1].checked).toBe(false); // Shield not prepared
      expect(checkboxes[2].checked).toBe(true); // Detect Magic prepared
    });

    it('should call onTogglePrepared when checkbox clicked', async () => {
      const user = userEvent.setup();
      const onTogglePrepared = vi.fn();

      render(
        <SpellbookDetailView
          {...defaultProps}
          onTogglePrepared={onTogglePrepared}
        />
      );

      const checkboxes = screen.getAllByTestId('toggle-prepared');
      await user.click(checkboxes[0]);

      expect(onTogglePrepared).toHaveBeenCalledWith('spell-1');
    });
  });

  describe('Row Expansion', () => {
    it('should not show expanded details by default', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      expect(screen.queryByText(/A bright streak flashes/)).toBeNull();
    });

    it('should apply expanded class when spell is expanded', () => {
      render(
        <SpellbookDetailView
          {...defaultProps}
          expandedSpellId="spell-1"
        />
      );

      const row = screen.getByTestId('spellbook-spell-spell-1');
      expect(row.className).toContain('expanded');
    });

    it('should show spell description when expanded', () => {
      render(
        <SpellbookDetailView
          {...defaultProps}
          expandedSpellId="spell-1"
        />
      );

      expect(screen.getByText(/A bright streak flashes/)).toBeTruthy();
    });

    it('should call onRowClick when row is clicked', async () => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();

      render(
        <SpellbookDetailView
          {...defaultProps}
          onRowClick={onRowClick}
        />
      );

      const row = screen.getByTestId('spellbook-spell-spell-1');
      await user.click(row);

      expect(onRowClick).toHaveBeenCalledWith('spell-1');
    });

    it('should show higher levels text when expanded and available', () => {
      const spellWithHigherLevels: Spell = {
        ...mockSpell1,
        higherLevels: 'When you cast this spell using a spell slot of 4th level or higher...',
      };

      render(
        <SpellbookDetailView
          {...defaultProps}
          enrichedSpells={[{ spell: spellWithHigherLevels, prepared: true, notes: '' }]}
          sortedSpells={[{ spell: spellWithHigherLevels, prepared: true, notes: '' }]}
          expandedSpellId="spell-1"
        />
      );

      expect(screen.getByText('At Higher Levels:')).toBeTruthy();
      expect(screen.getByText(/When you cast this spell/)).toBeTruthy();
    });
  });

  describe('Remove Button', () => {
    it('should render remove button for each spell', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      expect(screen.getByTestId('btn-remove-spell-spell-1')).toBeTruthy();
      expect(screen.getByTestId('btn-remove-spell-spell-2')).toBeTruthy();
      expect(screen.getByTestId('btn-remove-spell-spell-3')).toBeTruthy();
    });

    it('should call onRemoveSpell when button clicked', async () => {
      const user = userEvent.setup();
      const onRemoveSpell = vi.fn();

      render(
        <SpellbookDetailView
          {...defaultProps}
          onRemoveSpell={onRemoveSpell}
        />
      );

      const removeButton = screen.getByTestId('btn-remove-spell-spell-1');
      await user.click(removeButton);

      expect(onRemoveSpell).toHaveBeenCalledWith('spell-1', 'Fireball');
    });
  });

  describe('Sorting', () => {
    it('should call onSort when name column clicked', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();

      render(<SpellbookDetailView {...defaultProps} onSort={onSort} />);

      const nameHeader = screen.getByText('Spell Name');
      await user.click(nameHeader);

      expect(onSort).toHaveBeenCalledWith('name');
    });

    it('should call onSort when level column clicked', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();

      render(<SpellbookDetailView {...defaultProps} onSort={onSort} />);

      const levelHeader = screen.getByText('Level');
      await user.click(levelHeader);

      expect(onSort).toHaveBeenCalledWith('level');
    });

    it('should call onSort when school column clicked', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();

      render(<SpellbookDetailView {...defaultProps} onSort={onSort} />);

      const schoolHeader = screen.getByText('School');
      await user.click(schoolHeader);

      expect(onSort).toHaveBeenCalledWith('school');
    });

    it('should render sort icons', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      // SortIcon components are rendered for sortable columns
      expect(screen.getByText('Spell Name').parentElement?.querySelector('.th-content')).toBeTruthy();
    });
  });

  describe('ConfirmDialog', () => {
    it('should not render dialog when not open', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      expect(screen.queryByText('Remove Spell')).toBeNull();
    });

    it('should render dialog when open', () => {
      render(
        <SpellbookDetailView
          {...defaultProps}
          confirmDialog={{ isOpen: true, spellId: 'spell-1', spellName: 'Fireball' }}
        />
      );

      expect(screen.getByText('Remove Spell')).toBeTruthy();
      expect(screen.getByText('Remove "Fireball" from this spellbook?')).toBeTruthy();
    });

    it('should call onConfirmRemove when confirm clicked', async () => {
      const user = userEvent.setup();
      const onConfirmRemove = vi.fn();

      render(
        <SpellbookDetailView
          {...defaultProps}
          confirmDialog={{ isOpen: true, spellId: 'spell-1', spellName: 'Fireball' }}
          onConfirmRemove={onConfirmRemove}
        />
      );

      const confirmButton = screen.getByTestId('confirm-dialog-confirm');
      await user.click(confirmButton);

      expect(onConfirmRemove).toHaveBeenCalledTimes(1);
    });

    it('should call onCancelRemove when cancel clicked', async () => {
      const user = userEvent.setup();
      const onCancelRemove = vi.fn();

      render(
        <SpellbookDetailView
          {...defaultProps}
          confirmDialog={{ isOpen: true, spellId: 'spell-1', spellName: 'Fireball' }}
          onCancelRemove={onCancelRemove}
        />
      );

      const cancelButton = screen.getByTestId('confirm-dialog-cancel');
      await user.click(cancelButton);

      expect(onCancelRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('CSS Classes', () => {
    it('should apply prepared-row class to prepared spells', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      const fireballRow = screen.getByTestId('spellbook-spell-spell-1');
      expect(fireballRow.className).toContain('prepared-row');
    });

    it('should not apply prepared-row class to unprepared spells', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      const shieldRow = screen.getByTestId('spellbook-spell-spell-2');
      expect(shieldRow.className).not.toContain('prepared-row');
    });
  });

  describe('Accessibility', () => {
    it('should have testid on main container', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      expect(screen.getByTestId('spellbook-detail')).toBeTruthy();
    });

    it('should have aria-label on prepared checkboxes', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      const checkbox = screen.getAllByTestId('toggle-prepared')[0];
      expect(checkbox.getAttribute('aria-label')).toBe('Toggle Fireball prepared status');
    });

    it('should have aria-label on remove buttons', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      const removeButton = screen.getByTestId('btn-remove-spell-spell-1');
      expect(removeButton.getAttribute('aria-label')).toBe('Remove Fireball');
    });
  });

  describe('Spellbook Attributes', () => {
    it('should display spellcasting ability', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      expect(screen.getByText(/INT/)).toBeTruthy();
    });

    it('should display spell attack modifier', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      expect(screen.getByText(/\+7/)).toBeTruthy();
    });

    it('should display spell save DC', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      const label = screen.getByText('Save DC');
      expect(label.nextElementSibling?.textContent).toBe('15');
    });

    it('should display last updated timestamp', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      expect(screen.getByText(/1\/15\/2025/)).toBeTruthy();
    });

    it('should display N/A when spellcasting ability is not set', () => {
      const spellbookWithoutAbility = { ...mockSpellbook, spellcastingAbility: undefined };
      render(<SpellbookDetailView {...defaultProps} spellbook={spellbookWithoutAbility} />);

      const label = screen.getByText('Ability');
      expect(label.parentElement?.textContent).toContain('N/A');
    });

    it('should display N/A when spell attack modifier is not set', () => {
      const spellbookWithoutModifier = { ...mockSpellbook, spellAttackModifier: undefined };
      render(<SpellbookDetailView {...defaultProps} spellbook={spellbookWithoutModifier} />);

      const label = screen.getByText('Attack');
      expect(label.parentElement?.textContent).toContain('N/A');
    });

    it('should display N/A when spell save DC is not set', () => {
      const spellbookWithoutDC = { ...mockSpellbook, spellSaveDC: undefined };
      render(<SpellbookDetailView {...defaultProps} spellbook={spellbookWithoutDC} />);

      const label = screen.getByText('Save DC');
      expect(label.parentElement?.textContent).toContain('N/A');
    });
  });

  describe('Edit Button', () => {
    it('should render edit button', () => {
      render(<SpellbookDetailView {...defaultProps} />);

      expect(screen.getByTestId('btn-edit-spellbook')).toBeTruthy();
    });

    it('should call onEdit when edit button clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();

      render(<SpellbookDetailView {...defaultProps} onEdit={onEdit} />);

      const editButton = screen.getByTestId('btn-edit-spellbook');
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('should render edit modal when editModalOpen is true', () => {
      render(<SpellbookDetailView {...defaultProps} editModalOpen={true} />);

      expect(screen.getByText('Edit Spellbook')).toBeTruthy();
    });

    it('should call onEditClose when modal close button clicked', async () => {
      const user = userEvent.setup();
      const onEditClose = vi.fn();

      render(<SpellbookDetailView {...defaultProps} editModalOpen={true} onEditClose={onEditClose} />);

      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      expect(onEditClose).toHaveBeenCalledTimes(1);
    });

    it('should call onEditSave with updated data when save button clicked', async () => {
      const user = userEvent.setup();
      const onEditSave = vi.fn();

      render(<SpellbookDetailView {...defaultProps} editModalOpen={true} onEditSave={onEditSave} />);

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
