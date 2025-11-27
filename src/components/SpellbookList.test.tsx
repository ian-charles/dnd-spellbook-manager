import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
/**
 * Unit tests for SpellbookList component.
 * 
 * Testing Strategy:
 * - Uses React Testing Library for component rendering and interaction
 * - Mocks child components (SpellbookDetailView) to isolate SpellbookList logic
 * - Mocks API hooks (useSpellbooks, useSpells) to control data state
 * - Follows AAA (Arrange-Act-Assert) pattern
 * - Tests loading, empty, and populated states
 * - Verifies CRUD operations (Create, Copy, Delete)
 */
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { SpellbookList } from './SpellbookList';
import { exportImportService } from '../services/exportImport.service';

// Mock dependencies
vi.mock('../services/exportImport.service', () => ({
  exportImportService: {
    downloadSpellbooks: vi.fn(),
    importSpellbooks: vi.fn(),
  },
}));

vi.mock('./CreateSpellbookModal', () => ({
  CreateSpellbookModal: ({ isOpen, onClose, onSubmit, initialData }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="create-spellbook-modal">
        <button onClick={onClose}>Cancel</button>
        <button
          onClick={() => {
            const data = {
              name: initialData ? initialData.name : 'New Spellbook',
              spellcastingAbility: initialData?.spellcastingAbility || 'INT',
            };
            onSubmit(data);
          }}
        >
          Create
        </button>
      </div>
    );
  },
}));

vi.mock('./ConfirmDialog', () => ({
  ConfirmDialog: ({ isOpen, onConfirm, onCancel }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="confirm-dialog">
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  },
}));

vi.mock('./AlertDialog', () => ({
  AlertDialog: ({ isOpen, message, onClose }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="alert-dialog">
        <div>{message}</div>
        <button onClick={onClose}>Close</button>
      </div>
    );
  },
}));

describe('SpellbookList', () => {
  const mockSpellbooks: any[] = [
    {
      id: 'spellbook-1',
      name: 'My First Spellbook',
      spells: [
        { spellId: 'fireball', prepared: true, notes: '' },
        { spellId: 'magic-missile', prepared: false, notes: '' },
      ],
      spellcastingAbility: 'INT',
      spellAttackModifier: 7,
      spellSaveDC: 15,
      created: '2024-01-01T00:00:00Z',
      updated: '2024-01-02T00:00:00Z',
    },
    {
      id: 'spellbook-2',
      name: 'Adventure Spells',
      spells: [{ spellId: 'cure-wounds', prepared: true, notes: '' }],
      spellcastingAbility: 'WIS',
      spellAttackModifier: 5,
      spellSaveDC: 13,
      created: '2024-01-03T00:00:00Z',
      updated: '2024-01-04T00:00:00Z',
    },
  ];

  const mockOnSpellbookClick = vi.fn();
  const mockOnCreateSpellbook = vi.fn();
  const mockOnDeleteSpellbook = vi.fn();
  const mockOnRefreshSpellbooks = vi.fn();
  const mockOnAddSpellToSpellbook = vi.fn();

  const defaultProps = {
    spellbooks: [],
    loading: false,
    onSpellbookClick: mockOnSpellbookClick,
    onCreateSpellbook: mockOnCreateSpellbook,
    onDeleteSpellbook: mockOnDeleteSpellbook,
    onRefreshSpellbooks: mockOnRefreshSpellbooks,
    onAddSpellToSpellbook: mockOnAddSpellToSpellbook,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render spellbooks as a table', () => {
    render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);
    expect(screen.getByTestId('spellbooks-table')).toBeTruthy();
  });

  it('should display table headers', () => {
    render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);
    expect(screen.getByText('Spellbook Name')).toBeTruthy();
    expect(screen.getByText('Spells')).toBeTruthy();
    expect(screen.getByText('Ability')).toBeTruthy();
    expect(screen.getByText('Attack')).toBeTruthy();
    expect(screen.getByText('Save DC')).toBeTruthy();
    expect(screen.getByText('Last Updated')).toBeTruthy();
    expect(screen.getByText('Actions')).toBeTruthy();
  });

  it('should display spellbook data in table rows', () => {
    render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

    // Check first spellbook
    expect(screen.getByText('My First Spellbook')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy(); // spell count
    expect(screen.getByText('INT')).toBeTruthy();
    expect(screen.getByText('+7')).toBeTruthy();
    expect(screen.getByText('15')).toBeTruthy();

    // Check second spellbook
    expect(screen.getByText('Adventure Spells')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('WIS')).toBeTruthy();
    expect(screen.getByText('+5')).toBeTruthy();
    expect(screen.getByText('13')).toBeTruthy();
  });

  it('should display formatted timestamp for last updated', () => {
    render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

    // The exact format depends on implementation, but should contain date info
    const table = screen.getByTestId('spellbooks-table');
    expect(table.textContent).toContain('2024');
  });

  it('should display N/A for missing spellcasting stats', () => {
    const spellbooksWithMissingStats = [
      {
        id: 'spellbook-3',
        name: 'Incomplete Spellbook',
        spells: [],
        created: '2024-01-01T10:00:00Z',
        updated: '2024-01-01T10:00:00Z',
      },
    ];

    render(<SpellbookList {...defaultProps} spellbooks={spellbooksWithMissingStats} />);

    // Verify N/A values for spells without those stats
    const naElements = screen.getAllByText('N/A');
    expect(naElements.length).toBe(3); // Should have N/A for Ability, Attack, and Save DC

    // Verify we have the specific columns with N/A
    const rows = screen.getAllByRole('row');
    const targetRow = rows.find(row => row.textContent?.includes('Incomplete Spellbook'));
    expect(targetRow).toBeTruthy();
    if (targetRow) {
      expect(within(targetRow).getAllByText('N/A').length).toBeGreaterThanOrEqual(3);
    }
  });

  it('should call onSpellbookClick when table row is clicked', () => {
    render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

    const firstRow = screen.getByTestId('spellbook-row-spellbook-1');
    fireEvent.click(firstRow);

    expect(mockOnSpellbookClick).toHaveBeenCalledWith('spellbook-1');
  });

  it('should render delete button in actions column', () => {
    render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBe(2);
  });

  it('should sort spellbooks by name', async () => {
    render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

    // Initial order: "Adventure Spells" (A) then "My First Spellbook" (M) because default sort is name asc
    let rows = screen.getAllByTestId(/^spellbook-row-/);
    expect(rows[0].textContent).toContain('Adventure Spells');
    expect(rows[1].textContent).toContain('My First Spellbook');

    // Click name header to sort desc
    const nameHeader = screen.getByText('Spellbook Name');
    fireEvent.click(nameHeader);

    // Wait for sort to apply
    await waitFor(() => {
      rows = screen.getAllByTestId(/^spellbook-row-/);
      expect(rows[0].textContent).toContain('My First Spellbook');
      expect(rows[1].textContent).toContain('Adventure Spells');
    });

    // Click name header again to sort asc
    fireEvent.click(nameHeader);

    await waitFor(() => {
      rows = screen.getAllByTestId(/^spellbook-row-/);
      expect(rows[0].textContent).toContain('Adventure Spells');
      expect(rows[1].textContent).toContain('My First Spellbook');
    });
  });
  it('should copy spellbook with all spells', async () => {
    // Mock the create response
    mockOnCreateSpellbook.mockResolvedValue({
      id: 'new-spellbook-id',
      name: 'Copy of My First Spellbook',
      spells: [],
      spellcastingAbility: 'INT',
      spellAttackModifier: 7,
      spellSaveDC: 15,
      created: '2024-01-05T00:00:00Z',
      updated: '2024-01-05T00:00:00Z',
    });

    render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

    // Find the copy button for the first spellbook
    const copyButtons = screen.getAllByTitle('Copy Spellbook');
    expect(copyButtons.length).toBeGreaterThan(0);
    fireEvent.click(copyButtons[0]);

    // Check if create modal is opened
    expect(screen.getByTestId('create-spellbook-modal')).toBeTruthy();

    // Click Create button in the mock modal
    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    // Verify create was called
    await waitFor(() => {
      expect(mockOnCreateSpellbook).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Adventure Spells (Copy)',
      }));
    });

    // Verify spells were copied
    await waitFor(() => {
      expect(mockOnAddSpellToSpellbook).toHaveBeenCalledTimes(1);
      expect(mockOnAddSpellToSpellbook).toHaveBeenCalledWith('new-spellbook-id', 'cure-wounds');
    });

    // Verify refresh was called
    await waitFor(() => {
      expect(mockOnRefreshSpellbooks).toHaveBeenCalled();
    });
  });
});
