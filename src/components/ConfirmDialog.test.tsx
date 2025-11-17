/**
 * ConfirmDialog Component Tests
 *
 * Tests for the custom confirmation dialog.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render null when isOpen is false', () => {
      const { container } = render(
        <ConfirmDialog
          isOpen={false}
          title="Test Title"
          message="Test message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(container.querySelector('.confirm-dialog-overlay')).toBeNull();
    });

    it('should render dialog when isOpen is true', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Test Title"
          message="Test message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('confirm-dialog-overlay')).toBeTruthy();
      expect(screen.getByText('Test Title')).toBeTruthy();
      expect(screen.getByText('Test message')).toBeTruthy();
    });

    it('should display custom confirm and cancel labels', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Test"
          message="Message"
          confirmLabel="Delete"
          cancelLabel="Nevermind"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Delete')).toBeTruthy();
      expect(screen.getByText('Nevermind')).toBeTruthy();
    });

    it('should use default labels when not provided', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Confirm')).toBeTruthy();
      expect(screen.getByText('Cancel')).toBeTruthy();
    });

    it('should apply danger variant class', () => {
      const { container } = render(
        <ConfirmDialog
          isOpen={true}
          title="Test"
          message="Message"
          variant="danger"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(container.querySelector('.confirm-dialog-danger')).toBeTruthy();
    });

    it('should apply warning variant class by default', () => {
      const { container } = render(
        <ConfirmDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(container.querySelector('.confirm-dialog-warning')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should call onConfirm when confirm button clicked', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByTestId('confirm-dialog-confirm'));
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    it('should call onCancel when cancel button clicked', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByTestId('confirm-dialog-cancel'));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('should call onCancel when overlay clicked', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByTestId('confirm-dialog-overlay'));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call onCancel when dialog content clicked', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByText('Test'));
      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should call onCancel when Escape key pressed', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onConfirm when Enter key pressed', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.keyDown(window, { key: 'Enter' });
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should not respond to keyboard when closed', () => {
      render(
        <ConfirmDialog
          isOpen={false}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      fireEvent.keyDown(window, { key: 'Enter' });
      expect(mockOnCancel).not.toHaveBeenCalled();
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Confirm Delete"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const dialog = screen.getByTestId('confirm-dialog-overlay');
      expect(dialog.getAttribute('role')).toBe('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.getAttribute('aria-labelledby')).toBe('confirm-dialog-title');
      expect(dialog.getAttribute('aria-describedby')).toBe('confirm-dialog-message');
    });
  });
});
