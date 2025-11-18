/**
 * LoadingButton Component
 *
 * Reusable button that shows a loading spinner and loading text when in loading state.
 * Eliminates duplication of inline loading JSX pattern across the codebase.
 */

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether the button is in loading state */
  loading: boolean;
  /** Text to display when loading */
  loadingText: string;
  /** Children to display when not loading */
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
