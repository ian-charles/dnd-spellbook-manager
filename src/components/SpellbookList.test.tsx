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
import * as useSpellbooksModule from '../hooks/useSpellbooks';
import { exportImportService } from '../services/exportImport.service';

// Mock the useSpellbooks hook
vi.mock('../hooks/useSpellbooks');

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

  const mockSpellbooks = [
    {
      id: 'spellbook-1',
      name: 'My First Spellbook',
      spells: [
        { spellId: 'spell-1', prepared: true, notes: '' },
        { spellId: 'spell-2', prepared: false, notes: '' },
      ],
    },
    {
      id: 'spellbook-2',
      name: 'Adventure Spells',
      spells: [
        { spellId: 'spell-3', prepared: true, notes: '' },
      ],
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
      vi.spyOn(useSpellbooksModule, 'useSpellbooks').mockReturnValue({
        spellbooks: [],
        loading: true,
        createSpellbook: mockCreateSpellbook,
        deleteSpellbook: mockDeleteSpellbook,
        refreshSpellbooks: mockRefreshSpellbooks,
      });

      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

      expect(screen.getByTestId('spellbooks-header')).toHaveTextContent('My Spellbooks');
      expect(screen.getByText('Loading spellbooks...')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    beforeEach(() => {
      vi.spyOn(useSpellbooksModule, 'useSpellbooks').mockReturnValue({
        spellbooks: [],
        loading: false,
        createSpellbook: mockCreateSpellbook,
        deleteSpellbook: mockDeleteSpellbook,
        refreshSpellbooks: mockRefreshSpellbooks,
      });
    });

    it('should render empty state when no spellbooks exist', () => {
      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

      expect(screen.getByTestId('spellbooks-empty')).toBeTruthy();
      expect(screen.getByText("You don't have any spellbooks yet.")).toBeTruthy();
      expect(screen.getByText('Click "New Spellbook" to create your first one!')).toBeTruthy();
    });

    it('should disable export button when no spellbooks exist', () => {
      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

      const exportButton = screen.getByTestId('btn-export-spellbooks');
      expect(exportButton).toBeDisabled();
    });
  });

  describe('Spellbook List Rendering', () => {
    beforeEach(() => {
      vi.spyOn(useSpellbooksModule, 'useSpellbooks').mockReturnValue({
        spellbooks: mockSpellbooks,
        loading: false,
        createSpellbook: mockCreateSpellbook,
        deleteSpellbook: mockDeleteSpellbook,
        refreshSpellbooks: mockRefreshSpellbooks,
      });
    });

    it('should render list of spellbooks with correct data', () => {
      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

      expect(screen.getByText('My First Spellbook')).toBeTruthy();
      expect(screen.getByText('Adventure Spells')).toBeTruthy();
      expect(screen.getByText('2 spells')).toBeTruthy();
      expect(screen.getByText('1 spell')).toBeTruthy();
    });

    it('should render prepared count for each spellbook', () => {
      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

      const preparedTexts = screen.getAllByText(/prepared/);
      expect(preparedTexts).toHaveLength(2);
      expect(preparedTexts[0]).toHaveTextContent('1 prepared');
      expect(preparedTexts[1]).toHaveTextContent('1 prepared');
    });

    it('should call onSpellbookClick when spellbook card is clicked', () => {
      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

      const spellbookCard = screen.getByTestId('spellbook-item-spellbook-1');
      const cardContent = spellbookCard.querySelector('.spellbook-card-content');
      fireEvent.click(cardContent!);

      expect(mockOnSpellbookClick).toHaveBeenCalledWith('spellbook-1');
      expect(mockOnSpellbookClick).toHaveBeenCalledTimes(1);
    });

    it('should enable export button when spellbooks exist', () => {
      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

      const exportButton = screen.getByTestId('btn-export-spellbooks');
      expect(exportButton).not.toBeDisabled();
    });
  });

  describe('Create Spellbook Flow', () => {
    beforeEach(() => {
      vi.spyOn(useSpellbooksModule, 'useSpellbooks').mockReturnValue({
        spellbooks: [],
        loading: false,
        createSpellbook: mockCreateSpellbook,
        deleteSpellbook: mockDeleteSpellbook,
        refreshSpellbooks: mockRefreshSpellbooks,
      });
    });

    it('should open create dialog when New Spellbook button is clicked', () => {
      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

      const createButton = screen.getByTestId('btn-create-spellbook');
      fireEvent.click(createButton);

      expect(screen.getByText('Create New Spellbook')).toBeTruthy();
      expect(screen.getByTestId('spellbook-name-input')).toBeTruthy();
    });

    it('should close dialog when Cancel button is clicked', () => {
      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

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

      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

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

      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

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
      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

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
      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

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

      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

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

      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

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
    beforeEach(() => {
      vi.spyOn(useSpellbooksModule, 'useSpellbooks').mockReturnValue({
        spellbooks: mockSpellbooks,
        loading: false,
        createSpellbook: mockCreateSpellbook,
        deleteSpellbook: mockDeleteSpellbook,
        refreshSpellbooks: mockRefreshSpellbooks,
      });
    });

    it('should show confirm dialog when delete button is clicked', () => {
      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

      const deleteButton = screen.getByTestId('btn-delete-spellbook-spellbook-1');
      fireEvent.click(deleteButton);

      expect(screen.getByText('Delete Spellbook')).toBeTruthy();
      expect(screen.getByText('Delete spellbook "My First Spellbook"?')).toBeTruthy();
    });

    it('should not propagate click to spellbook card when delete is clicked', () => {
      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

      const deleteButton = screen.getByTestId('btn-delete-spellbook-spellbook-1');
      fireEvent.click(deleteButton);

      expect(mockOnSpellbookClick).not.toHaveBeenCalled();
    });

    it('should delete spellbook when confirmed', async () => {
      mockDeleteSpellbook.mockResolvedValue(undefined);

      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

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
      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

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
    beforeEach(() => {
      vi.spyOn(useSpellbooksModule, 'useSpellbooks').mockReturnValue({
        spellbooks: mockSpellbooks,
        loading: false,
        createSpellbook: mockCreateSpellbook,
        deleteSpellbook: mockDeleteSpellbook,
        refreshSpellbooks: mockRefreshSpellbooks,
      });
    });

    it('should call exportImportService.downloadSpellbooks when export is clicked', async () => {
      vi.mocked(exportImportService.downloadSpellbooks).mockResolvedValue(undefined);

      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

      const exportButton = screen.getByTestId('btn-export-spellbooks');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(exportImportService.downloadSpellbooks).toHaveBeenCalled();
      });
    });

    it('should show error alert when export fails', async () => {
      vi.mocked(exportImportService.downloadSpellbooks).mockRejectedValue(new Error('Export error'));

      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

      const exportButton = screen.getByTestId('btn-export-spellbooks');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export Failed')).toBeTruthy();
        expect(screen.getByText('Failed to export spellbooks. Please try again.')).toBeTruthy();
      });
    });
  });

  describe('Import Functionality', () => {
    beforeEach(() => {
      vi.spyOn(useSpellbooksModule, 'useSpellbooks').mockReturnValue({
        spellbooks: [],
        loading: false,
        createSpellbook: mockCreateSpellbook,
        deleteSpellbook: mockDeleteSpellbook,
        refreshSpellbooks: mockRefreshSpellbooks,
      });
    });

    it('should trigger file input when import button is clicked', () => {
      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

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

      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

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

      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

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

      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

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

      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

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
      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

      const fileInput = screen.getByTestId('file-input-import') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [] } });

      expect(exportImportService.importSpellbooks).not.toHaveBeenCalled();
    });
  });

  describe('Dialog State Management', () => {
    beforeEach(() => {
      vi.spyOn(useSpellbooksModule, 'useSpellbooks').mockReturnValue({
        spellbooks: mockSpellbooks,
        loading: false,
        createSpellbook: mockCreateSpellbook,
        deleteSpellbook: mockDeleteSpellbook,
        refreshSpellbooks: mockRefreshSpellbooks,
      });
    });

    it('should clear input when create dialog is cancelled', () => {
      render(<SpellbookList onSpellbookClick={mockOnSpellbookClick} />);

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
});
