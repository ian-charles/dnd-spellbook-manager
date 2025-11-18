/**
 * LoadingButton Component
 *
 * Reusable button that shows a loading spinner and loading text when in loading state.
 * Eliminates duplication of inline loading JSX pattern across the codebase.
 */

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Whether the button is in loading state.
   * When true, the button is disabled and displays loadingText with a spinner.
   * The children content is hidden during loading state.
   */
  loading: boolean;
  /**
   * Text to display when the button is in loading state.
   * This text replaces the children and is shown alongside a spinner.
   * Only visible when loading is true.
   */
  loadingText: string;
  /**
   * Content to display when the button is not loading.
   * This is hidden and replaced by loadingText when loading is true.
   */
  children: React.ReactNode;
}

export function LoadingButton({
  loading,
  loadingText,
  children,
  disabled,
  ...rest
}: LoadingButtonProps) {
  return (
    <button {...rest} disabled={disabled || loading}>
      {loading ? (
        <>
          <LoadingSpinner size="small" inline /> {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
