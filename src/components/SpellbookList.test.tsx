/**
 * SpellbookList Component Tests
 *
 * Comprehensive unit tests for the spellbook list component covering:
 * - Loading states
 * - Empty state rendering
 * - Spellbook list rendering
 * - Create spellbook flow (success and error)
 * - Delete spellbook flow (confirmation and cancellation)
 * - Import functionality (success, errors, and failures)
 * - Export functionality (success and error)
 * - Dialog state management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SpellbookList } from './SpellbookList';
import { exportImportService } from '../services/exportImport.service';

// Mock the exportImportService
vi.mock('../services/exportImport.service', () => ({
  exportImportService: {
    downloadSpellbooks: vi.fn(),
    importSpellbooks: vi.fn(),
  },
}));

describe('SpellbookList', () => {
  const mockOnSpellbookClick = vi.fn();
  const mockCreateSpellbook = vi.fn();
  const mockDeleteSpellbook = vi.fn();
  const mockRefreshSpellbooks = vi.fn();
  const mockAddSpellToSpellbook = vi.fn();

  const defaultProps = {
    spellbooks: [],
    loading: false,
    onSpellbookClick: mockOnSpellbookClick,
    onCreateSpellbook: mockCreateSpellbook,
    onDeleteSpellbook: mockDeleteSpellbook,
    onRefreshSpellbooks: mockRefreshSpellbooks,
    onAddSpellToSpellbook: mockAddSpellToSpellbook,
  };

  const mockSpellbooks = [
    {
      id: 'spellbook-1',
      name: 'My First Spellbook',
      spells: [
        { spellId: 'spell-1', prepared: true, notes: '' },
        { spellId: 'spell-2', prepared: false, notes: '' },
      ],
      created: '2024-01-01T10:00:00Z',
      updated: '2024-01-15T14:30:00Z',
      spellcastingAbility: 'INT' as const,
      spellAttackModifier: 7,
      spellSaveDC: 15,
    },
    {
      id: 'spellbook-2',
      name: 'Adventure Spells',
      spells: [
        { spellId: 'spell-3', prepared: true, notes: '' },
      ],
      created: '2024-02-01T08:00:00Z',
      updated: '2024-02-10T12:00:00Z',
      spellcastingAbility: 'WIS' as const,
      spellAttackModifier: 5,
      spellSaveDC: 13,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should render loading spinner when loading is true', () => {
      render(<SpellbookList {...defaultProps} loading={true} />);

      expect(screen.getByTestId('spellbooks-header')).toHaveTextContent('My Spellbooks');
      expect(screen.getByText('Loading spellbooks...')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no spellbooks exist', () => {
      render(<SpellbookList {...defaultProps} />);

      expect(screen.getByTestId('spellbooks-empty')).toBeTruthy();
      expect(screen.getByText("You don't have any spellbooks yet.")).toBeTruthy();
      expect(screen.getByText('Click "New Spellbook" to create your first one!')).toBeTruthy();
    });

    it('should disable export button when no spellbooks exist', () => {
      render(<SpellbookList {...defaultProps} />);

      const exportButton = screen.getByTestId('btn-export-spellbooks');
      expect(exportButton).toBeDisabled();
    });
  });

  describe('Spellbook List Rendering', () => {
    it('should render list of spellbooks with correct data', () => {
      render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

      expect(screen.getByText('My First Spellbook')).toBeTruthy();
      expect(screen.getByText('Adventure Spells')).toBeTruthy();
      expect(screen.getAllByText('2')).toHaveLength(1); // 2 spells
      expect(screen.getAllByText('1')).toHaveLength(1); // 1 spell
    });



    it('should call onSpellbookClick when spellbook row is clicked', () => {
      render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

      const spellbookRow = screen.getByTestId('spellbook-row-spellbook-1');
      fireEvent.click(spellbookRow);

      expect(mockOnSpellbookClick).toHaveBeenCalledWith('spellbook-1');
      expect(mockOnSpellbookClick).toHaveBeenCalledTimes(1);
    });

    it('should enable export button when spellbooks exist', () => {
      render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

      const exportButton = screen.getByTestId('btn-export-spellbooks');
      expect(exportButton).not.toBeDisabled();
    });
  });

  describe('Create Spellbook Flow', () => {
    it('should open create dialog when New Spellbook button is clicked', () => {
      render(<SpellbookList {...defaultProps} />);

      const createButton = screen.getByTestId('btn-create-spellbook');
      fireEvent.click(createButton);

      expect(screen.getByText('Create New Spellbook')).toBeTruthy();
      expect(screen.getByTestId('spellbook-name-input')).toBeTruthy();
    });

    it('should close dialog when Cancel button is clicked', () => {
      render(<SpellbookList {...defaultProps} />);

      // Open dialog
      const createButton = screen.getByTestId('btn-create-spellbook');
      fireEvent.click(createButton);

      // Verify modal is open
      expect(screen.getByText('Create New Spellbook')).toBeTruthy();

      // Close dialog
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      // Verify modal is closed
      expect(screen.queryByText('Create New Spellbook')).toBeNull();
    });

    it('should create spellbook with valid name', async () => {
      mockCreateSpellbook.mockResolvedValue(undefined);

      render(<SpellbookList {...defaultProps} />);

      // Open dialog
      fireEvent.click(screen.getByTestId('btn-create-spellbook'));

      // Enter name
      const input = screen.getByTestId('spellbook-name-input');
      fireEvent.change(input, { target: { value: 'New Spellbook' } });

      // Submit
      const saveButton = screen.getByTestId('create-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockCreateSpellbook).toHaveBeenCalledWith({ name: 'New Spellbook' });
      });

      // Dialog should close after successful creation
      await waitFor(() => {
        expect(screen.queryByText('Create New Spellbook')).toBeNull();
      });
    });

    it('should trim whitespace from spellbook name', async () => {
      mockCreateSpellbook.mockResolvedValue(undefined);

      render(<SpellbookList {...defaultProps} />);

      // Open dialog
      fireEvent.click(screen.getByTestId('btn-create-spellbook'));

      // Enter name with whitespace
      const input = screen.getByTestId('spellbook-name-input');
      fireEvent.change(input, { target: { value: '  Spaced Name  ' } });

      // Submit
      fireEvent.click(screen.getByTestId('create-button'));

      await waitFor(() => {
        expect(mockCreateSpellbook).toHaveBeenCalledWith({ name: 'Spaced Name' });
      });
    });

    it('should show validation error when name is empty', async () => {
      render(<SpellbookList {...defaultProps} />);

      // Open dialog
      fireEvent.click(screen.getByTestId('btn-create-spellbook'));

      // Try to submit without entering a name
      fireEvent.click(screen.getByTestId('create-button'));

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Spellbook name is required')).toBeTruthy();
      });
    });

    it('should show validation error when name is only whitespace', async () => {
      render(<SpellbookList {...defaultProps} />);

      // Open dialog
      fireEvent.click(screen.getByTestId('btn-create-spellbook'));

      // Enter whitespace
      const input = screen.getByTestId('spellbook-name-input');
      fireEvent.change(input, { target: { value: '   ' } });

      // Try to submit
      fireEvent.click(screen.getByTestId('create-button'));

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Spellbook name is required')).toBeTruthy();
      });
    });

    it('should show error alert when creation fails', async () => {
      mockCreateSpellbook.mockRejectedValue(new Error('Database error'));

      render(<SpellbookList {...defaultProps} />);

      // Open dialog and create spellbook
      fireEvent.click(screen.getByTestId('btn-create-spellbook'));
      const input = screen.getByTestId('spellbook-name-input');
      fireEvent.change(input, { target: { value: 'Test' } });
      fireEvent.click(screen.getByTestId('create-button'));

      await waitFor(() => {
        // New modal shows error inline, not in a separate alert dialog
        expect(screen.getByText('Database error')).toBeTruthy();
      });
    });

    it('should show loading state while creating', async () => {
      // Create a promise we can control
      let resolveCreate: () => void;
      const createPromise = new Promise<void>((resolve) => {
        resolveCreate = resolve;
      });
      mockCreateSpellbook.mockReturnValue(createPromise);

      render(<SpellbookList {...defaultProps} />);

      // Open dialog and submit
      fireEvent.click(screen.getByTestId('btn-create-spellbook'));
      const input = screen.getByTestId('spellbook-name-input');
      fireEvent.change(input, { target: { value: 'Test' } });
      fireEvent.click(screen.getByTestId('create-button'));

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeTruthy();
      });

      // Resolve the promise
      resolveCreate!();

      await waitFor(() => {
        expect(screen.queryByText('Creating...')).toBeNull();
      });
    });
  });

  describe('Delete Spellbook Flow', () => {
    it('should show confirm dialog when delete button is clicked', () => {
      render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

      const deleteButton = screen.getByTestId('btn-delete-spellbook-spellbook-1');
      fireEvent.click(deleteButton);

      expect(screen.getByText('Delete Spellbook')).toBeTruthy();
      expect(screen.getByText('Delete spellbook "My First Spellbook"?')).toBeTruthy();
    });

    it('should not propagate click to spellbook row when delete is clicked', () => {
      render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

      const deleteButton = screen.getByTestId('btn-delete-spellbook-spellbook-1');
      fireEvent.click(deleteButton);

      expect(mockOnSpellbookClick).not.toHaveBeenCalled();
    });

    it('should delete spellbook when confirmed', async () => {
      mockDeleteSpellbook.mockResolvedValue(undefined);

      render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

      // Open confirm dialog
      fireEvent.click(screen.getByTestId('btn-delete-spellbook-spellbook-1'));

      // Confirm deletion - use testid to avoid ambiguity
      const confirmButton = screen.getByTestId('confirm-dialog-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockDeleteSpellbook).toHaveBeenCalledWith('spellbook-1');
      });
    });

    it('should close confirm dialog when cancelled', () => {
      render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

      // Open confirm dialog
      fireEvent.click(screen.getByTestId('btn-delete-spellbook-spellbook-1'));

      // Cancel - use testid to avoid ambiguity
      const cancelButton = screen.getByTestId('confirm-dialog-cancel');
      fireEvent.click(cancelButton);

      // Dialog should close
      expect(screen.queryByText('Delete Spellbook')).toBeNull();
    });
  });

  describe('Export Functionality', () => {
    it('should call exportImportService.downloadSpellbooks when export is clicked', async () => {
      vi.mocked(exportImportService.downloadSpellbooks).mockResolvedValue(undefined);

      render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

      const exportButton = screen.getByTestId('btn-export-spellbooks');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(exportImportService.downloadSpellbooks).toHaveBeenCalled();
      });
    });

    it('should show error alert when export fails', async () => {
      vi.mocked(exportImportService.downloadSpellbooks).mockRejectedValue(new Error('Export error'));

      render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

      const exportButton = screen.getByTestId('btn-export-spellbooks');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export Failed')).toBeTruthy();
        expect(screen.getByText('Failed to export spellbooks. Please try again.')).toBeTruthy();
      });
    });
  });

  describe('Import Functionality', () => {
    it('should trigger file input when import button is clicked', () => {
      render(<SpellbookList {...defaultProps} />);

      const fileInput = screen.getByTestId('file-input-import') as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, 'click');

      const importButton = screen.getByTestId('btn-import-spellbooks');
      fireEvent.click(importButton);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should import spellbooks successfully', async () => {
      const mockFileContent = '{"spellbooks": []}';
      const mockFile = {
        name: 'spellbooks.json',
        type: 'application/json',
        text: vi.fn().mockResolvedValue(mockFileContent),
      } as any;

      vi.mocked(exportImportService.importSpellbooks).mockResolvedValue({
        imported: 2,
        skipped: 0,
        errors: [],
      });

      render(<SpellbookList {...defaultProps} />);

      const fileInput = screen.getByTestId('file-input-import') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      await waitFor(() => {
        expect(exportImportService.importSpellbooks).toHaveBeenCalledWith(mockFileContent);
      });

      await waitFor(() => {
        expect(screen.getByText('Import Successful')).toBeTruthy();
        expect(screen.getByText(/Imported: 2/)).toBeTruthy();
        expect(screen.getByText(/Skipped: 0/)).toBeTruthy();
      });

      expect(mockRefreshSpellbooks).toHaveBeenCalled();
    });

    it('should show error alert when import fails', async () => {
      const mockFileContent = 'invalid json';
      const mockFile = {
        name: 'spellbooks.json',
        type: 'application/json',
        text: vi.fn().mockResolvedValue(mockFileContent),
      } as any;

      vi.mocked(exportImportService.importSpellbooks).mockRejectedValue(new Error('Invalid JSON'));

      render(<SpellbookList {...defaultProps} />);

      const fileInput = screen.getByTestId('file-input-import') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      await waitFor(() => {
        expect(screen.getByText('Import Failed')).toBeTruthy();
        expect(screen.getByText(/Failed to import spellbooks/)).toBeTruthy();
      });
    });

    it('should reset file input after import completes', async () => {
      const mockFileContent = '{"spellbooks": []}';
      const mockFile = {
        name: 'spellbooks.json',
        type: 'application/json',
        text: vi.fn().mockResolvedValue(mockFileContent),
      } as any;

      vi.mocked(exportImportService.importSpellbooks).mockResolvedValue({
        imported: 1,
        skipped: 0,
        errors: [],
      });

      render(<SpellbookList {...defaultProps} />);

      const fileInput = screen.getByTestId('file-input-import') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      await waitFor(() => {
        expect(fileInput.value).toBe('');
      });
    });

    it('should show loading state while importing', async () => {
      const mockFileContent = '{"spellbooks": []}';
      const mockFile = {
        name: 'spellbooks.json',
        type: 'application/json',
        text: vi.fn().mockResolvedValue(mockFileContent),
      } as any;

      // Create a promise we can control
      let resolveImport: () => void;
      const importPromise = new Promise<any>((resolve) => {
        resolveImport = resolve;
      });
      vi.mocked(exportImportService.importSpellbooks).mockReturnValue(importPromise);

      render(<SpellbookList {...defaultProps} />);

      const fileInput = screen.getByTestId('file-input-import') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Importing...')).toBeTruthy();
      });

      // Resolve the promise
      resolveImport!({ imported: 1, skipped: 0, errors: [] });

      await waitFor(() => {
        expect(screen.queryByText('Importing...')).toBeNull();
      });
    });

    it('should do nothing when no file is selected', () => {
      render(<SpellbookList {...defaultProps} />);

      const fileInput = screen.getByTestId('file-input-import') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [] } });

      expect(exportImportService.importSpellbooks).not.toHaveBeenCalled();
    });
  });

  describe('Dialog State Management', () => {
    it('should clear input when create dialog is cancelled', () => {
      render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

      // Open dialog and enter text
      fireEvent.click(screen.getByTestId('btn-create-spellbook'));
      const input = screen.getByTestId('spellbook-name-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Test Name' } });

      // Cancel
      fireEvent.click(screen.getByText('Cancel'));

      // Reopen dialog - input should be empty
      fireEvent.click(screen.getByTestId('btn-create-spellbook'));
      const newInput = screen.getByTestId('spellbook-name-input') as HTMLInputElement;
      expect(newInput.value).toBe('');
    });
  });

  describe('Table Layout', () => {
    it('should render spellbooks as a table', () => {
      render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

      const table = screen.getByTestId('spellbooks-table');
      expect(table).toBeTruthy();
      expect(table.tagName).toBe('TABLE');
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

      const naElements = screen.getAllByText('N/A');
      expect(naElements.length).toBeGreaterThanOrEqual(3); // Ability, Attack, Save DC
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
  });

  describe('Copy Spellbook', () => {
    it('should render copy button in actions column', () => {
      render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

      const copyButtons = screen.getAllByText('Copy');
      expect(copyButtons.length).toBe(2);
    });

    it('should open create modal with pre-filled data when copy is clicked', async () => {
      render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

      const copyButton = screen.getByTestId('btn-copy-spellbook-spellbook-1');
      fireEvent.click(copyButton);

      // Modal should open with pre-filled data from first spellbook
      await waitFor(() => {
        const nameInput = screen.getByTestId('spellbook-name-input') as HTMLInputElement;
        expect(nameInput.value).toBe('My First Spellbook (Copy)');
      });

      // Check spellcasting ability is pre-selected
      const intButton = screen.getByTestId('ability-int');
      expect(intButton).toHaveClass('active');

      // Check attack modifier and save DC are pre-filled
      const attackInput = screen.getByTestId('attack-modifier-input') as HTMLInputElement;
      const saveDCInput = screen.getByTestId('save-dc-input') as HTMLInputElement;
      expect(attackInput.value).toBe('7');
      expect(saveDCInput.value).toBe('15');
    });

    it('should not trigger row click when copy button is clicked', () => {
      render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

      const copyButtons = screen.getAllByTestId(/btn-copy-spellbook-/);
      fireEvent.click(copyButtons[0]);

      expect(mockOnSpellbookClick).not.toHaveBeenCalled();
    });

    it('should allow creating a new spellbook with copied data and unique name', async () => {
      mockCreateSpellbook.mockResolvedValue(undefined);

      render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

      const copyButton = screen.getByTestId('btn-copy-spellbook-spellbook-1');
      fireEvent.click(copyButton);

      // Change the name to be unique
      await waitFor(() => {
        const nameInput = screen.getByTestId('spellbook-name-input') as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: 'My Copied Spellbook' } });
      });

      const createButton = screen.getByTestId('create-button');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockCreateSpellbook).toHaveBeenCalledWith({
          name: 'My Copied Spellbook',
          spellcastingAbility: 'INT',
          spellAttackModifier: 7,
          spellSaveDC: 15,
        });
      });
    });

    it('should copy all spells from the source spellbook', async () => {
      const newSpellbookId = 'new-spellbook-123';
      mockCreateSpellbook.mockResolvedValue({ id: newSpellbookId });
      mockAddSpellToSpellbook.mockResolvedValue(undefined);

      render(<SpellbookList {...defaultProps} spellbooks={mockSpellbooks} />);

      const copyButton = screen.getByTestId('btn-copy-spellbook-spellbook-1');
      fireEvent.click(copyButton); // Copy first spellbook with 2 spells

      // Change the name to be unique
      await waitFor(() => {
        const nameInput = screen.getByTestId('spellbook-name-input') as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: 'My Copied Spellbook' } });
      });

      const createButton = screen.getByTestId('create-button');
      fireEvent.click(createButton);

      // Verify all spells were copied
      await waitFor(() => {
        expect(mockAddSpellToSpellbook).toHaveBeenCalledTimes(2);
        expect(mockAddSpellToSpellbook).toHaveBeenCalledWith(newSpellbookId, 'spell-1');
        expect(mockAddSpellToSpellbook).toHaveBeenCalledWith(newSpellbookId, 'spell-2');
      });
    });
  });
});
