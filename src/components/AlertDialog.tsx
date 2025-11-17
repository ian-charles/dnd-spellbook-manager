/**
 * AlertDialog Component
 *
 * Custom alert dialog to replace browser alert().
 * Provides better UX, consistent styling, and accessibility.
 *
 * Features:
 * - Keyboard navigation (Escape or Enter to close)
 * - Customizable title and message
 * - Multiple variants (error, success, warning, info)
 * - Overlay click to close
 * - Dark mode support via CSS variables
 */

import { useEffect } from 'react';
import './AlertDialog.css';

export interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  variant?: 'error' | 'success' | 'warning' | 'info';
  closeLabel?: string;
  onClose: () => void;
}

export function AlertDialog({
  isOpen,
  title,
  message,
  variant = 'info',
  closeLabel = 'OK',
  onClose,
}: AlertDialogProps) {
  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the overlay itself, not the dialog content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="alert-dialog-overlay"
      onClick={handleOverlayClick}
      data-testid="alert-dialog-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-message"
    >
      <div className={`alert-dialog alert-dialog-${variant}`}>
        <div className="alert-dialog-header">
          <h3 id="alert-dialog-title" className="alert-dialog-title">
            {title}
          </h3>
        </div>

        <div className="alert-dialog-body">
          <p id="alert-dialog-message" className="alert-dialog-message">
            {message}
          </p>
        </div>

        <div className="alert-dialog-footer">
          <button
            className={`btn-primary btn-${variant}`}
            onClick={onClose}
            data-testid="alert-dialog-close"
            autoFocus
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
