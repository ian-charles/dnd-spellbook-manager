/**
 * AlertDialog Component Tests
 *
 * Tests for the custom alert dialog.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlertDialog } from './AlertDialog';

describe('AlertDialog', () => {
  const mockOnClose = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render null when isOpen is false', () => {
      const { container } = render(
        <AlertDialog
          isOpen={false}
          title="Test Title"
          message="Test message"
          onClose={mockOnClose}
        />
      );

      expect(container.querySelector('.alert-dialog-overlay')).toBeNull();
    });

    it('should render dialog when isOpen is true', () => {
      render(
        <AlertDialog
          isOpen={true}
          title="Test Title"
          message="Test message"
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('alert-dialog-overlay')).toBeTruthy();
      expect(screen.getByText('Test Title')).toBeTruthy();
      expect(screen.getByText('Test message')).toBeTruthy();
    });

    it('should display custom close label', () => {
      render(
        <AlertDialog
          isOpen={true}
          title="Test"
          message="Message"
          closeLabel="Got It"
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Got It')).toBeTruthy();
    });

    it('should use default OK label when not provided', () => {
      render(
        <AlertDialog
          isOpen={true}
          title="Test"
          message="Message"
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('OK')).toBeTruthy();
    });

    it('should apply error variant class', () => {
      const { container } = render(
        <AlertDialog
          isOpen={true}
          title="Test"
          message="Message"
          variant="error"
          onClose={mockOnClose}
        />
      );

      expect(container.querySelector('.alert-dialog-error')).toBeTruthy();
    });

    it('should apply success variant class', () => {
      const { container } = render(
        <AlertDialog
          isOpen={true}
          title="Test"
          message="Message"
          variant="success"
          onClose={mockOnClose}
        />
      );

      expect(container.querySelector('.alert-dialog-success')).toBeTruthy();
    });

    it('should apply warning variant class', () => {
      const { container } = render(
        <AlertDialog
          isOpen={true}
          title="Test"
          message="Message"
          variant="warning"
          onClose={mockOnClose}
        />
      );

      expect(container.querySelector('.alert-dialog-warning')).toBeTruthy();
    });

    it('should apply info variant class by default', () => {
      const { container } = render(
        <AlertDialog
          isOpen={true}
          title="Test"
          message="Message"
          onClose={mockOnClose}
        />
      );

      expect(container.querySelector('.alert-dialog-info')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when close button clicked', () => {
      render(
        <AlertDialog
          isOpen={true}
          title="Test"
          message="Message"
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByTestId('alert-dialog-close'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when overlay clicked', () => {
      render(
        <AlertDialog
          isOpen={true}
          title="Test"
          message="Message"
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByTestId('alert-dialog-overlay'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when dialog content clicked', () => {
      render(
        <AlertDialog
          isOpen={true}
          title="Test"
          message="Message"
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText('Test'));
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should call onClose when Escape key pressed', () => {
      render(
        <AlertDialog
          isOpen={true}
          title="Test"
          message="Message"
          onClose={mockOnClose}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Enter key pressed', () => {
      render(
        <AlertDialog
          isOpen={true}
          title="Test"
          message="Message"
          onClose={mockOnClose}
        />
      );

      fireEvent.keyDown(window, { key: 'Enter' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not respond to keyboard when closed', () => {
      render(
        <AlertDialog
          isOpen={false}
          title="Test"
          message="Message"
          onClose={mockOnClose}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      fireEvent.keyDown(window, { key: 'Enter' });
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <AlertDialog
          isOpen={true}
          title="Error"
          message="Something went wrong"
          variant="error"
          onClose={mockOnClose}
        />
      );

      const dialog = screen.getByTestId('alert-dialog-overlay');
      expect(dialog.getAttribute('role')).toBe('alertdialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.getAttribute('aria-labelledby')).toBe('alert-dialog-title');
      expect(dialog.getAttribute('aria-describedby')).toBe('alert-dialog-message');
    });
  });

  describe('Message Formatting', () => {
    it('should preserve line breaks in message', () => {
      render(
        <AlertDialog
          isOpen={true}
          title="Import Results"
          message="Imported: 5\nSkipped: 2\nErrors: 0"
          onClose={mockOnClose}
        />
      );

      const message = screen.getByText(/Imported: 5/);
      expect(message.textContent).toContain('Imported: 5');
      expect(message.textContent).toContain('Skipped: 2');
      expect(message.textContent).toContain('Errors: 0');
    });
  });
});
